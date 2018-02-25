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
                header: false,
                status: NOTE,
                timestamp: new Date(),
                owner: req.user._id,
                detail: req.body.detail,
                subtitle: req.body.subtitle,
                parent: response.insertedId,
                ancestors: [response.insertedId]
            }).then(_ => {
                res.status(200).send({
                    msg: 'OK'
                });
            });
        });
    });

    app.post('/editTask', passport.isLoggedIn, (req, res) => {
        res.status(200).send('OK');
    });

    app.post('/deleteTask', passport.isLoggedIn, (req, res) => {
        if (!req.body.taskID) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }
        db.collection('task').findOne({
            _id: ObjectID(req.body.taskID)
        }).then(task => {
            if (!task.header) {
                throw ({
                    err: 1,
                    msg: 'Non-head task cannot be delete'
                });
            }
            if (task.createdBy !== req.user._id) {
                throw ({
                    err: 2,
                    msg: 'Only owner can delete this task'
                });
            }
            return db.collection('task').deleteMany({
                $or: [{
                    ancestors: task._id
                }, {
                    _id: task._id
                }]
            });
        }).then(result => {
            res.status(200).send({
                mgs: 'OK'
            });
        }).catch(err => {
            res.status(400).send(err);
        });
    });
}