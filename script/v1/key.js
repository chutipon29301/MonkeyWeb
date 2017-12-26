var ObjectID = require('mongodb').ObjectID;
var CryptoJS = require('crypto-js');
const AES_PASSWORD = 'monkey';

/**
 * Edit system path here
 */
const destinationConst = '/Volumes/';
const isMacDebugging = !/^win/.test(process.platform);
/**
 * End editing path
 */

module.exports = function (app, db, post, fs) {

    post('/post/v1/getKeyStudentPath', function (req, res) {
        if (!req.body.path) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Reqeust'
            });
        }
        var requestObject = {
            path: req.body.path
        }
        var string = JSON.stringify(requestObject)
        var encrypted = CryptoJS.AES.encrypt(string, AES_PASSWORD);
        return res.status(200).send({
            path: encodeURIComponent(encrypted.toString())
        });
    });

    app.get('/get/v1/keyStudent', function (req, res) {
        if (!req.query.k) {
            return res.status(400).send({
                err: 0,
                msg: 'Bad Reqeust'
            });
        }
        var query = decodeURIComponent(req.query.k);
        var decrypted = CryptoJS.AES.decrypt(query, AES_PASSWORD);
        var decode = decrypted.toString(CryptoJS.enc.Utf8);
        var requestObject = JSON.parse(decode);
        if (!requestObject.path) {
            res.status(400).send({
                err: 0,
                msg: 'Bad Reqeust'
            });
        }

        if (isMacDebugging) {
            var string = requestObject.path;
            var result = string.replace('file://monkeycloud/', destinationConst);
            requestObject.path = result;
        }
        var path = requestObject.path
        var file = fs.createReadStream(path);
        var stat = fs.statSync(path);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        file.pipe(res);
    });
}