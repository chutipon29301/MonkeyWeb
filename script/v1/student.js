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

    post('post/v1/addAbsent', function (req, res) {
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
}