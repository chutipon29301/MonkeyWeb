module.exports = function (app, db, post, gradeBitToString) {
    var courseDB = db.collection('course');
    var configDB = db.collection('config');

    post('/post/v1/allCourse', function (req, res) {
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var response;
            console.log(config);
            var quarter, year;
            if (req.body.year === undefined || req.body.quarter === undefined) {
                quarter = config.defaultQuarter.quarter.quarter;
                year = config.defaultQuarter.quarter.year;
            } else {
                quarter = parseInt(req.body.quarter);
                year = parseInt(req.body.year);
            }
            courseDB.find({
                year: year,
                quarter: quarter
            }).toArray().then(data => {
                var promise = [];
                console.log(data);
                res.status(200).send('OK');
            });
        });
    });
}