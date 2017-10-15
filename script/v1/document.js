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
            var copyFile = (courseID, files, res) => {
                var dir = config.documentPath + courseID;
                try {
                    fs.ensureDirSync(dir);
                } catch (err) {
                    return res.status(500).send({
                        err: 1,
                        msg: err
                    });
                }
                for (let i = 0; i < files.length; i++) {
                    try {
                        fs.moveSync(files[i].path, dir + '/' + files[i].originalname);
                    } catch (err) {
                        return res.status(520).send({
                            err: err.errno,
                            msg: err
                        });
                    }
                }
                return res.status(200).send('OK');
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
                copyFile('' + config.defaultQuarter.quarter.year + config.defaultQuarter.quarter.quarter, files, res);
            }
        });
    });
}
