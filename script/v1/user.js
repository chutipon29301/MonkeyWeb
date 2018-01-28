var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post, CryptoJS) {

    var userDB = db.collection('user');
    var User = db.collection("user");

    post('/post/v1/signup', function (req, res, next) {
        User.findOne({
            _id: parseInt(req.body.id)
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                let pwd = (Math.floor(Math.random() * 10000)) + '';
                User.insertOne({
                    _id: parseInt(req.body.id),
                    password: CryptoJS.SHA3(pwd).toString()
                }, function (err) {
                    if (err) throw err;
                    res.status(200).send({
                        id: parseInt(req.body.id),
                        password: pwd
                    })
                });
            } else {
                res.status(200).send({
                    err: 202,
                    msg: 'This id has been used.'
                });
            }
        });
    });

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
                delete result[i].phone;
                delete result[i].tutor;
            }
            res.status(200).send(result);
        });
    });

    post('/post/v1/listTutorJson', function (req, res) {
        userDB.find({
            position: {
                $in: ['tutor', 'admin', 'dev']
            },
            'tutor.status': 'active'
        },{
            sort: {
                _id: -1
            }
        }).toArray().then(result => {
            for (let i = 0; i < result.length; i++) {
                result[i].tutorID = result[i]._id;
                delete result[i]._id;
                delete result[i].password;
                delete result[i].firstnameEn;
                delete result[i].lastnameEn;
                delete result[i].phone;
                delete result[i].tutor;
            }
            res.status(200).send({
                tutors: result.reverse()
            });
        });
    });

    post('/post/v1/changePassword', function (req, res) {
        if (!(req.body.userID && req.body.password)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        userDB.updateOne({
            _id: parseInt(req.body.userID)
        }, {
            $set: {
                password: req.body.password
            }
        }, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: 0,
                    msg: err
                });
            }
            res.status(200).send('OK');
        });
    });

    post('/post/v1/userInfo', function (req, res) {
        if (!req.body.userID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        userDB.findOne({
            _id: parseInt(req.body.userID)
        }).then(user => {
            delete user._id;
            res.status(200).send(user);
        });
    });

    post('/post/v1/changeSubPosition', function (req, res) {
        if (!(req.body.userID && req.body.subPosition)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        userDB.updateOne({
            _id: parseInt(req.body.userID)
        }, {
            $set: {
                subPosition: req.body.subPosition
            }
        }, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: 0,
                    msg: err
                });
            }
            res.status(200).send('OK');
        });
    });
}