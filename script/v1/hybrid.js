module.exports = function (app, db, post) {

    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');

    /**
     * Post method for adding hybrid day to quarter
     * req.body = {
     *      quarter: 4
     *      year: 2017
     *      day: 1023004020
     * }
     * 
     * if not error:
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
     * if not error
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
     * if not error
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
     * if not error
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
     * if not error
     * res.body = [
     *      {
     *          day: 43959400000
     *          hybridID: 'kiq034krmif035g'
     *      }, 
     *      ...
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
}