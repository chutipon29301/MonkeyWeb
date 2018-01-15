var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {

    var attendanceDB = db.collection('attendance');
    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');
    var courseDB = db.collection('course');
    var configDB = db.collection('config');
    var userDB = db.collection('user');
    var attendanceDocumentDB = db.collection('attendanceDocument');

    const NONE = 0;
    const ABSENT = 1;
    const PRESENT = 2;

    post('/post/v1/addStudentAbsent', function (req, res) {
        if (!(req.body.userID && req.body.date && (req.body.courseID || req.body.hybridID) && req.body.reason && req.body.sender)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (req.body.courseID) {
            attendanceDB.insertOne({
                timestamp: new Date(),
                userID: parseInt(req.body.userID),
                courseID: req.body.courseID,
                hybridID: NONE,
                date: parseInt(req.body.date),
                type: ABSENT,
                reason: req.body.reason,
                sender: req.body.sender
            }).then(data => {
                return res.status(200).send(data.ops[0]._id);
            });
        } else if (req.body.hybridID) {
            attendanceDB.insertOne({
                timestamp: new Date(),
                userID: parseInt(req.body.userID),
                courseID: NONE,
                hybridID: req.body.hybridID,
                date: parseInt(req.body.date),
                type: ABSENT,
                reason: req.body.reason,
                sender: req.body.sender
            }).then(data => {
                return res.status(200).send(data.ops[0]._id);
            });
        }
    });

    post('/post/v1/addStudentPresent', function (req, res) {
        if (!(req.body.userID && req.body.date && (req.body.courseID || (req.body.hybridID && req.body.subject)) && req.body.sender)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (req.body.courseID) {
            attendanceDB.insertOne({
                timestamp: new Date(),
                userID: parseInt(req.body.userID),
                courseID: req.body.courseID,
                hybridID: NONE,
                date: parseInt(req.body.date),
                type: PRESENT,
                sender: req.body.sender
            });
        } else if (req.body.hybridID && req.body.subject) {
            attendanceDB.insertOne({
                timestamp: new Date(),
                userID: parseInt(req.body.userID),
                courseID: NONE,
                hybridID: req.body.hybridID,
                date: parseInt(req.body.date),
                type: PRESENT,
                sender: req.body.sender,
                subject: req.body.subject
            });
        }
        res.status(200).send('OK');
    });

    post('/post/v1/listAttendance', function (req, res) {
        if (!((req.body.startDate && req.body.endDate) || req.body.date || (req.body.studentStartDate && req.body.studentEndDate && req.body.studentID))) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        var responseAttandance = (query) => {
            var listAttandance = attendanceDB.find(query, {
                sort: {
                    timestamp: -1
                }
            }).toArray();

            Promise.all([
                listAttandance,
                listAttandance.then(results => {
                    return Promise.all(results.map(result => {
                        return attendanceDocumentDB.findOne({
                            attendanceID: '' + result._id
                        });
                    }));
                })
            ]).then(results => {
                var responseArray = [];
                for (let i = 0; i < results[0].length; i++) {
                    var responseObject = results[0][i];
                    responseObject.timestamp = new Date(responseObject.timestamp).valueOf();
                    responseObject.attendanceID = responseObject._id;
                    responseObject.date = new Date(responseObject.date).valueOf();
                    if (results[1][i] !== null) {
                        responseObject.link = 'https://www.monkey-monkey.com/get/v1/attendanceDocument?k=' + results[1][i]._id;
                    }
                    delete responseObject._id;
                    responseArray.push(responseObject);
                }
                res.status(200).send(responseArray);
            });
        }

        if (req.body.startDate && req.body.endDate) {
            responseAttandance({
                timestamp: {
                    $gte: new Date(parseInt(req.body.startDate)),
                    $lte: new Date(parseInt(req.body.endDate))
                }
            });
        } else if (req.body.date) {
            var requestDate = new Date(parseInt(req.body.date));
            var startQueryDate = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
            var endQueryDate = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate() + 1);

            responseAttandance({
                date: {
                    $gte: startQueryDate.valueOf(),
                    $lte: endQueryDate.valueOf()
                }
            });
        } else if (req.body.studentStartDate && req.body.studentEndDate && req.body.studentID) {
            responseAttandance({
                date: {
                    $gte: parseInt(req.body.studentStartDate),
                    $lte: parseInt(req.body.studentEndDate)
                },
                userID: parseInt(req.body.studentID)
            });
        }
    });

    post('/post/v1/deleteAttendance', function (req, res) {
        if (!req.body.attendanceID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        attendanceDB.deleteOne({
            _id: ObjectID(req.body.attendanceID)
        }, (err, result) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(200).send('OK');
        });
    });

    post('/post/v1/setAttendanceRemark', function (req, res) {
        if (!(req.body.attendanceID && req.body.remark)) {
            return res.status(200).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var newValue = {
            $set: {}
        }
        newValue.$set.remark = req.body.remark;
        attendanceDB.updateOne({
            _id: ObjectID(req.body.attendanceID)
        }, newValue, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: -1,
                    errInfo: err
                });
            }
            res.status(200).send('OK');
        });
    });

    post('/post/v1/resetAttendanceRemark', function (req, res) {
        attendanceDB.updateMany({}, {
            $set: {
                remark: ''
            }
        }, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: -1,
                    errInfo: err
                });
            }
            res.status(200).send('OK');
        });
    });
    post('/post/v1/updateStudentRegistrationState', function (req, res) {
        if (!(req.body.studentID && req.body.quarter && req.body.year && req.body.registrationState && req.body.subRegistrationState)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        userDB.findOne({
            _id: parseInt(req.body.studentID)
        }).then(data => {
            let index = data.student.quarter.findIndex(x => x.year === parseInt(req.body.year) && x.quarter === parseInt(req.body.quarter));
            if (index === -1) {
                return res.status(404).send({
                    err: 404,
                    msg: 'Year or quarter not found'
                });
            }
            var stateObject = data.student.quarter;
            stateObject[index].registrationState = req.body.registrationState;
            stateObject[index].subRegistrationState = req.body.subRegistrationState;
            userDB.updateOne({
                _id: parseInt(req.body.studentID)
            }, {
                $set: {
                    'student.quarter': stateObject
                }
            }).then(result => {
                return res.status(200).send('OK');
            });
        });
    });

    post('/post/v1/getRegistrationState', function (req, res) {
        if (!(req.body.studentID && req.body.quarter && req.body.year)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        userDB.findOne({
            _id: parseInt(req.body.studentID)
        }).then(data => {
            if (data === null) {
                return res.status(400).send({
                    err: -1,
                    msg: 'StudentID not found'
                });
            }
            let index = data.student.quarter.findIndex(x => x.year === parseInt(req.body.year) && x.quarter === parseInt(req.body.quarter));
            if (index === -1) {
                return res.status(200).send({
                    registrationState: 'unregistered',
                    subRegistrationState: '-'
                });
            }
            var object = data.student.quarter[index];
            delete object.year;
            delete object.quarter;
            res.status(200).send(object);
        });
    });

    post('/post/v1/setRemark', function (req, res) {
        if (!(req.body.studentID && req.body.remark)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var newValue = {
            $set: {}
        };
        newValue.$set.remark = req.body.remark;
        userDB.updateOne({
            _id: parseInt(req.body.studentID)
        }, newValue, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: -1,
                    errInfo: err
                });
            }
            res.status(200).send('OK');
        });
    });

    post('/post/v1/resetRemark', function (req, res) {
        userDB.updateMany({}, {
            $set: {
                remark: ''
            }
        }, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: -1,
                    errInfo: err
                });
            }
            res.status(200).send('OK');
        });
    });
}