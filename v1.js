var gradeBitToString = function (bit) {
    var output = '', p = false, s = false;
    for (var i = 0; i < 6; i++) {
        if (bit & (1 << i)) {
            if (p == false) {
                p = true;
                output += 'P';
            }
            output += (i + 1);
        }
    }
    for (var i = 0; i < 6; i++) {
        if (bit & (1 << (i + 6))) {
            if (s == false) {
                s = true;
                output += 'S';
            }
            output += (i + 1);
        }
    }
    if (bit & (1 << 12)) output += 'SAT';
    return output;
};

module.exports = function (app, db, post) {

    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');
    var studentSkillDB = db.collection('skillStudent');
    var userDB = db.collection('user');
    var courseDB = db.collection('course');
    var configDB = db.collection('config');

    post('/post/v1/listQuarter', function (req, res) {
        var status;
        if (req.body.status === undefined) {
            status = 'public';
        } else {
            status = req.body.status;
        }
        var query = [];
        switch (status) {
            case 'private':
                query.push('private');
            case 'protected':
                query.push('protected');
            case 'public':
            default:
                query.push('public');
                break;
        }

        quarterDB.find({
            status: {
                $in: query
            }
        }).toArray().then(result => {
            for (var i = 0; i < result.length; i++) {
                result[i].quarterID = result[i]._id;
                delete result[i]._id;
            }
            return res.status(200).send(result);
        });
    });

    /**
     * Post method for adding hybrid day to quarter
     * req.body = {
     *      quarter: 4
     *      year: 2017
     *      day: 1023004020
     * }
     * res.body = 'OK'
     */
    post('/post/v1/addHybridDayToQuarter', function (req, res) {
        if (req.body.quarter === undefined || req.body.year === undefined || req.body.day === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var reqDate = new Date(parseInt(req.body.day));
        var serverDate = new Date(0);
        serverDate.setHours(reqDate.getHours());
        serverDate.setDate(reqDate.getDate());
        serverDate.setMonth(reqDate.getMonth());
        serverDate.setFullYear(reqDate.getFullYear());
        quarterDB.findOne({
            year: parseInt(req.body.year),
            quarter: parseInt(req.body.quarter)
        }).then(data => {
            studentHybridDB.insertOne({
                quarterID: data._id,
                day: serverDate.getTime(),
                student: []
            }, function (err, result) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                            return res.status(501).send({
                                err: 'Data already exist',
                                msg: err.msg
                            });
                        default:
                            return res.status(500).send({
                                err: -1,
                                msg: 'Internal Server Error'
                            });
                    }
                }
                res.status(200).send('OK');
            });
        });
    });

    /**
     * Post method for listing all hybrid in quarter
     * req.body = {
     *      quarter: 4
     *      year: 2017
     * }
     * res.body = [
     *      day: 34320000
     *      hybridID: 49fjf8weijrfsfs4
     * ]
     */
    post('/post/v1/listHybridDayInQuarter', function (req, res) {
        if (req.body.quarter === undefined || req.body.year === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        quarterDB.findOne({
            year: parseInt(req.body.year),
            quarter: parseInt(req.body.quarter)
        }).then(data => {
            studentHybridDB.find({
                quarterID: data._id
            }).toArray(function (err, result) {
                if (err) {
                    res.status(500).send({
                        err: 0,
                        msg: 'Internal server error'
                    });
                }
                for (let i = 0; i < result.length; i++) {
                    result[i].hybridID = result[i]._id;
                    delete result[i]._id;
                    delete result[i].quarterID
                    delete result[i].student
                }
                res.status(200).send(result);
            });
        });
    });

    /**
     * Post method for adding student to hybrid day
     * req.body = {
     *      hybridID: miagjngoajew934jr3432e3
     *      studentID: 15999
     *      subject: 'M'
     * }
     * res.body = 'OK'
     */
    post('/post/v1/addHybridStudent', function (req, res) {
        if (req.body.hybridID === undefined || req.body.studentID === undefined || req.body.subject === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        studentHybridDB.update({
            _id: ObjectID(req.body.hybridID)
        }, {
                $push: {
                    student: {
                        studentID: parseInt(req.body.studentID),
                        subject: req.body.subject
                    }
                }
            }
        );
        res.status(200).send('OK')
    });

    /**
     * Post method for remove student from hybrid day
     * req.body = {
     *      hybridID: miagjngoajew934jr3432e3
     *      studentID: 15999
     * }
     * res.body = 'OK'
     */
    post('/post/v1/removeHybridStudent', function (req, res) {
        if (req.body.hybridID === undefined || req.body.studentID === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        studentHybridDB.update({
            _id: ObjectID(req.body.hybridID)
        }, {
                $pull: {
                    student: {
                        studentID: parseInt(req.body.studentID)
                    }
                }
            }
        );
        res.status(200).send('OK')
    });

    /**
     * Post method for list time of student in hybrid day
     * req.body = {
     *      studentID: 15999
     *      quarter: 4
     *      year: 2017
     * }
     * res.body = [
     *      {
     *          day: 43959400000
     *          hybridID: 'kiq034krmif035g'
     *      }
     * ]
     */
    post('/post/v1/listStudentHybrid', function (req, res) {
        if (req.body.studentID === undefined || req.body.quarter === undefined || req.body.year === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        quarterDB.findOne({
            year: parseInt(req.body.year),
            quarter: parseInt(req.body.quarter)
        }).then(data => {
            studentHybridDB.find({
                student: {
                    $elemMatch: {
                        studentID: parseInt(req.body.studentID)
                    }
                },
                quarterID: data._id
            }).toArray(function (err, result) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                            return res.status(501).send({
                                err: 'Data aready exist',
                                msg: err.msg
                            });
                        default:
                            return res.status(500).send({
                                err: -1,
                                msg: 'Internal Server Error'
                            });
                    }
                }
                for (let i = 0; i < result.length; i++) {
                    result[i].hybridID = result[i]._id;
                    for (let j = 0; j < result[i].student.length; j++) {
                        if (result[i].student[j].studentID === parseInt(req.body.studentID)) {
                            result[i].subject = result[i].student[j].subject;
                        }
                    }
                    delete result[i]._id;
                    delete result[i].student;
                    delete result[i].quarterID;
                }
                res.status(200).send(result);
            });
        });
    });

    //Skill

    /**
     * Post method for adding skill day to quarter
     * req.body = {
     *      quarter: 4
     *      year: 2017
     *      day: 1023004020
     * }
     * res.body = 'OK'
     */
    post('/post/v1/addSkillDayToQuarter', function (req, res) {
        if (req.body.quarter === undefined || req.body.year === undefined || req.body.day === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var reqDate = new Date(parseInt(req.body.day));
        var serverDate = new Date(0);
        serverDate.setMinutes(reqDate.getMinutes());
        serverDate.setHours(reqDate.getHours());
        serverDate.setDate(reqDate.getDate());
        serverDate.setMonth(reqDate.getMonth());
        serverDate.setFullYear(reqDate.getFullYear());
        quarterDB.findOne({
            year: parseInt(req.body.year),
            quarter: parseInt(req.body.quarter)
        }).then(data => {
            studentSkillDB.insertOne({
                quarterID: data._id,
                day: serverDate.getTime(),
                student: []
            }, function (err, result) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                            return res.status(501).send({
                                err: 'Data already exist',
                                msg: err.msg
                            });
                        default:
                            return res.status(500).send({
                                err: -1,
                                msg: 'Internal Server Error'
                            });
                    }
                }
                res.status(200).send('OK');
            });
        });
    });

    /**
     * Post method for listing all skill in quarter
     * req.body = {
     *      quarter: 4
     *      year: 2017
     * }
     * res.body = [
     *      day: 34320000
     *      skillID: 49fjf8weijrfsfs4
     * ]
     */
    post('/post/v1/listSkillDayInQuarter', function (req, res) {
        if (req.body.quarter === undefined || req.body.year === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        quarterDB.findOne({
            year: parseInt(req.body.year),
            quarter: parseInt(req.body.quarter)
        }).then(data => {
            studentSkillDB.find({
                quarterID: data._id
            }).toArray(function (err, result) {
                if (err) {
                    res.status(500).send({
                        err: 0,
                        msg: 'Internal server error'
                    });
                }
                for (let i = 0; i < result.length; i++) {
                    result[i].skillID = result[i]._id;
                    delete result[i]._id;
                    delete result[i].quarterID
                    delete result[i].student
                }
                console.log(result);
                res.status(200).send(result);
            });
        });
    });

    /**
     * Post method for adding student to skill day
     * req.body = {
     *      skillID: miagjngoajew934jr3432e3
     *      studentID: 15999
     *      subject: 'M'
     * }
     * res.body = 'OK'
     */
    post('/post/v1/addSkillStudent', function (req, res) {
        if (req.body.skillID === undefined || req.body.studentID === undefined || req.body.subject === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        studentSkillDB.update({
            _id: ObjectID(req.body.skillID)
        }, {
                $push: {
                    student: {
                        studentID: parseInt(req.body.studentID),
                        subject: req.body.subject
                    }
                }
            }
        );
        res.status(200).send('OK')
    });

    /**
     * Post method for remove student from skill day
     * req.body = {
     *      skillID: miagjngoajew934jr3432e3
     *      studentID: 15999
     * }
     * res.body = 'OK'
     */
    post('/post/v1/removeSkillStudent', function (req, res) {
        if (req.body.skillID === undefined || req.body.studentID === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        studentSkillDB.update({
            _id: ObjectID(req.body.skillID)
        }, {
                $pull: {
                    student: {
                        studentID: parseInt(req.body.studentID)
                    }
                }
            }
        );
        res.status(200).send('OK')
    });

    /**
     * Post method for list time of student in skill day
     * req.body = {
     *      studentID: 15999
     *      quarter: 4
     *      year: 2017
     * }
     * res.body = [
     *      {
     *          day: 43959400000
     *          skillID: 'kiq034krmif035g'
     *      }
     * ]
     */
    post('/post/v1/listStudentSkill', function (req, res) {
        if (req.body.studentID === undefined || req.body.quarter === undefined || req.body.year === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        quarterDB.findOne({
            year: parseInt(req.body.year),
            quarter: parseInt(req.body.quarter)
        }).then(data => {
            studentSkillDB.find({
                student: {
                    $elemMatch: {
                        studentID: parseInt(req.body.studentID)
                    }
                },
                quarterID: data._id
            }).toArray(function (err, result) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                            return res.status(501).send({
                                err: 'Data aready exist',
                                msg: err.msg
                            });
                        default:
                            return res.status(500).send({
                                err: -1,
                                msg: 'Internal Server Error'
                            });
                    }
                }
                for (let i = 0; i < result.length; i++) {
                    result[i].skillID = result[i]._id;
                    for (let j = 0; j < result[i].student.length; j++) {
                        if (result[i].student[j].studentID === parseInt(req.body.studentID)) {
                            result[i].subject = result[i].student[j].subject;
                        }
                    }
                    delete result[i]._id;
                    delete result[i].student;
                    delete result[i].quarterID;
                }
                res.status(200).send(result);
            });
        });
    });

    post('/post/v1/studentTimeTable', function (req, res) {
        if (req.body.year === undefined || req.body.quarter === undefined || req.body.studentID === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var studentID = parseInt(req.body.studentID);
        quarterDB.findOne({
            quarter: parseInt(req.body.quarter),
            year: parseInt(req.body.year)
        }).then(quarter => {
            var studentInCourse = courseDB.find({
                quarter: quarter.quarter,
                year: quarter.year,
                student: studentID
            }).toArray();

            var studentInHybrid = studentHybridDB.find({
                quarterID: quarter._id,
                student: {
                    $elemMatch: {
                        studentID: studentID
                    }
                }
            }).toArray();

            var studentInSkill = studentSkillDB.find({
                quarterID: quarter._id,
                student: {
                    $elemMatch: {
                        studentID: studentID
                    }
                }
            }).toArray();

            Promise.all([studentInCourse, studentInHybrid, studentInSkill]).then(values => {
                var response = {};
                var namePromise = [];
                for (let i = 0; i < values.length; i++) {
                    switch (i) {
                        case 0:
                            response.course = [];
                            for (let j = 0; j < values[i].length; j++) {
                                response.course.push({
                                    courseID: values[i][j]._id,
                                    courseName: values[i][j].subject + gradeBitToString(values[i][j].grade) + values[i][j].level,
                                    day: values[i][j].day
                                });
                                namePromise.push(userDB.findOne({
                                    _id: values[i][j].tutor[0]
                                }));
                            }
                            break;
                        case 1:
                            response.hybrid = [];
                            for (let j = 0; j < values[i].length; j++) {
                                for (let k = 0; k < values[i][j].student.length; k++) {
                                    if (studentID == values[i][j].student[k].studentID) {
                                        response.hybrid.push({
                                            hybridID: values[i][j]._id,
                                            subject: values[i][j].student[k].subject,
                                            day: values[i][j].day
                                        });
                                    }
                                }
                            }
                            break;
                        case 2:
                            response.skill = []
                            for (let j = 0; j < values[i].length; j++) {
                                for (let k = 0; k < values[i][j].student.length; k++) {
                                    if (studentID == values[i][j].student[k].studentID) {
                                        response.skill.push({
                                            skillID: values[i][j]._id,
                                            subject: values[i][j].student[k].subject,
                                            day: values[i][j].day
                                        });
                                    }
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
                Promise.all(namePromise).then(names => {
                    for (let i = 0; i < names.length; i++) {
                        response.course[i].tutorName = names[i].nicknameEn;
                    }
                    res.status(200).send(response);
                });
            });
        })
    });

    post('/post/v1/listSubjectInQuarter', function (req, res) {
        if (req.body.year === undefined || req.body.quarter === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        var querryQuarterObject = {
            quarter: parseInt(req.body.quarter),
            year: parseInt(req.body.year)
        }

        quarterDB.findOne(querryQuarterObject).then(quarter => {
            var querryObject = {
                quarterID: quarter._id
            };

            if (req.body.day !== undefined) {
                var reqDate = new Date(parseInt(req.body.day));
                querryQuarterObject.day = parseInt(req.body.day);
                querryObject.day = moment(0).day(reqDate.getDay()).hour(reqDate.getHours()).valueOf();
            }

            var subjectInCourse = courseDB.find(querryQuarterObject).toArray();

            var subjectInHybrid = studentHybridDB.find(querryObject).toArray();

            if (querryObject.day !== undefined) {
                var date = new Date(querryObject.day);
                date.setHours(date.getHours() + 2);
                var startTime = querryObject.day;
                delete querryObject.day
                querryObject.day = {
                    $gte: startTime, $lt: date.getTime()
                }
            }

            var subjectInSkill = studentSkillDB.find(querryObject).toArray();

            Promise.all([subjectInCourse, subjectInHybrid, subjectInSkill]).then(values => {
                var response = {};
                var namePromise = [];
                for (let i = 0; i < values.length; i++) {
                    switch (i) {
                        case 0:
                            response.course = [];
                            for (let j = 0; j < values[i].length; j++) {
                                response.course.push({
                                    courseID: values[i][j]._id,
                                    courseName: values[i][j].subject + gradeBitToString(values[i][j].grade) + values[i][j].level,
                                    day: values[i][j].day
                                });
                                namePromise.push(userDB.findOne({
                                    _id: values[i][j].tutor[0]
                                }));
                            }
                            break;
                        case 1:
                            response.hybrid = [];
                            for (let j = 0; j < values[i].length; j++) {
                                response.hybrid.push({
                                    hybridID: values[i][j]._id,
                                    day: values[i][j].day
                                });
                            }
                            break;
                        case 2:
                            response.skill = []
                            for (let j = 0; j < values[i].length; j++) {
                                response.skill.push({
                                    skillID: values[i][j]._id,
                                    day: values[i][j].day
                                });
                            }
                            break;
                        default:
                            break;
                    }
                }
                Promise.all(namePromise).then(names => {
                    for (let i = 0; i < names.length; i++) {
                        response.course[i].tutorName = names[i].nicknameEn;
                    }
                    res.status(200).send(response);
                });
            });
        });
    });

    post('/post/v1/allRoom', function (req, res) {
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var quarter, year, quarterID;
            quarterID = req.body.quarterID;
            console.log(req.body);
            if (req.body.year === undefined || req.body.quarter === undefined) {
                quarter = config.defaultQuarter.quarter.quarter;
                year = config.defaultQuarter.quarter.year
            } else {
                quarter = parseInt(req.body.quarter);
                year = parseInt(req.body.year);
            }

            if(quarterID !== undefined){
                year = parseInt(quarterID.substring(0,4));
                quarter = parseInt(quarterID.substring(4,quarterID.length));
            }

            var courseRoom = courseDB.find({
                quarter: quarter,
                year: year
            }).toArray();

            var hybridRoom = quarterDB.findOne({
                quarter: quarter,
                year: year
            }).then(data => {
                return studentHybridDB.find({
                    quarterID: data._id
                }).toArray();
            });

            var promise = [];
            var response = {};
            var dayList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

            promise.push(courseRoom);
            promise.push(hybridRoom);

            Promise.all(promise).then(values => {
                for (let i = 0; i < values.length; i++) {
                    switch (i) {
                        case 0:
                            for (let j = 0; j < values[i].length; j++) {
                                var date = new Date(values[i][j].day);
                                var field = dayList[date.getDay() % 7] + date.getHours();
                                if (response[field] === undefined) {
                                    response[field] = {};
                                }
                                if (response[field]['room' + values[i][j].room] === undefined) {
                                    response[field]['room' + values[i][j].room] = {};
                                    response[field]['room' + values[i][j].room].course = [];
                                    response[field]['room' + values[i][j].room].studentCount = 0;
                                }
                                response[field]['room' + values[i][j].room].studentCount += values[i][j].student.length;
                                response[field]['room' + values[i][j].room].course.push({
                                    courseID: values[i][j]._id,
                                    courseName: values[i][j].subject + gradeBitToString(values[i][j].grade) + values[i][j].level,
                                    num: values[i][j].student.length
                                });
                            }
                            break;
                        case 1:
                            for (let j = 0; j < values[i].length; j++) {
                                var date = new Date(values[i][j].day);
                                var field = dayList[date.getDay() % 7] + date.getHours();
                                if (response[field] === undefined) {
                                    response[field] = {};
                                }
                                if (response[field]['room0'] === undefined) {
                                    response[field]['room0'] = {};
                                    response[field]['room0'].hybrid = [];
                                    response[field]['room0'].studentCount = 0;
                                } else if (response[field]['room0'].hybrid === undefined) {
                                    response[field]['room0'].hybrid = [];
                                }
                                response[field]['room0'].studentCount += values[i][j].student.length;
                                response[field]['room0'].hybrid.push({
                                    hybridID: values[i][j]._id,
                                    num: values[i][j].student.length
                                });
                            }
                            break;
                        default:
                            break;
                    }
                }
                res.status(200).send(response);
            });

        });
    });
}