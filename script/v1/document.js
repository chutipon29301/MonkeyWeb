module.exports = function (app, db, post) {

    const fs = require('fs-extra');

    var courseDB = db.collection('course');
    var configDB = db.collection('config');
    var studentDocumentDB = db.collection('studentDocument');

    post('/post/v1/uploadDocument', function (req, res) {
        if (req.files === undefined) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var files = req.files;
            var error;
            var date;
            if (req.body.displayDate !== undefined) {
                date = new Date(parseInt(req.body.date));
            } else {
                date = new Date();
            }
            var copyFile = (courseID, files, res) => {
                var dir = config.documentPath + courseID;
                try {
                    fs.ensureDirSync(dir);
                } catch (err) {
                    return res.status(500).send({
                        err: err.errno,
                        msg: err
                    });
                }
                for (let i = 0; i < files.length; i++) {
                    var path = config.documentPath.substring(0, config.documentPath.length - 1);
                    try {
                        fs.moveSync(files[i].path, dir + '/' + files[i].originalname);
                        studentDocumentDB.insertOne({
                            name: files[i].originalname.substring(0, files[i].originalname.indexOf('.')),
                            location: path.substring(path.lastIndexOf('/'), path.length) + '/' + config.documentPath.substring(0, config.documentPath.length - 1).substring(config.documentPath.lastIndexOf('/'), config.documentPath.length) + courseID + '/' + files[i].originalname,
                            fileType: files[i].mimetype.substring(files[i].mimetype.indexOf('/') + 1, files[i].mimetype.length),
                            courseID: courseID,
                            upload: new Date(),
                            displayDate: date
                        }, function (err, result) {
                        });
                    } catch (err) {
                        if (error === undefined) {
                            error = [];
                        }
                        error.push(err);
                    }
                }
                if (error) {
                    return res.status(500).send({
                        err: 1,
                        msg: error
                    });
                } else {
                    return res.status(200).send('OK');
                }
            }
            if (req.body.courseID !== undefined) {
                courseDB.findOne({
                    _id: req.body.courseID
                }).then(course => {
                    if (course === null) {
                        return res.status(404).send({
                            err: 0,
                            msg: 'Course not found'
                        });
                    }
                    copyFile(course._id, files, res);
                })
            } else {
                copyFile(config.defaultQuarter.quarter.year + (((('' + config.defaultQuarter.quarter.quarter).length) === 1) ? '0' : '') + config.defaultQuarter.quarter.quarter, files, res);
            }
        });
    });

    post('/post/v1/listDocument', function (req, res) {
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var allQuarterDocument = () => studentDocumentDB.find({
                courseID: config.defaultQuarter.quarter.year + (((('' + config.defaultQuarter.quarter.quarter).length) === 1) ? '0' : '') + config.defaultQuarter.quarter.quarter
            }).toArray();

            var courseDocument = (courseID) => studentDocumentDB.find({
                courseID: courseID
            }).toArray();

            if (req.body.courseID === undefined && req.body.studentID === undefined) {
                allQuarterDocument().then(data => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].documentID = data[i]._id;
                        delete data[i]._id;
                    }
                    res.status(200).send(data);
                });
            } else if (req.body.courseID !== undefined && req.body.studentID === undefined) {
                courseDocument(req.body.courseID).then(data => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].documentID = data[i]._id;
                        delete data[i]._id;
                    }
                    res.status(200).send(data);
                });
            }else{
                res.status(200).send('OK');
            }
        });
    });
}
