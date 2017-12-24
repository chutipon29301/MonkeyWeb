var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db, post, fs) {
    post('/post/v1/getStudentVdoList', function (req, res) {
        if (!req.body.studentCode) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var destination = '/Volumes/VDO/' + req.body.studentCode + '/';
        fs.readdir(destination, (err, files) => {
            if (err) {
                return res.status(500).send({
                    err: 2,
                    errInfo: err
                });
            }
            for (let i = 0; i < files.length; i++) {
                if (files[i] === 'log.csv') {
                    remove(files, i);
                }
            }
            res.status(200).send(files);
        });
    });

    function remove(array, element) {
        const index = array.indexOf(element);
        array.splice(index, 1);
    }
}