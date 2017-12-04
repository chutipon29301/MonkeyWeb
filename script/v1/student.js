var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {

    var attendanceDB = db.collection('attendance');
    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');
    var courseDB = db.collection('course');
    var configDB = db.collection('config');
    var userDB = db.collection('user');

    const NONE = 0;
    const ABSENT = 1;
    const PRESENT = 2;

    post('post/v1/addStudentAbsent', function (req, res) {
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
                date: req.body.date,
                type: ABSENT,
                reason: req.body.reason,
                sender: req.body.sender
            });
        } else if (req.body.hybridID) {
            attendanceDB.insertOne({
                timestamp: new Date(),
                userID: parseInt(req.body.userID),
                courseID: NONE,
                hybridID: req.body.hybridID,
                date: req.body.date,
                type: ABSENT,
                reason: req.body.reason,
                sender: req.body.sender
            });
        }
        res.status(200).send('OK');
    });

    post('/post/v1/addStudentPresent', function (req, res) {
        if (!(req.body.userID && req.body.date && (req.body.courseID || req.body.hybridID) && req.body.sender)) {
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
                date: req.body.date,
                type: PRESENT,
                sender: req.body.sender
            });
        } else if (req.body.hybridID) {
            attendanceDB.insertOne({
                timestamp: new Date(),
                userID: parseInt(req.body.userID),
                courseID: NONE,
                hybridID: req.body.hybridID,
                date: req.body.date,
                type: PRESENT,
                sender: req.body.sender
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

        if (req.body.startDate && req.body.endDate) {
            attendanceDB.find({
                timestamp: {
                    $gte: new Date(parseInt(req.body.startDate)),
                    $lte: new Date(parseInt(req.body.endDate))
                }
            }, {
                    sort: {
                        timestamp: -1
                    }
                }).toArray().then(result => {
                    for (let i = 0; i < result.lenght; i++) {
                        result[i].timestamp = new Date(result[i].timestamp).valueOf();
                        result[i].attendanceID = result[i]._id;
                        result[i].date = new Date(result[i].date).valueOf();
                        delete result[i]._id;
                    }
                });
        } else if (req.body.date) {
            // attendanceDB.find({

            // })
        } else if (req.body.studentStartDate && req.body.studentEndDate && req.body.studentID) {

        }
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
}