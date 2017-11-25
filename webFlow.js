console.log("[START] webFlow.js");
module.exports=function(app,db){
    var chalk=require("chalk");
    var moment=require("moment");
    var path=require("path");

    var userDB=db.collection("user");

    var post=app.locals.post;

    var configDB=db.collection("config");
    var quarterDB=db.collection("quarter");
    var getQuarter=function(year,quarter,callback){
        if(year===undefined){
            if(quarter===undefined)quarter="quarter";
            configDB.findOne({},function(err,config){
                if(config.defaultQuarter[quarter]){
                    quarterDB.findOne({
                        year:config.defaultQuarter[quarter].year,
                        quarter:config.defaultQuarter[quarter].quarter
                    },function(err,quarter){
                        if(quarter){
                            var output={quarterID:quarter._id};
                            delete quarter._id;
                            Object.assign(output,quarter);
                            callback(null,output);
                        }
                        else callback({err:"Configuration error occurs."});
                    });
                }
                else callback({err:"Year is not specified."});
            });
        }
        else{
            if(isFinite(year)&&isFinite(quarter)){
                quarterDB.findOne({
                    year:parseInt(year),
                    quarter:parseInt(quarter)
                },function(err,quarter){
                    if(quarter){
                        var output={quarterID:quarter._id};
                        delete quarter._id;
                        Object.assign(output,quarter);
                        callback(null,output);
                    }
                    else callback({err:"Specified year and quarter are not found."});
                });
            }
            else callback({err:"Year or quarter are not numbers."});
        }
    };
    var logPosition=function(cookie,callback){
        var userID=parseInt(cookie.monkeyWebUser);
        var password=cookie.monkeyWebPassword;
        if(userID&&password){
            userDB.findOne({_id:userID,password:password},function(err,result){
                if(result==null)callback(chalk.black.bgRed);
                else if(result.position=="dev")callback(chalk.black.bgBlue);
                else if(result.position=="admin")callback(chalk.black.bgCyan);
                else if(result.position=="tutor")callback(chalk.black.bgMagenta);
                else callback(chalk.black.bgGreen);
            });
        }
        else callback(chalk.black.bgWhite);
    }
    var checkAuth=function(options){
        if(options.length==0){
            return function(req,res,next){
                next();
            };
        }
        var query={};
        if(options.position)query["position"]=options.position;
        var qFilter=options.quarter!==undefined;
        var qYear,qQuarter,registrationState;
        if(qFilter){
            qYear=options.quarter.year;
            qQuarter=options.quarter.quarter;
            if(Array.isArray(options.quarter.registrationState)){
                registrationState=options.quarter.registrationState;
            }
            else registrationState=[options.quarter.registrationState];
        }
        if(options.studentStatus)query["student.status"]=options.studentStatus;
        if(options.tutorStatus)query["tutor.status"]=options.tutorStatus;
        return function(req,res,next){
            if(options.login){
                query["_id"]=parseInt(req.cookies.monkeyWebUser);
                query["password"]=req.cookies.monkeyWebPassword;
            }
            getQuarter(qYear,qQuarter,function(err,quarter){
                if(err)return404(req,res);
                else{
                    if(qFilter){
                        query["student.quarter"]={$elemMatch:{
                            year:quarter.year,quarter:quarter.quarter
                        }};
                    }
                    userDB.findOne(query,function(err,result){
                        if(qFilter){
                            if(result){
                                var x=result.student.quarter;
                                var foundYear=false,matchState=false;
                                for(var i=0;i<x.length;i++){
                                    if(x[i].year===quarter.year&&x[i].quarter===quarter.quarter){
                                        foundYear=true;
                                        if(registrationState.includes(x[i].registrationState))matchState=true;
                                        break;
                                    }
                                }
                                if(foundYear){
                                    if(matchState)next();
                                    else return404(req,res);
                                }
                                else{
                                    if(registrationState.includes("unregistered"))next();
                                    else return404(req,res);
                                }
                            }
                            else{
                                if(registrationState.includes("unregistered"))next();
                                else return404(req,res);
                            }
                        }
                        else{
                            if(result)next();
                            else return404(req,res);
                        }
                    });
                }
            });
        };
    };
    var addPugPage=function(page,options,callback){
        if(options==undefined)options={};
        var url=options.url;
        if(url==undefined)url="/"+page;
        var middlewareOptions=options.middlewareOptions;
        if(middlewareOptions==undefined)middlewareOptions={};
        if(callback==undefined)callback=function(x){x({});};
        app.get(url,checkAuth(middlewareOptions),function(req,res){
            logPosition(req.cookies,function(positionColor){
                console.log(chalk.black.bgGreen("[PAGE REQUEST]"),page,"FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),moment().format("@ dddDDMMMYYYY HH:mm:ss"));
                callback(function(local){
                    post("post/name",{userID:req.cookies.monkeyWebUser},function(result){
                        local.webUser={userID:parseInt(req.cookies.monkeyWebUser),firstname:result.firstname,lastname:result.lastname};
                        post("post/position",{userID:req.cookies.monkeyWebUser},function(result){
                            local.webUser.position=result.position;
                            res.status(200).render(page,local);
                        });
                    });
                },req,res);
            });
        });
    };
    var addPage=function(page,options){
        if(options==undefined)options={};
        var url=options.url;
        if(url==undefined)url="/"+page;
        var outputPath=path.join(__dirname,"old/"+page+".html");
        var middlewareOptions=options.middlewareOptions;
        if(middlewareOptions==undefined)middlewareOptions={};
        app.get(url,checkAuth(middlewareOptions),function(req,res){
            logPosition(req.cookies,function(positionColor){
                console.log(chalk.black.bgGreen("[PAGE REQUEST]"),page,"FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),moment().format("@ dddDDMMMYYYY HH:mm:ss"));
                res.status(200).sendFile(outputPath);
            });
        });
    };
    var return404=function(req,res){
        logPosition(req.cookies,function(positionColor){
            console.log(chalk.black.bgYellow("[404 REQUEST]",req.method,req.originalUrl,"FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),moment().format("@ dddDDMMMYYYY HH:mm:ss")));
            console.log("\treq.body","=>",req.body);
            res.status(404).sendFile(path.join(__dirname,"old/404.html"));
        });
    };

    addPage("login");
    addPage("login",{url:"/"});
    addPugPage("studentDocument");
    var options={middlewareOptions:{login:true,position:"student"}};
        options.middlewareOptions.studentStatus="inactive";
            addPugPage("registrationName",options);
        options.middlewareOptions.studentStatus="active";
            addPugPage("home",options);
            addPugPage("studentProfile",options);
            addPugPage("summerAbsentForm",options);
            options.middlewareOptions.quarter={quarter : 4 , year : 2017 , registrationState:"finished"};
                addPugPage("absentForm",options);
                addPugPage("addForm",options);
                addPugPage("permanentAdtendance",options);
            options.middlewareOptions.quarter={quarter : 4 , year : 2017 , registrationState:["unregistered","rejected"]};
                addPugPage("registrationCourse",options);
                addPugPage("registrationHybrid",options);
                addPugPage("registrationSkill",options);
                addPugPage("submit",options);
            options.middlewareOptions.quarter={quarter:4 , year : 2017 , registrationState:"untransferred"};
                addPugPage("registrationReceipt",options);
            options.middlewareOptions.quarter={quarter:"summer",registrationState:["unregistered","rejected"]};
                addPugPage("registrationSummer",options);
            options.middlewareOptions.quarter={quarter:"summer",registrationState:"untransferred"};
                addPugPage("summerReceipt",options);
            delete options.middlewareOptions.quarter;
        delete options.middlewareOptions.studentStatus;
    options.middlewareOptions.position={$ne:"student"};
        // addPage("editAbsent",options);
        addPugPage("adminHome",options);
        addPugPage("adminAllcourse",options);
        addPugPage("adminCoursedescription",options);
        addPugPage("tutorCommentStudent",options);
        addPugPage("tutorEditProfile",options);
        addPugPage("adminStudentAttendanceModifier",options);
        addPugPage("tutorCheckInHistory",options);
        addPugPage("tutorCheck",options);
        addPugPage("tutorCourseMaterial",options,function(callback,req,res){
            var local={moment:moment};
            getQuarter(req.query.year,req.query.quarter,function(err,quarter){
                if(err)res.send(err);
                else{
                    Object.assign(local,{quarter:quarter});
                    post("post/allCourseMaterial",{year:quarter.year,quarter:quarter.quarter},function(result){
                        Object.assign(local,result);
                        post("post/getConfig",{},function(result){
                            Object.assign(local,{config:result});
                            post("post/listQuarter",{status:"protected"},function(result){
                                Object.assign(local,{protectedQuarter:result.quarter});
                                callback(local);
                            });
                        });
                    });
                }
            });
        });
        options.middlewareOptions.position={$in:["admin","dev","mel"]};
        addPugPage("adminAllstudent",options);
        addPugPage("adminStudentProfileQ4",options);
        addPugPage("adminConference",options);
        addPugPage("adminCourseRoom",options);
        addPugPage("adminCourseTable",options);
        addPugPage("adminStudentprofile",options);
        addPugPage("adminCourseMaterial",options,function(callback,req,res){
            var local={moment:moment};
            getQuarter(req.query.year,req.query.quarter,function(err,quarter){
                if(err)res.send(err);
                else{
                    Object.assign(local,{quarter:quarter});
                    post("post/allCourseMaterial",{year:quarter.year,quarter:quarter.quarter},function(result){
                        Object.assign(local,result);
                        post("post/getConfig",{},function(result){
                            Object.assign(local,{config:result});
                            post("post/listQuarter",{status:"protected"},function(result){
                                Object.assign(local,{protectedQuarter:result.quarter});
                                callback(local);
                            });
                        });
                    });
                }
            });
        });
        options.middlewareOptions.position={$in:["mel"]};
        addPugPage("checkInSummary",options);
    addPage("testadmin",{middlewareOptions:{login:true,position:"dev"}});
    addPugPage("testDev",{middlewareOptions:{login:true,position:"dev"}},function(callback){
        var local={moment:moment};
        post("post/allCourse",{quarter:"all"},function(result){
            Object.assign(local,result);
            userDB.find({position:{$ne:"student"}}).sort({_id:1}).toArray(function(err,result){
                Object.assign(local,{tutor:result});
                callback(local);
            });
        });
    });
    // addPage("firstConfig",{backendDir:true});
    app.all("*",return404);
}
