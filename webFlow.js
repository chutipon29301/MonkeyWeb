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
    var courseDB = db.collection('course')
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

    app.use('/dev', require('./script/dev/index')(auth, db));
    app.use('/v2', require('./script/v2/index')(auth));
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
    app.get('/test', function (req, res) {
        res.status(200).render('test', {})
    })
    app.get('/', async function (req, res) {
        if (req.isAuthenticated()) {
            let local = {
                webUser: {
                    userID: parseInt(req.user._id),
                    firstname: req.user.firstname,
                    lastname: req.user.lastname,
                    position: req.user.position
                },
                config: await configDB.findOne({})
            }
            if (req.user.position == 'student') {
                if (req.user.student.status == 'active') {
                    let config = await configDB.findOne({ _id: "config" })
                    for (let i in req.user.student.quarter)
                        if (req.user.student.quarter[i].year == config.defaultQuarter.registration.year
                            && req.user.student.quarter[i].quarter == config.defaultQuarter.registration.quarter) {
                            if ("untransferred" == req.user.student.quarter[i].registrationState)
                                return res.redirect('/regisPage') 
                        }
                    return res.status(200).render('home', local);
                }
                if (req.user.student.status == 'inactive') return res.status(200).render('registrationName', local);
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
    app.get('/adminChat',function(req,res){return res.status(200).render('adminChat')})
    app.get('/login', function (req, res) {
        return res.status(200).render('login')
    })
    app.get('/studentDocument', auth.isLoggedIn, async function (req, res) {
        console.log(req.query)
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        return res.status(200).render('studentDocument', local)
    })
    app.get("/studentProfile", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active' }, local.config)) return res.status(200).render('studentProfile', local)
        else return404(req, res)
    })
    app.get("/summerAbsentForm", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active' }, local.config)) return res.status(200).render('summerAbsentForm', local)
        else return404(req, res)
    })
    app.get("/absentAgreeForm", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active', state: 'finished' }, local.config)) return res.status(200).render('absentAgreeForm', local)
        else return404(req, res)
    })
    app.get("/absentForm", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active', state: 'finished' }, local.config)) return res.status(200).render('absentForm', local)
        else return404(req, res)
    })
    app.get("/addForm", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active', state: 'finished' }, local.config)) return res.status(200).render('addForm', local)
        else return404(req, res)
    })
    app.get("/addAgreeForm", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active', state: 'finished' }, local.config)) return res.status(200).render('addAgreeForm', local)
        else return404(req, res)
    })
    app.get("/permanentAdtendance", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'student', { status: 'active', state: 'finished' }, local.config)) return res.status(200).render('permanentAdtendance', local)
        else return404(req, res)
    })
    app.get("/regisPage", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if(auth.authorize(req.user,'student',{ status: 'active', state: "untransferred" },local.config)){
            try {
                local.courseNumber = (await courseDB.find({
                    quarter:local.config.defaultQuarter.registration.quarter,
                    year:local.config.defaultQuarter.registration.year,
                    student:parseInt(req.user._id),
                }).toArray()).length
                local.qname = (await quarterDB.findOne({
                    quarter:local.config.defaultQuarter.registration.quarter,
                    year:local.config.defaultQuarter.registration.year
                })).name
                return res.status(200).render('registrationReceipt',local)    
            } catch (error) {
                return return404(req,res)
            }
        }
        if(auth.authorize(req.user,'student',{ status: 'active', state: ["unregistered", "rejected"] },local.config)){
            if(local.config.allowRegistration){
                if(local.config.defaultQuarter.registration.quarter > 10) return res.status(200).render('registrationSummer',local)
                return res.status(200).render('regisPage',local)    
            }else if(req.cookies.vid&&req.cookies.vpw){
                try {
                    let user = await userDB.findOne({_id:parseInt(req.cookies.vid),password:req.cookies.vpw})
                    if(user.position && user.position!='student'){
                        if(local.config.defaultQuarter.registration.quarter > 10) return res.status(200).render('registrationSummer',local)
                        return res.status(200).render('regisPage',local)
                    }
                    else res.status(200).render('verifyRegisUser', local)
                } catch (error) {
                    return return404(req, res)
                }
            } else res.status(200).render('verifyRegisUser', local)
        } else return404(req, res)
    })
    app.get("/registrationSummer", auth.isLoggedIn, async function (req, res) {
        return res.redirect('/regisPage')
    })
    app.get("/registrationReceipt", auth.isLoggedIn, function (req, res) {
        return res.redirect('/regisPage')
    })
    app.get("/summerReceipt", auth.isLoggedIn, function (req, res) {
        return res.redirect('/regisPage')
    })
    app.get("/adminHome", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('adminHome', local)
        else return404(req, res)
    })
    app.get('/adminChat', function (req, res) {
        console.log(req.query)
        return res.status(200).render('adminChat')
    })
    app.get("/adminAllcourse", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('adminAllcourse', local)
        else return404(req, res)
    })
    app.get("/adminCoursedescription", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('adminCoursedescription', local)
        else return404(req, res)
    })
    app.get("/adminHybridInfo", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('adminHybridInfo', local)
        else return404(req, res)
    })
    app.get("/tutorCommentStudent", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('tutorCommentStudent', local)
        else return404(req, res)
    })
    app.get("/tutorEditProfile", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('tutorEditProfile', local)
        else return404(req, res)
    })
    app.get("/adminStudentAttendanceModifier", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('adminStudentAttendanceModifier', local)
        else return404(req, res)
    })
    app.get("/tutorCheckInHistory", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('tutorCheckInHistory', local)
        else return404(req, res)
    })
    app.get("/tutorCheckInActivity", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('tutorCheckInActivity', local)
        else return404(req, res)
    })
    app.get("/tutorCheck", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('tutorCheck', local)
        else return404(req, res)
    })
    app.get("/tutorCourseMaterial", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) {
            local.moment = moment;
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
                                res.status(200).render('tutorCourseMaterial', local);
                            });
                        });
                    });
                }
            });
        }
        else return404(req, res)
    })
    app.get("/tutorQrGenerator", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) return res.status(200).render('tutorQrGenerator', local)
        else return404(req, res)
    })
    app.get("/testAdmin", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('testAdmin', local)
        else return404(req, res)
    })
    app.get("/adminAllstudent", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('adminAllstudent', local)
        else return404(req, res)
    })
    app.get("/adminStudentProfileQ4", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('adminStudentProfileQ4', local)
        else return404(req, res)
    })
    app.get("/adminConference", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('adminConference', local)
        else return404(req, res)
    })
    app.get("/adminCourseRoom", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('adminCourseRoom', local)
        else return404(req, res)
    })
    app.get("/adminCourseTable", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('adminCourseTable', local)
        else return404(req, res)
    })
    app.get("/adminStudentprofile", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'admin', local.config)) return res.status(200).render('adminStudentprofile', local)
        else return404(req, res)
    })
    app.get("/adminCourseMaterial", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'tutor', local.config)) {
            local.moment = moment;
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
                                res.status(200).render('adminCourseMaterial', local);
                            });
                        });
                    });
                }
            });
        }
        else return404(req, res)
    })
    app.get("/checkInSummary", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'mel', local.config)) return res.status(200).render('checkInSummary', local)
        else return404(req, res)
    })
    app.get("/testDev", auth.isLoggedIn, async function (req, res) {
        let local = {
            webUser: {
                userID: parseInt(req.user._id),
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                position: req.user.position
            },
            config: await configDB.findOne({})
        }
        if (auth.authorize(req.user, 'staff', 'dev', local.config)) {
            local.moment = moment
            post("post/allCourse", { quarter: "all" }, function (result) {
                Object.assign(local, result);
                userDB.find({ position: { $ne: "student" } }).sort({ _id: 1 }).toArray(function (err, result) {
                    Object.assign(local, { tutor: result });
                    return res.status(200).render('testDev', local)
                });
            });

        }
        else return404(req, res)
    })
    app.all("*", return404);
}


