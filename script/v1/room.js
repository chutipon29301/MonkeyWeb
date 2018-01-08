// var Rx = require('rxjs/Rx');

module.exports = function (app, db, post, gradeBitToString) {

    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');
    var courseDB = db.collection('course');
    var userDB = db.collection('user');
    var configDB = db.collection('config');

    /**
     * Post method for getting room info
     * req.body = {
     *      year 2017,
     *      quarter: 4
     * }
     * if not error
     * res.body = {
     *      sat8: {
     *          room0: {
     *              course: [
     *                  {
     *                      courseID: '2j94jfu3hfeifkf24g4sdfs',
     *                      courseName: 'MS123a',
     *                      num: 10,
     *                      tutorName: Hybrid
     *                  },
     *                  ...
     *              ],
     *              studentCount: 30,
     *              hybrid: [
     *                  {
     *                      hybridID: '49aw7hfj4gawrtf4wgweaf34',
     *                      num: 20
     *                  },
     *                  ...
     *              ]
     *          }
     *      },
     *      ...
     * }
     */
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

            if (quarterID !== undefined) {
                year = parseInt(quarterID.substring(0, 4));
                quarter = parseInt(quarterID.substring(4, quarterID.length));
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

            quarterDB.findOne({
                quarter: quarter,
                year: year
            }).then(quarterInfo => {
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
                                    response[field]['room' + values[i][j].room].maxStudent = quarterInfo.maxSeat[values[i][j].room]
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
                                    response[field]['room0'].maxStudent = quarterInfo.maxSeat[0];
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

                    promise = []
                    for (day in response) {
                        for (var key in response[day]) {
                            for (type in response[day][key]) {
                                if (type === 'course') {
                                    for (let i = 0; i < response[day][key][type].length; i++) {
                                        promise.push(courseDB.findOne({
                                            _id: response[day][key][type][i].courseID
                                        }).then(courseInfo => {
                                            return userDB.findOne({
                                                _id: courseInfo.tutor[0]
                                            });
                                        }));
                                    }
                                }
                            }
                        }
                    }
                    var index = 0;
                    Promise.all(promise).then(values => {
                        for (day in response) {
                            for (var key in response[day]) {
                                for (type in response[day][key]) {
                                    if (type === 'course') {
                                        for (let i = 0; i < response[day][key][type].length; i++) {
    response[day][key][type][i].tutorName = values[index].nicknameEn;
                                            index++;
                                        }
                                    }
                                }
                            }
                        }
                        res.status(200).send(response);
                    });
                });
            });
        });
    });

    // post('/post/v1/allRoom', function (req, res) {
    //     configDB.findOne({
    //         _id: 'config'
    //     }).then(config => {
    //         if (req.body.year === undefined || req.body.quarter === undefined) {
    //             quarter = config.defaultQuarter.quarter.quarter;
    //             year = config.defaultQuarter.quarter.year
    //         } else {
    //             quarter = parseInt(req.body.quarter);
    //             year = parseInt(req.body.year);
    //         }
    //         return quarterDB.findOne({
    //             quarter: quarter,
    //             year: year
    //         });
    //     }).then(quarter => {
    //         return Promise.all([
    //             // courseDB.find({
    //             //     quarter: quarter.quarter,
    //             //     year: quarter.year
    //             // }).toArray().then(courses => {
    //             //     return Promise.all(courses.map(course => {
    //             //         return Promise.all(course.student.map(student => {
    //             //             return userDB.findOne({
    //             //                 _id: student
    //             //             });
    //             //         }));
    //             //     }));
    //             // }),
    //             courseDB.aggregate([{
    //                 $unwind: '$student'
    //             }, {
    //                 $lookup: {
    //                     from: 'user',
    //                     localField: 'student',
    //                     foreignField: 'student',
    //                     as: 'studentQuarter'
    //                 }
    //             }, {
    //                 $match: {
    //                     quarter: quarter.quarter,
    //                     year: quarter.year
    //                 }
    //             }]).toArray(),
    //             studentHybridDB.find({
    //                 quarterID: quarter._id
    //             }).toArray()
    //         ]);
    //     }).then(value => {
    //         console.log(value);
    //         res.status(200).send(value)
    //     });
    });
}