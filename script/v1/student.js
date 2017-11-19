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
        if (!req.body.userID || (!req.body.courseID && !req.body.hybridID) || !req.body.date) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (req.body.courseID) {
            attendanceDB.insertOne({
                userID: parseInt(req.body.userID),
                courseID: req.body.courseID,
                hybridID: NONE,
                date: req.body.date,
                type: ABSENT
            });
        } else if (req.body.hybridID) {

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
            console.log(data.student.quarter);
            console.log(stateObject);
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

}