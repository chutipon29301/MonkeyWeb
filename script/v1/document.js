module.exports = function(app, db, post){
    var courseDB = db.collection('course');
    var configDB = db.collection('config');

    post('/post/v1/uploadDocument', function(req, res){
        if(req.body.files === undefined){
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        res.status(200).send('OK');
    });
}