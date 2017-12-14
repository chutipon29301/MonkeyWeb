var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {

    var taskDB = db.collection('task');

    const TODO = 0;
    const ON_PROCESS = 1;
    const ASSIGN = 2;
    const DONE = 3;
    const COMPLETE = 4;

    const HEAD = 0;
    const TAIL = 1;

    const CALENDAR = 0;
    const TASK = 1;

    post('/post/v1/addTask', function (req, res) {
        // if (!(req.body.tutorID && req.body.title && req.body.detail)) {
        //     return res.status(400).send({
        //         err: -1,
        //         msg: 'Bad Request'
        //     });
        // }
        // var task = {};
        // task.createOn = new Date();
        // task.lastModified = new Date();
        // task.title = req.body.title;
        // task.status = TODO;
        // task.createBy = parseInt(req.body.tutorID);
        // task.detail = req.body.detail;
        // task.assingTaskID = [];

        // taskDB.insertOne(task, (err, db) => {
        //     res.status(200).send('OK');
        // });
        if (!(req.body.assigner && req.body.title && req.body.detail)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        res.status(200).send('OK');
    });

    post('/post/v1/assignTask', function (req, res) {
        if (!(req.body.assigner, req.body.taskID, req.body.assignee)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        res.status(200).send('OK');
    });
}