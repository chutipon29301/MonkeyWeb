var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, passport, db) {

    const NONE = 'none';
    const NOTE = 'note';
    const TODO = 'todo';
    const IN_PROGRESS = 'inprogress';
    const ASSIGN = 'assign';
    const DONE = 'done';
    const COMPLETE = 'complete';

    db.collection('task').createIndex({
        header: 1
    });

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

        if (!(req.body.title && req.body.detail, req.body.subtitle)) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }
        var tags = [];
        db.collection('task').insertOne({
            header: true,
            createdBy: req.user._id,
            title: req.body.title,
            tags: tags,
            timestamp: new Date(),
        }).then((err, response) => {
            if (err) {
                return res.status(500).send({
                    err: 1,
                    msg: 'Internal server error'
                });
            }
            db.collection('task').insertOne({
                status: NOTE,
                timestamp: new Date(),
                owner: req.user._id,
                detail: req.body.detail,
                subtitle: req.body.subtitle,
                parent: response.insertedId,
                ancestors: [response.insertedId]
            }).then(_ => {
                res.status(200).send('OK');
            });
        });
    });


    app.post('/deleteTask', passport.isLoggedIn, (req, res) => {
        // db.collection('task').
        res.status(200).send('OK');
    });
}