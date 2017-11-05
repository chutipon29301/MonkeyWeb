module.exports = function (app, db, post) {
    var ObjectID = require('mongodb').ObjectID;
    var tutorCheckHistoryDB = db.collection('tutorCheckHistory');
    var tutorCheckPendingDB = db.collection('tutorCheckPending');

    post('/post/v1/tutorCheckIn', function (req, res) {
        if (!req.body.tutorID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        tutorCheckPendingDB.insertOne({
            _id: parseInt(req.body.tutorID),
            checkIn: new Date()
        }, function (err, result) {
            if (err) {
                return res.status(202).send(err);
            }
            res.status(201).send('OK');
        });
    });

    post('/post/v1/getPendingTutorCheckIn', function (req, res) {
        if (!req.body.tutorID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        tutorCheckPendingDB.findOne({
            _id: parseInt(req.body.tutorID)
        }).then(data => {
            if (!data) {
                return res.status(404).send('Not Found');
            }
            data.pendingID = data._id;
            delete data._id;
            res.status(200).send(data);
        });
    });

    post('/post/v1/tutorCheckOut', function (req, res) {
        if (!req.body.pendingID || !req.body.slot0 || !req.body.slot1 || !req.body.slot2 || !req.body.slot3 || !req.body.slot4 || !req.body.slot5) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        var slot = [parseInt(req.body.slot0),
        parseInt(req.body.slot1),
        parseInt(req.body.slot2),
        parseInt(req.body.slot3),
        parseInt(req.body.slot4),
        parseInt(req.body.slot5)];

        tutorCheckPendingDB.findOne({
            _id: parseInt(req.body.pendingID)
        }).then(data => {
            if (data == null) {
                return res.status(404).send({
                    err: 0,
                    msg: 'No check in history found'
                });
            }
            tutorCheckHistoryDB.insertOne({
                tutorID: data._id,
                checkIn: data.checkIn,
                checkOut: new Date(),
                detail: slot
            }, function (err, result) {
                if (err) {
                    return res.status(202).send(err);
                }
                res.status(200).send('OK');
            });
            tutorCheckPendingDB.remove({
                _id: parseInt(req.body.pendingID)
            })
        });
    });
}