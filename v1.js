var gradeBitToString = function (bit) {
    var output = '', p = false, s = false;
    for (var i = 0; i < 6; i++) {
        if (bit & (1 << i)) {
            if (p == false) {
                p = true;
                output += 'P';
            }
            output += (i + 1);
        }
    }
    for (var i = 0; i < 6; i++) {
        if (bit & (1 << (i + 6))) {
            if (s == false) {
                s = true;
                output += 'S';
            }
            output += (i + 1);
        }
    }
    if (bit & (1 << 12)) output += 'SAT';
    return output;
};

module.exports = function (app, db, post) {

    var quarterDB = db.collection('quarter');
    var studentHybridDB = db.collection('hybridStudent');
    var studentSkillDB = db.collection('skillStudent');
    var userDB = db.collection('user');
    var courseDB = db.collection('course');
    var configDB = db.collection('config');

    require('./script/v1/quarter.js')(app, db, post);
    require('./script/v1/subject.js')(app, db, post,gradeBitToString);
    require('./script/v1/course.js')(app, db, post,gradeBitToString);
    require('./script/v1/hybrid.js')(app, db, post);
    require('./script/v1/skill.js')(app, db, post);
    require('./script/v1/timetable.js')(app, db, post);
    require('./script/v1/room.js')(app, db, post, gradeBitToString);

}