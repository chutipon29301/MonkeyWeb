var ObjectID = require('mongodb').ObjectID;
var CryptoJS = require('crypto-js');
const AES_PASSWORD = 'monkey';

/**
 * Edit system path here
 */
const destinationConst = '/Volumes/VDO/';
/**
 * End editing path
 */

module.exports = function (app, db, post, fs) {
    post('/post/v1/getStudentVdoList', function (req, res) {
        if (!req.body.studentCode) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var destination = destinationConst + req.body.studentCode + '/';
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
            res.status(200).send({
                files: files
            });
        });
    });

    post('/post/v1/encryptRequest', function (req, res) {
        if (!req.body.body) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Reqeust'
            });
        }
        var string = req.body.body;
        var encrypted = CryptoJS.AES.encrypt(string, AES_PASSWORD);
        return res.status(200).send({
            path: encodeURIComponent(encrypted.toString())
        });
    });

    app.get('/get/v1/video', function (req, res) {
        if (!req.query.v) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Reqeust'
            });
        }
        var query = decodeURIComponent(req.query.v);
        var decrypted = CryptoJS.AES.decrypt(query, AES_PASSWORD);
        var decode = decrypted.toString(CryptoJS.enc.Utf8);
        var requestObject = JSON.parse(decode);
        if (!(requestObject.studentCode && requestObject.videoName)) {
            res.status(400).send({
                err: 0,
                msg: 'Bad Reqeust'
            });
        }
        var destination = destinationConst + requestObject.studentCode + '/' + requestObject.videoName;
        var stat = fs.statSync(destination)
        var fileSize = stat.size;
        var range = req.headers.range;
        if (range) {
            var parts = range.replace(/bytes=/, "").split("-")
            var start = parseInt(parts[0], 10);
            var end = parts[1] ? parseInt(parts[1], 10) :
                fileSize - 1;
            var chunksize = (end - start) + 1
            var file = fs.createReadStream(destination, {
                start,
                end
            });
            var head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(destination).pipe(res);
        }
    });

    function remove(array, element) {
        const index = array.indexOf(element);
        array.splice(index, 1);
    }
}