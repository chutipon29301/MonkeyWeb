module.exports = function (app, db, post) {
    var tutorCheckDB = db.collection('tutorCheck');

    post('/post/v1/tutorCheckIn', function (req, res) {
        if (!req.body.userID) {
            return res.status(200).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
    });
}