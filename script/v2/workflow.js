var ObjectID = require("mongodb").ObjectID;
var apn = require('apn');
var notification = require('./classes/NotificationManager');
// var Header = require('./classes/WorkflowHeaderNode');

module.exports = function (app, passport, db) {

    const NONE = 'none';
    const NOTE = 'note';
    const TODO = 'todo';
    const IN_PROGRESS = 'inprogress';
    const ASSIGN = 'assign';
    const DONE = 'done';
    const COMPLETE = 'complete';

    db.collection('workflow').createIndex({
        header: 1
    });

    app.post('*', (req, res, next) => {
        if (req.user.position === 'student') return res.render('404');
        next();
    });

    // app.post('/test', passport.isLoggedIn, (req, res) => {
    //     var header = new Header(db.collection('workflow'), 'test', '99009', 'Other');
    //     header.save().then(_ => {
    //         res.status(200).send('OK');
    //     });
    // });

    app.post('/addWorkflow', passport.isLoggedIn, (req, res) => {
        if (!(req.body.title && req.body.detail, req.body.subtitle)) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }

        var tag;
        if (req.body.tag) {
            tag = req.body.tag;
        } else {
            tag = 'Other';
        }

        db.collection('workflow').insertOne({
            header: true,
            createdBy: req.user._id,
            title: req.body.title,
            tag: tag,
            timestamp: new Date(),
        }).then((err, response) => {
            if (err) {
                return res.status(500).send({
                    err: 1,
                    msg: 'Internal server error'
                });
            }
            db.collection('workflow').insertOne({
                header: false,
                status: NOTE,
                timestamp: new Date(),
                owner: req.user._id,
                detail: req.body.detail,
                subtitle: req.body.subtitle,
                parent: response.insertedId,
                ancestors: [response.insertedId]
            }).then(_ => {
                return res.status(200).send({
                    msg: 'OK'
                });
            });
        });
    });

    app.post('/editWorkflowHeader', passport.isLoggedIn, (req, res) => {
        if (!(req.body.workflowID && req.body.title)) {
            return res.status(400), send({
                err: 0,
                msg: 'Bad Request'
            });
        }
        db.collection('workflow').findOne({
            _id: ObjectID(req.body.workflowID)
        }).then(workflow => {
            if (!workflow.header) {
                throw ({
                    err: 2,
                    msg: 'Non header node do not have header'
                });
            }
            return db.collection('workflow').updateOne({
                _id: workflow._id
            }, {
                $set: {
                    title: req.body.title
                }
            });
        }).then(_ => {
            return res.status(200).send({
                msg: 'OK'
            });
        }).catch(err => {
            return res.status(400).send(err);
        });
    });

    app.post('/editWorkflowDetail', passport.isLoggedIn, (req, res) => {
        // TODO: Implement the edit task function
        res.status(200).send('OK');
    });

    app.post('/deleteWorkflow', passport.isLoggedIn, (req, res) => {
        if (!req.body.workflowID) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Request'
            });
        }
        db.collection('workflow').findOne({
            _id: ObjectID(req.body.workflowID)
        }).then(workflow => {
            if (!workflow.header) {
                throw ({
                    err: 1,
                    msg: 'Non-head task cannot be delete'
                });
            }
            if (workflow.createdBy !== req.user._id) {
                throw ({
                    err: 2,
                    msg: 'Only owner can delete this task'
                });
            }
            return db.collection('workflow').deleteMany({
                $or: [{
                    ancestors: workflow._id
                }, {
                    _id: workflow._id
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

    // app.post('')
}