module.exports = function (app, db, post) {
    var ObjectID = require('mongodb').ObjectID;
    var tutorCheckHistoryDB = db.collection('tutorCheckHistory');
    var tutorCheckPendingDB = db.collection('tutorCheckPending');

    function isLocal(req) {
        var index = req.ip.match(/\d/);
        var ipAddress = req.ip.substring(index.index, req.ip.length);
        if (ipAddress.substring(0, 7) === '192.168' || ipAddress === '125.25.54.23') {
            return true;
        }
        return false;
    }

    post('/post/v1/tutorCheckIn', function (req, res) {
        if (!req.body.tutorID) {
            return res.status(401).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (isLocal(req)) {
            return res.status(401).send({
                err: 0,
                msg: 'Unauthorize network'
            });
        }
        tutorCheckPendingDB.insertOne({
            _id: parseInt(req.body.tutorID),
            checkIn: new Date()
        }, function (err, result) {
            if (err) {
                return res.status(202).send(err);
            }
            res.status(201).send({
                msg: 'OK'
            });
        });
    });

    post('/post/v1/getPendingTutorCheckIn', function (req, res) {
        if (!req.body.tutorID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (isLocal(req)) {
            return res.status(401).send({
                err: 0,
                msg: 'Unauthorize network'
            });
        }

        tutorCheckPendingDB.findOne({
            _id: parseInt(req.body.tutorID)
        }).then(data => {
            if (!data) {
                return res.status(404).send({
                    err: 404,
                    msg: 'Not Found'
                });
            }
            delete data._id;
            res.status(200).send(data);
        });
    });

    post('/post/v1/tutorCheckOut', function (req, res) {
        if (!req.body.tutorID || !req.body.slot0 || !req.body.slot1 || !req.body.slot2 || !req.body.slot3 || !req.body.slot4 || !req.body.slot5) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (isLocal(req)) {
            return res.status(400).send({
                err: 0,
                msg: 'Unauthorize network'
            });
        }

        var slot = [parseInt(req.body.slot0),
        parseInt(req.body.slot1),
        parseInt(req.body.slot2),
        parseInt(req.body.slot3),
        parseInt(req.body.slot4),
        parseInt(req.body.slot5)];

        tutorCheckPendingDB.findOne({
            _id: parseInt(req.body.tutorID)
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
                res.status(200).send({
                    msg: 'OK'
                });
            });
            tutorCheckPendingDB.remove({
                _id: parseInt(req.body.tutorID)
            })
        });
    });
}