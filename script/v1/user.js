var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {

    var userDB = db.collection('user');

    post('/post/v1/listTutor', function (req, res) {
        userDB.find({
            position: {
                $in: ['tutor', 'admin', 'dev']
            }
        }).toArray().then(result => {
            for (let i = 0; i < result.length; i++) {
                result[i].tutorID = result[i]._id;
                delete result[i]._id;
                delete result[i].password;
                delete result[i].firstnameEn;
                delete result[i].lastnameEn;
                delete result[i].nicknameEn;
                delete result[i].phone;
                delete result[i].tutor;
            }
            res.status(200).send(result);
        });
    });
}