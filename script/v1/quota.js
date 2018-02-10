var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {
    var quotaDB = db.collection('quota');
    var configDB = db.collection('config');

    post('/post/v1/addQuota', function (req, res) {
        if (!(req.body.studentID && req.body.subject)) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var quarterID;
            if (req.body.quarterID) {
                quarterID = parseInt(req.body.quarterID);
            } else {
                quarter = config.defaultQuarter.quarter.quarter;
                year = config.defaultQuarter.quarter.year;
                quarter += '';
                if (quarter.length < 2) {
                    quarter = '0' + quarter;
                }
                quarterID = year + quarter;
            }
            quotaDB.insertOne({
                studentID: parseInt(req.body.studentID),
                subject: req.body.subject,
                timestamp: new Date(),
                quarterID: parseInt(quarterID)
            }).then(_ => {
                res.status(200).send({
                    msg: 'OK'
                });
            });
        });
    });

    post('/post/v1/deleteQuota', function (req, res) {
        if (!req.body.quotaID) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }

        quotaDB.deleteOne({
            _id: ObjectID(req.body.quotaID)
        }).then(_ => {
            res.status(200).send({
                msg: 'OK'
            });
        });
    });

    post('/post/v1/listQuota', function (req, res) {
        if (!(req.body.studentID && req.body.subject)) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var quarterID;
            if (req.body.quarterID) {
                quarterID = parseInt(req.body.quarterID);
            } else {
                quarter = config.defaultQuarter.quarter.quarter;
                year = config.defaultQuarter.quarter.year;
                quarter += '';
                if (quarter.length < 2) {
                    quarter = '0' + quarter;
                }
                quarterID = year + quarter;
            }
            quotaDB.find({
                studentID: parseInt(req.body.studentID),
                quarterID: parseInt(quarterID),
                subject: req.body.subject
            }).toArray().then(quota => {
                res.status(200).send({
                    quotaCount: quota.length
                });
            });
        });
    });
}