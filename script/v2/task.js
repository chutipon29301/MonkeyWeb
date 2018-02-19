var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, passport, db) {

    app.post('*', (req, res, next) => {
        if (req.user.position === 'student') return res.render('404');
        next();
    });

    app.post('/addTask', passport.isLoggedIn, (req, res) => {
        db.collection('task').insertOne({

        }).then(_ => {
            res.status(200).send('OK');
        });
    });

    app.post('/editTask', passport.isLoggedIn, (req,res) => {
        res.status(200).send('OK');
    });

    app.post('/deleteTask', passport.isLoggedIn, (req, res) => {
        // db.collection('task').
        res.status(200).send('OK');
    });
}