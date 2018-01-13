var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post) {

    var taskDB = db.collection('task');

    const NONE = -1;
    const TODO = 0;
    const ON_PROCESS = 1;
    const ASSIGN = 2;
    const DONE = 3;
    const COMPLETE = 4;

    post('/post/v1/addTask', function (req, res) {
        if (!(req.body.assigner && req.body.title && req.body.detail)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        };

        var task = {
            createOn: new Date(),
            lastModified: new Date(),
            title: req.body.title,
            detail: req.body.detail,
            owner: parseInt(req.body.assigner),
            createBy: parseInt(req.body.assigner),
            modifyBy: parseInt(req.body.assigner),
            ancestors: [],
            parent: null,
            status: TODO,
            remark: ''
        };

        if (req.body.dueDate) {
            task.dueDate = new Date(parseInt(req.body.dueDate));
            task.hasDueDate = true;
        } else {
            task.hasDueDate = false;
        }

        if (req.body.tags) {
            if (Array.isArray(req.body.tags)) {
                task.tags = req.body.tags;
            } else {
                task.tags = [req.body.tags];
            }
        } else {
            task.tags = [];
        }

        taskDB.insertOne(task, (err, result) => {
            if (err) {
                return res.status(500).send({
                    err: 0,
                    errInfo: err
                });
            }
            res.status(200).send('OK');
        });
    });

    post('/post/v1/editTask', function (req, res) {
        if (!(req.body.taskID && req.body.modifier && (req.body.title || req.body.detail || req.body.dueDate || req.body.tags))) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Reqeust'
            });
        }

        var newValue = {
            $set: {
                modifyBy: parseInt(req.body.modifier),
                lastModified: new Date()
            }
        };

        if (req.body.title) {
            newValue.$set.title = req.body.title;
        }
        if (req.body.detail) {
            newValue.$set.detail = req.body.detail;
        }
        if (req.body.dueDate) {
            newValue.$set.dueDate = new Date(parseInt(req.body.dueDate));
        }
        if (req.body.tags) {
            if (Array.isArray(req.body.tags)) {
                newValue.$set.tags = req.body.tags;
            } else {
                newValue.$set.tags = [req.body.tags];
            }
        }

        taskDB.findOne({
            _id: ObjectID(req.body.taskID)
        }).then(task => {
            return taskDB.updateMany({
                ancestors: task.ancestors[0]
            }, newValue);
        }).then((err, result) => {
            res.status(200).send('OK');
        });
    });

    post('/post/v1/assignTask', function (req, res) {
        if (!(req.body.assigner && req.body.assignees && req.body.taskID)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var assignees = req.body.assignees;
        if (!Array.isArray(assignees)) {
            assignees = [assignees];
        }

        assignees = assignees.map(assignee => parseInt(assignee));

        taskDB.findOne({
            _id: ObjectID(req.body.taskID)
        }).then(parentTask => {
            var ancestors = parentTask.ancestors;
            ancestors.push(parentTask._id);
            var insertObject = assignees.map(assignee => {
                var temp = {
                    createOn: new Date(),
                    lastModified: new Date(),
                    title: parentTask.title,
                    detail: parentTask.detail,
                    owner: assignee,
                    createBy: parseInt(req.body.assigner),
                    modifyBy: parseInt(req.body.assigner),
                    ancestors: ancestors,
                    parent: parentTask._id,
                    status: TODO,
                    hasDueDate: parentTask.hasDueDate,
                    tags: parentTask.tags,
                    remark: ''
                }
                if (parentTask.hasDueDate) {
                    temp.dueDate = parentTask.dueDate;
                }
                return temp;
            });

            return taskDB.insertMany(insertObject);
        }).then(values => {
            res.status(200).send('OK');
        });
    });

    post('/post/v1/changeTaskStatus', function (req, res) {
        if (!(req.body.taskID && req.body.taskStatus)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        var changeStatus = (task, childStatus, parentStatus) => {
            return Promise.all([
                taskDB.updateOne({
                    _id: ObjectID(task._id)
                }, {
                    $set: {
                        status: childStatus
                    }
                }),
                taskDB.updateOne({
                    _id: ObjectID(task.parent)
                }, {
                    $set: {
                        status: childStatus
                    }
                })
            ])
        }

        taskDB.findOne({
            _id: ObjectID(req.body.taskID)
        }).then(task => {
            switch (parseInt(req.body.taskStatus)) {
                case TODO:
                    return changeStatus(task, TODO, TODO);
                case ON_PROCESS:
                    return changeStatus(task, ON_PROCESS, ON_PROCESS);
                case ASSIGN:
                    return changeStatus(task, ASSIGN, ON_PROCESS);
                case DONE:
                    return taskDB.find({
                        parent: task.parent
                    }).toArray().then(tasks => {
                        var doneTask = tasks.filter(task => task.status === DONE);
                        if (doneTask.length >= tasks.length - 1) {
                            return taskDB.updateMany({
                                $or: [{
                                    ancestors: ObjectID(task.parent)
                                }, {
                                    _id: ObjectID(task.parent)
                                }]
                            }, {
                                $set: {
                                    status: DONE
                                }
                            });
                        } else {
                            return taskDB.updateOne({
                                _id: ObjectID(task._id)
                            }, {
                                $set: {
                                    status: DONE
                                }
                            });
                        }
                    })
                case COMPLETE:
                    return taskDB.findOne({
                        _id: ObjectID(task._id)
                    }).then(task => {
                        if (task.parent !== null){
                            throw({
                                err: -1,
                                msg: 'Non-head task cannot be set to complete'
                            });
                        }
                        return taskDB.updateMany({
                            $or: [{
                                ancestors: ObjectID(task.parent)
                            }, {
                                _id: ObjectID(task.parent)
                            }]
                        }, {
                            $set: {
                                status: COMPLETE
                            }
                        });
                    }).catch(err => {
                        throw (err);
                    });
                default:
                    throw ({
                        err: 3,
                        msg: 'Mismatch status'
                    });
            }
        }).then(values => {
            return res.status(200).send('OK');
        }).catch(err => {
            return res.status(400).send(err);
        });
    });

    post('/post/v1/deleteTask', function (req, res) {
        if (!req.body.taskID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        taskDB.findOne({
            _id: ObjectID(req.body.taskID)
        }).then(task => {
            if (task.parent !== null) {
                throw ({
                    err: -1,
                    msg: 'Non-head task cannot be delete'
                });
            }
            return taskDB.deleteMany({
                $or: [{
                    ancestors: task._id
                }, {
                    _id: ObjectID(task._id)
                }]
            });
        }).then(() => {
            return res.status(200).send('OK');
        }).catch(err => {
            return res.status(400).send(err);
        });
    });

    post('/post/v1/listUserTask', function(req,res){
        if(!req.body.userID){
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        taskDB.find({
            owner: parseInt(req.body.userID)
        }).toArray().then(tasks => {
            res.status(200).send(tasks.map(task => {
                task.taskID = task._id;
                delete task._id;
                return task;
            }));
        });
    });
}