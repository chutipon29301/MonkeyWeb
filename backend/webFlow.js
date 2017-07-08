console.log("[START] webFlow.js");
module.exports=function(app,db){
    var chalk=require("chalk");
    var moment=require("moment");
    var path=require("path");

    var userDB=db.collection("user");

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
        if(options.registrationState)query["student.registrationState"]=options.registrationState;
        if(options.studentStatus)query["student.status"]=options.studentStatus;
        if(options.tutorStatus)query["tutor.status"]=options.tutorStatus;
        return function(req,res,next){
            if(options.login)query["_id"]=parseInt(req.cookies.monkeyWebUser),query["password"]=req.cookies.monkeyWebPassword;
            userDB.findOne(query,function(err,result){
                if(result==null)return404(req,res);
                else next();
            });
        };
    };
    var addPage=function(page,options){
        if(options==undefined)options={};
        var url=options.url;
        if(url==undefined)url="/"+page;
        var outputPath=path.join(__dirname,"../",page+".html");
        if(options.backendDir==true)outputPath=path.join(__dirname,page+".html");
        var middlewareOptions=options.middlewareOptions;
        if(middlewareOptions==undefined)middlewareOptions={};
        var type="html";
        if(options.type)type=options.type;
        var local={};
        if(options.local)local=options.local;
        app.get(url,checkAuth(middlewareOptions),function(req,res){
            logPosition(req.cookies,function(positionColor){
                console.log(chalk.black.bgGreen("[PAGE REQUEST]"),page,"FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),moment().format("@ dddDDMMMYYYY HH:mm:ss"));
                if(type=="pug")res.status(200).render(page,local);
                else res.status(200).sendFile(outputPath);
            });
        });
    };
    var return404=function(req,res){
        logPosition(req.cookies,function(positionColor){
            console.log(chalk.black.bgYellow("[404 REQUEST]",req.method,req.originalUrl,"FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),moment().format("@ dddDDMMMYYYY HH:mm:ss")));
            console.log("\treq.body","=>",req.body);
            res.status(404).sendFile(path.join(__dirname,"../404.html"));
        });
    };

    var getCourseDB=function(callback){
        db.collection("config").findOne({},function(err,config){
            callback(db.collection("CR"+config.year+"Q"+config.quarter));
        });
    };
    var getCourseName=function(courseID,callback){
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                var subject=result.subject;
                var grade=result.grade;
                var level=result.level;
                callback(subject+gradeBitToString(grade)+level);
            });
        });
    };
    var callbackLoop=function(n,inLoop,endLoop){
        var c=0;
        var finish=function(){
            if(c==n)endLoop();
            c++;
        };
        for(var i=0;i<n;i++){
            inLoop(i,function(){
                finish();
            });
        }
        finish();
    };
    var gradeBitToString=function(bit){
        var output="",p=false,s=false;
        for(var i=0;i<6;i++){
            if(bit&(1<<i)){
                if(p==false){
                    p=true;
                    output+="P";
                }
                output+=(i+1);
            }
        }
        for(var i=0;i<6;i++){
            if(bit&(1<<(i+6))){
                if(s==false){
                    s=true;
                    output+="S";
                }
                output+=(i+1);
            }
        }
        if(bit&(1<<12))output+="SAT";
        return output;
    };

    addPage("login");
    addPage("login",{url:"/"});
    var options={middlewareOptions:{login:true,position:"student",studentStatus:{$in:["active","inactive"]}}};
        addPage("home",options);
        addPage("home2",options);
        addPage("document",options);
        options.middlewareOptions.registrationState={$ne:"unregistered"};
            addPage("studentProfile",options);
        options.middlewareOptions.registrationState="unregistered";
            addPage("registrationName",options);
            addPage("registrationCourse",options);
            addPage("registrationHybrid",options);
            addPage("registrationSkill",options);
            addPage("registrationSkill2",options);
            addPage("submit",options);
        options.middlewareOptions.registrationState={$in:["untransferred","rejected"]};
            addPage("registrationReceipt",options);
        delete options.middlewareOptions.registrationState;
    delete options.middlewareOptions.studentStatus;
    options.middlewareOptions.position={$ne:"student"};
        addPage("adminHome",options);
        addPage("adminAllstudent",options);
        addPage("adminAllcourse",options);
        addPage("adminStudentprofile",options);
        addPage("adminCoursedescription",options);
        addPage("adminCourseRoom",options);
        addPage("adminCourseTable",options);
        app.get("/adminCourseMaterial",checkAuth(options.middlewareOptions),function(req,res){
            logPosition(req.cookies,function(positionColor){
                console.log(chalk.black.bgGreen("[PAGE REQUEST]"),"adminCourseMaterial","FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),moment().format("@ dddDDMMMYYYY HH:mm:ss"));
                (function(options,callback){
                    var output=[];
                    getCourseDB(function(courseDB){
                        courseDB.find({tutor:{$ne:99000}}).sort({tutor:1,day:1,subject:1,grade:1,level:1}).toArray(function(err,course){
                            callbackLoop(course.length,function(i,continueLoop){
                                getCourseName(course[i]._id,function(courseName){
                                    var tutorNicknameEn=[];
                                    callbackLoop(course[i].tutor.length,function(j,continueLoop){
                                        userDB.findOne({_id:course[i].tutor[j]},function(err,tutor){
                                            tutorNicknameEn[j]=tutor.nicknameEn;
                                            continueLoop();
                                        });
                                    },function(){
                                        output[i]={courseID:course[i]._id,
                                            tutor:course[i].tutor,tutorNicknameEn:tutorNicknameEn,
                                            day:course[i].day,courseName:courseName,
                                            submission:course[i].submission
                                        };
                                        continueLoop();
                                    });
                                });
                            },function(){
                                db.collection("config").findOne({},function(err,config){
                                    callback(options,{course:output,moment:moment,config:config});
                                });
                            });
                        });
                    });
                })(options,function(options,output){
                    res.status(200).render("adminCourseMaterial",output);
                });
            });
        });
                    addPage("tutorCourseMaterial",Object.assign({},options,{type:"pug"}));
                    addPage("testadmin",{backendDir:true,middlewareOptions:{login:true,position:"dev"}});
                    app.all("*",return404);
            // addPage("adminCourseMaterial",Object.assign({},options,{type:"pug",local:Object.assign({},output,{moment:moment})}));

    // addPage("firstConfig",{backendDir:true});
}
