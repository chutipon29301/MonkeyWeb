module.exports = function (app, db, post, gradeBitToString, gradeBitToArray) {
    var courseDB = db.collection('course');
    var configDB = db.collection('config');
    var userDB = db.collection('user');

    post('/post/v1/allCourse', function (req, res) {
        configDB.findOne({
            _id: 'config'
        }).then(config => {
            var quarter, year;
            if (req.body.year === undefined || req.body.quarter === undefined) {
                quarter = config.defaultQuarter.quarter.quarter;
                year = config.defaultQuarter.quarter.year;
            } else {
                quarter = parseInt(req.body.quarter);
                year = parseInt(req.body.year);
            }
            return courseDB.find({
                year: year,
                quarter: quarter
            }).toArray();
        }).then(allCourse => {
            var promise = [];
            for (let i = 0; i < allCourse.length; i++) {
                promise.push(userDB.findOne({
                    _id: parseInt(allCourse[i].tutor[0])
                }));
            }
            Promise.all(promise).then(values => {
                var response = [];
                for (let i = 0; i < values.length; i++) {
                    response.push({
                        courseID: allCourse[i]._id,
                        courseName: allCourse[i].subject + gradeBitToString(allCourse[i].grade) + allCourse[i].level,
                        day: allCourse[i].day,
                        tutorName: values[i].nicknameEn,
                        studentCount: allCourse[i].student.length,
                        room: allCourse[i].room,
                        grade: gradeBitToArray(allCourse[i].grade)
                    });
                }
                res.status(200).send(response);
            })
        });
    });
}