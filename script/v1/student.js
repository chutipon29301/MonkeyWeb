var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');

module.exports = function (app, db, post, gradeBitToString) {

    var attendanceDB = db.collection('attendance');
    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');
    var courseDB = db.collection('course');
    var configDB = db.collection('config');
    var userDB = db.collection('user');
    var attendanceDocumentDB = db.collection('attendanceDocument');
    var chatDB = db.collection('chat');

    const NONE = 0;
    const ABSENT = 1;
    const PRESENT = 2;

    attendanceDB.find({}).toArray().then(attendances => {
        for (let i = 0; i < attendances.length; i++) {
            attendanceDB.updateOne({
                _id: ObjectID(attendances[i]._id)
            }, {
                $set: {
                    hybridID: ObjectID(attendances[i].hybridID)
                }
            });
        }
    });

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
                hybridID: ObjectID(req.body.hybridID),
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
                hybridID: ObjectID(req.body.hybridID),
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
            attendanceDB.aggregate([{
                $match: query
            }, {
                $lookup: {
                    from: 'user',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userID'
                }
            }, {
                $lookup: {
                    from: 'course',
                    localField: 'courseID',
                    foreignField: '_id',
                    as: 'courseID'
                }
            }, {
                $lookup: {
                    from: 'hybridStudent',
                    localField: 'hybridID',
                    foreignField: '_id',
                    as: 'hybridID'
                }
            }, {
                $group: {
                    _id: '$_id',
                    userID: {
                        $first: {
                            $arrayElemAt: [
                                '$userID', 0
                            ]
                        }
                    },
                    timestamp: {
                        $first: '$timestamp'
                    },
                    courseID: {
                        $first: {
                            $arrayElemAt: [
                                '$courseID', 0
                            ]
                        }
                    },
                    hybridID: {
                        $first: {
                            $arrayElemAt: [
                                '$hybridID', 0
                            ]
                        }
                    },
                    date: {
                        $first: '$date'
                    },
                    type: {
                        $first: '$type'
                    },
                    reason: {
                        $first: '$reason'
                    },
                    sender: {
                        $first: '$sender'
                    },
                    subject: {
                        $first: '$subject'
                    }
                }
            }, {
                $sort: {
                    timestamp: -1
                }
            }]).toArray().then(values => {
                for (let i = 0; i < values.length; i++) {
                    if (values[i].courseID === null) {
                        delete values[i].courseID;
                    }
                    if (values[i].hybridID === null) {
                        delete values[i].hybridID;
                    }
                    if (values[i].type === 2) {
                        delete values[i].reason;
                    }
                    values[i].studentID = values[i].userID._id;
                    values[i].firstname = values[i].userID.firstname;
                    values[i].nickname = values[i].userID.nickname;
                    if (values[i].courseID) {
                        values[i].courseName = values[i].courseID.subject + gradeBitToString(values[i].courseID.grade) + values[i].courseID.level;
                        values[i].tutorID = values[i].courseID.tutor[0];
                        values[i].courseID = values[i].courseID._id;
                        delete values[i].subject;
                    }
                    if (values[i].hybridID) {
                        var selectSubject = _.find(values[i].hybridID.student, {
                            studentID: values[i].studentID
                        });
                        if (selectSubject) {
                            values[i].hybridSubject = selectSubject.subject;
                        } else {
                            values[i].hybridSubject == null;
                        }
                        delete values[i].hybridID;
                    }
                    delete values[i].userID;
                }
                Promise.all([
                    Promise.all(values.map(value => {
                        return attendanceDocumentDB.findOne({
                            attendanceID: value._id.toString()
                        });
                    })),
                    Promise.all(values.map(value => {
                        if (value.tutorID) {
                            return userDB.findOne({
                                _id: value.tutorID
                            });
                        } else {
                            return null;
                        }
                    }))
                ]).then(results => {
                    for (let i = 0; i < results.length; i++) {
                        switch (i) {
                            case 0:
                                for (let j = 0; j < results[i].length; j++) {
                                    if (results[i][j]) {
                                        values[j].link = 'https://www.monkey-monkey.com/get/v1/attendanceDocument?k=' + results[i][j]._id;
                                    }
                                }
                                break;
                            case 1:
                                for (let j = 0; j < results[i].length; j++) {
                                    if (results[i][j]) {
                                        values[j].tutorName = results[i][j].nicknameEn;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    res.status(200).send(values);
                });
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

    post('/post/v1/allStudent', function (req, res) {
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var quarterID;
            var quarterObj = {}
            if (req.body.quarter && req.body.year) {
                quarter = req.body.quarter;
                year = req.body.year;
                quarterObj.quarter = parseInt(quarter);
                quarterObj.year = parseInt(year);
                quarter += '';
                if (quarter.length < 2) {
                    quarter = '0' + quarter;
                }
                quarterID = year + quarter;
            } else {
                quarter = config.defaultQuarter.quarter.quarter;
                year = config.defaultQuarter.quarter.year;
                quarterObj.quarter = parseInt(quarter);
                quarterObj.year = parseInt(year);
                quarter += '';
                if (quarter.length < 2) {
                    quarter = '0' + quarter;
                }
                quarterID = year + quarter;
            }
            userDB.aggregate([{
                $match: {
                    position: 'student'
                }
            }, {
                $sort: {
                    _id: 1
                }
            }, {
                $lookup: {
                    from: 'course',
                    localField: '_id',
                    foreignField: 'student',
                    as: 'course'
                }
            }, {
                $lookup: {
                    from: 'hybridStudent',
                    localField: '_id',
                    foreignField: 'student.studentID',
                    as: 'hybrid'
                }
            }, {
                $lookup: {
                    from: 'skillStudent',
                    localField: '_id',
                    foreignField: 'student.studentID',
                    as: 'skill'
                }
            }]).toArray().then(users => {
                users.map(user => {
                    user.course = _.filter(user.course, o => {
                        return o.quarter === quarterObj.quarter && o.year === quarterObj.year;
                    });
                    user.hybrid = _.filter(user.hybrid, o => {
                        return o.quarterID === quarterID
                    });
                    user.skill = _.filter(user.skill, o => {
                        return o.quarterID === quarterID
                    });
                    user.inCourse = user.course.length !== 0;
                    user.inHybrid = user.hybrid.length !== 0;
                    user.inSkill = user.skill.length !== 0;
                    user.studentID = user._id;
                    user.grade = user.student.grade;
                    user.status = user.student.status;
                    user.quarter = user.student.quarter;
                    delete user._id;
                    delete user.password;
                    delete user.position;
                    delete user.firstnameEn;
                    delete user.lastnameEn;
                    delete user.nicknameEn;
                    delete user.email;
                    delete user.student;
                    delete user.phone;
                    delete user.course;
                    delete user.hybrid;
                    delete user.skill;
                });
                Promise.all(users.map(user => {
                    return chatDB.aggregate([{
                        $match: {
                            studentID: parseInt(user._id)
                        }
                    }, {
                        $sort: {
                            timestamp: -1
                        }
                    }, {
                        $limit: 3
                    }]).toArray();
                })).then(chats => {
                    for (let i = 0; i < users.length; i++) {
                        if (chats[i] != null) {
                            users[i].chats = chats[i];
                        }
                    }
                    res.status(200).send({
                        users: users
                    });
                });
            });
        });
    });
}