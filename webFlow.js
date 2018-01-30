console.log("[START] webFlow.js");
module.exports = function (app, db, pasport) {
    var chalk = require("chalk");
    var moment = require("moment");
    var path = require("path");
    var userDB = db.collection("user");
    var post = app.locals.post;
    var configDB = db.collection("config");
    var quarterDB = db.collection("quarter");
    var auth = require('./auth.js');
    var getQuarter = function (year, quarter, callback) {
        if (year === undefined) {
            if (quarter === undefined) quarter = "quarter";
            configDB.findOne({}, function (err, config) {
                if (config.defaultQuarter[quarter]) {
                    quarterDB.findOne({
                        year: config.defaultQuarter[quarter].year,
                        quarter: config.defaultQuarter[quarter].quarter
                    }, function (err, quarter) {
                        if (quarter) {
                            var output = { quarterID: quarter._id };
                            delete quarter._id;
                            Object.assign(output, quarter);
                            callback(null, output);
                        }
                        else callback({ err: "Configuration error occurs." });
                    });
                }
                else callback({ err: "Year is not specified." });
            });
        }
        else {
            if (isFinite(year) && isFinite(quarter)) {
                quarterDB.findOne({
                    year: parseInt(year),
                    quarter: parseInt(quarter)
                }, function (err, quarter) {
                    if (quarter) {
                        var output = { quarterID: quarter._id };
                        delete quarter._id;
                        Object.assign(output, quarter);
                        callback(null, output);
                    }
                    else callback({ err: "Specified year and quarter are not found." });
                });
            }
            else callback({ err: "Year or quarter are not numbers." });
        }
    };
    var logPosition = function (user) {
        if (user) {
            if (user.position == "dev") return chalk.black.bgBlue;
            else if (user.position == "admin") return chalk.black.bgCyan;
            else if (user.position == "tutor") return chalk.black.bgMagenta;
            else return chalk.black.bgGreen;
        }
        else return chalk.black.bgWhite;
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    var return404 = function (req, res) {
        if (req.user) {
            let positionColor = logPosition(req.user)
            console.log(chalk.black.bgYellow("[404 REQUEST]", req.method, req.originalUrl, "FROM", req.ip, positionColor("#" + req.cookies.monkeyWebUser), moment().format("@ dddDDMMMYYYY HH:mm:ss")));
            console.log("\treq.body", "=>", req.body);
            res.status(404).sendFile(path.join(__dirname, "old/404.html"));
        } else {
            console.log(chalk.black.bgYellow("[404 REQUEST]", req.method, req.originalUrl, "FROM", req.ip, moment().format("@ dddDDMMMYYYY HH:mm:ss")));
            console.log("\treq.body", "=>", req.body);
            res.status(404).sendFile(path.join(__dirname, "old/404.html"));
        }
    };

    var addPugPage = function (page, side, permission, localObj) {
        app.get('/' + page.split('/'), auth.isLoggedIn, async function (req, res) {
            let local = {}
            if(req.user){
                if (localObj) {
                    if (typeof localObj == 'function') {
                        local = await localObj(req);
                    } else local = localObj;
                }
                local.webUser = {
                    userID: parseInt(req.user._id),
                    firstname: req.user.firstname,
                    lastname: req.user.lastname,
                    position: req.user.position
                }
            }
            if (!side) res.status(200).render(page.split('/')[page.split('/').length - 1],local);
            else if (req.user) {
                try {
                    let config = await configDB.findOne({ _id: "config" })
                    if (auth.authorize(req.user, side, permission, config)) {
                        
                        res.status(200).render(page.split('/')[page.split('/').length - 1], local);
                    } else return404(req,res);
                }
                catch (error) {
                    console.log(error); 
                    return404(req,res);
                }
            } else return404(req,res);
        })
    }
    app.get('*', function (req, res, next) {
        if (req.url == '/login') req.logOut();
        if (req.isAuthenticated()) {
            let positionColor = logPosition(req.user);
            console.log(chalk.black.bgGreen("[GET REQUEST]"), req.url, "FROM", req.ip, positionColor("#" + req.user._id), moment().format("@ dddDDMMMYYYY HH:mm:ss"));
            res.cookie('monkeyWebUser', '' + req.user._id)
            res.cookie('monkeyWebPassword', req.user.password)
        } else {
            console.log(chalk.black.bgGreen("[GET REQUEST]"), req.url, "FROM", req.ip, moment().format("@ dddDDMMMYYYY HH:mm:ss"));
        }
        next()
    })
    app.get('/test',function(req,res){
        res.status(200).render('test',{})
    })
    app.get('/',async function (req, res) {
        if (req.isAuthenticated()) {
            let local = {
                webUser: {
                    userID: parseInt(req.user._id),
                    firstname: req.user.firstname,
                    lastname: req.user.lastname,
                    position: req.user.position
                }
            }
            if (req.user.position == 'student') {
                if (req.user.student.status == 'active'){
                    let config = await configDB.findOne({_id:"config"})
                    for(let i in req.user.student.quarter)
                        if ( req.user.student.quarter[i].year == config.defaultQuarter.registration.year
                            && req.user.student.quarter[i].quarter == config.defaultQuarter.registration.quarter ){
                            if("untransferred" == req.user.student.quarter[i].registrationState)
                                return res.status(200).render('registrationReceipt', local);
                        }
                    return res.status(200).render('home', local);
                } 
                if (req.user.student.status == 'inactive') return res.status(200).render('registrationName',local);
            }
            else return res.status(200).render('adminHome', local);
        }
        return res.redirect('/login')
    })

    /*  *********************************************************************************************************
        *********** home , registrationReceipt , registrationName are handled in get '/' above ******************
        *********************************************************************************************************

        addPugPage(pageURL,side,permission,localObject)
    
        - pageURL can be aaaa/bbbb/cccc/dddd which return pug page "dddd"(the last one by spliting slash)
        - side can be "staff" or "student"
        - permission
            -for staff , bigger or equal position can access this page
            -for student , permission have to be an object with status , state , quarter
                do not check if field is undefined
        - localObject is an object that will pass to pug page or can be a function which return promise that resolve to object
    */
    addPugPage("login");
    addPugPage("studentDocument");
    let side = 'student'
    let permission = { status: 'active' }
    addPugPage("studentProfile", side, permission);
    addPugPage("summerAbsentForm", side, permission);
    permission = { status: 'active', state: 'finished' }
    addPugPage("absentAgreeForm", side, permission);
    addPugPage("absentForm", side, permission);
    addPugPage("addForm", side, permission);
    addPugPage("addAgreeForm", side, permission);
    addPugPage("permanentAdtendance", side, permission);
    permission = { status: 'active', state: ["unregistered", "rejected"] }
    addPugPage("regisPage", side, permission);
    addPugPage("registrationCourse", side, permission);
    addPugPage("registrationHybrid", side, permission);
    addPugPage("registrationSkill", side, permission);
    addPugPage("submit", side, permission);
    permission = { status: 'active', state: ["unregistered", "rejected"], quarter: "summer" }
    addPugPage("registrationSummer", side, permission);
    permission = { status: 'active', state: "untransferred", quarter: "summer" }
    addPugPage("summerReceipt", side, permission);
    side = 'staff'
    permission = 'tutor'
    addPugPage("adminHome", side, permission);
    addPugPage("adminAllcourse", side, permission);
    addPugPage("adminCoursedescription", side, permission);
    addPugPage("adminHybridInfo", side, permission);
    addPugPage("tutorCommentStudent", side, permission);
    addPugPage("tutorEditProfile", side, permission);
    addPugPage("adminStudentAttendanceModifier", side, permission);
    addPugPage("tutorCheckInHistory", side, permission);
    addPugPage("tutorCheckInActivity", side, permission);
    addPugPage("tutorCheck", side, permission);
    addPugPage("tutorCourseMaterial", side, permission, function (req) {
        return new Promise((res, rej) => {
            var local = { moment: moment };
            getQuarter(req.query.year, req.query.quarter, function (err, quarter) {
                if (err) res.send(err);
                else {
                    Object.assign(local, { quarter: quarter });
                    post("post/allCourseMaterial", { year: quarter.year, quarter: quarter.quarter }, function (result) {
                        Object.assign(local, result);
                        post("post/getConfig", {}, function (result) {
                            Object.assign(local, { config: result });
                            post("post/listQuarter", { status: "protected" }, function (result) {
                                Object.assign(local, { protectedQuarter: result.quarter });
                                res(local);
                            });
                        });
                    });
                }
            });
        })
    });
    addPugPage("tutorQrGenerator", side, permission);
    permission = 'admin'
    addPugPage("adminAllstudent", side, permission);
    addPugPage("adminStudentProfileQ4", side, permission);
    addPugPage("adminConference", side, permission);
    addPugPage("adminCourseRoom", side, permission);
    addPugPage("adminCourseTable", side, permission);
    addPugPage("adminStudentprofile", side, permission);
    addPugPage("adminCourseMaterial", side, permission, function (req) {
        return new Promise((res, rej) => {
            var local = { moment: moment };
            getQuarter(req.query.year, req.query.quarter, function (err, quarter) {
                if (err) res.send(err);
                else {
                    Object.assign(local, { quarter: quarter });
                    post("post/allCourseMaterial", { year: quarter.year, quarter: quarter.quarter }, function (result) {
                        Object.assign(local, result);
                        post("post/getConfig", {}, function (result) {
                            Object.assign(local, { config: result });
                            post("post/listQuarter", { status: "protected" }, function (result) {
                                Object.assign(local, { protectedQuarter: result.quarter });
                                res(local);
                            });
                        });
                    });
                }
            });
        })
    });
    permission = 'mel'
    addPugPage("checkInSummary", side, permission);
    permission = 'dev'
    addPugPage("testDev", side, permission, function () {
        return new Promise((res, rej) => {
            var local = { moment: moment };
            post("post/allCourse", { quarter: "all" }, function (result) {
                Object.assign(local, result);
                userDB.find({ position: { $ne: "student" } }).sort({ _id: 1 }).toArray(function (err, result) {
                    Object.assign(local, { tutor: result });
                    res(local)
                });
            });
        })
    });
    app.all("*", return404);
}


