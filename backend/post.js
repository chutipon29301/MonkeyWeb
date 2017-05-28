console.log("[START] post.js");
var run=function(app,db){
    var moment=require("moment");
    var path=require("path");

    var configDB=db.collection("config");
    // var hybridSeatDB=db.collection("hybridSeat");
    // var hybridSheetDB=db.collection("hybridSheet");
    // in function var courseDB=db.collection("CRXXQX");
    var userDB=db.collection("user");

    var gradeToString=function(bit){
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
    var stringToBit=function(grade){
        var output=0,p=false,s=false;
        if(grade[0]=='S'&&grade[1]=='A')return (1<<12);
        if(grade[0]=='P'){
            for(var i=1;i<grade.length;i++){
                output|=(1<<(grade[i]-'1'));
            }
        }
        if(grade[0]=='S'){
            for(var i=1;i<grade.length;i++){
                output|=(1<<(grade[i]-'1'+6));
            }
        }
        return output;
    };
    var getCourseName=function(id,callback){
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            courseDB.findOne({_id:id},function(err,result){
                var subject=result.subject;
                var grade=result.grade;
                var level=result.level;
                callback(subject+gradeToString(grade)+level);
            });
        });
    };

    var pagedata=function(fileName){
        var fs=require("fs-extra");
        var data=fs.readFileSync(path.join(__dirname,"../",fileName+".html")).toString();
        return data.replace(/public\//g,"").replace(/\.html/g,"");
    };
    var addPage=function(pageName){
        app.get("/"+pageName,function(req,res){
            console.log("[PAGE REQUEST] "+pageName+" FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
            res.send(pagedata(pageName))
        });
    };
    addPage("login");
    addPage("registrationCourse");
    addPage("home");
    addPage("home2");
    app.get("/",function(req,res){
        console.log("[PAGE REQUEST] index FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        // res.sendFile(path.join(__dirname,"../","login.html"));
        res.send(pagedata("login"))
    });
    // app.get("/registrationCourse",function(req,res){
    //     console.log("[PAGE REQUEST] regis FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
    //     // res.sendFile(path.join(__dirname,"../","registrationCourse.html"));
    //     res.send(pagedata("registrationCourse"))
    // });
    // app.get("/home",function(req,res){
    //     console.log("[PAGE REQUEST] regis FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
    //     // res.sendFile(path.join(__dirname,"../","home.html"));
    //     res.send(pagedata("home"))
    // });
    // app.get("/login",function(req,res){
    //     console.log("[PAGE REQUEST] regis FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
    //     // res.sendFile(path.join(__dirname,"../","login.html"));
    //     res.send(pagedata("login"))
    // });
    app.get("/testadmin",function(req,res){
        console.log("[PAGE REQUEST] testadmin FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        res.sendFile(path.join(__dirname,"testadmin.html"));
    });
    app.get("/firstConfig",function(req,res){
        console.log("[PAGE REQUEST] firstConfig FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        res.sendFile(path.join(__dirname,"firstConfig.html"));
    });

    // All post will return {err} if error occurs

    //OK {userID,password} return {verified}
    app.post("/post/password",function(req,res){
        console.log(req.body);
        console.log("[PAGE REQUEST] post/password FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        var userID=parseInt(req.body.userID);
        var password=req.body.password;
        userDB.findOne({_id:userID,password:password},function(err,result){
            if(result==null){
                res.send({verified:false});
            }
            else{
                res.send({verified:true});
            }
        });
    });
    //OK {userID} return {firstname,lastname,nickname}
    app.post("/post/name",function(req,res){
        var userID=parseInt(req.body.userID);
        userDB.findOne({_id:userID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else{
                res.send({firstname:result.firstname,lastname:result.lastname,nickname:result.nickname});
            }
        });
    });
    //OK {studentID} return {status}
    app.post("/post/status",function(req,res){
        var studentID=parseInt(req.body.studentID);
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else{
                if(result.position=="student")res.send({status:result.student.status});
                else res.send({err:"The requested ID isn't a student."});
            }
        });
    });
    //OK {grade(1-13)} return {course:[{courseID,courseName,day}]}
    // app.post("/post/gradeCourse",function(req,res){
    //     var grade=parseInt(req.body.grade);
    //     var output=[];
    //     configDB.findOne({},function(err,config){
    //         var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
    //         courseDB.find({grade:{$bitsAllSet:[grade-1]}}).toArray(function(err,result){
    //             for(var i=0;i<result.length;i++){
    //                 output.push({courseID:result[i]._id,courseName:result[i].subject+gradeToString(result[i].grade)+result[i].level,day:result[i].day});
    //             }
    //             res.send({course:output});
    //         });
    //     });
    // });
    app.post("/post/gradeCourse",function(req,res){
        var grade=parseInt(req.body.grade);
        var output=[];
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            courseDB.find({grade:{$bitsAllSet:[grade-1]}}).toArray(function(err,result){
                for(var i=0;i<result.length;i++){
                    output.push({courseID:result[i]._id,courseName:result[i].subject+gradeToString(result[i].grade)+result[i].level,day:result[i].day});
                }
                res.send({course:output});
            });
        });
    });


    //TODO course {studentID,[courseID]} return {}
    app.post("/post/addStudentCourse",function(req,res){
        var studentID=req.body.studentID;
        var courseID=req.body.courseID;
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //TODO TEST
                userDB.updateOne({_id:studentID},{$addToSet:{course:{$each:courseID}}},function(err,result){
                });
            }
        });
    });
    //TODO course {studentID,[courseID]} return {}
    app.post("/post/removeStudentCourse",function(req,res){
        //
    });

    //TODO Date {studentID,[day]} return {}
    app.post("/post/addSkillDay",function(req,res){
        //
    });
    //TODO Date {studentID,[day]} return {}
    app.post("/post/removeSkillDay",function(req,res){
        //
    });

    //TODO Date {studentID,[day]} return {}
    app.post("/post/addHybridDay",function(req,res){
        //
    });
    //TODO Date {studentID,[day]} return {}
    app.post("/post/removeHybridDay",function(req,res){
        //
    });


    //TODO configPath/File {studentID,file} return {}
    app.post("/post/submitReceipt",function(req,res){
        //
    });
    //TODO course {} return {[courseID,subject,[grade],level,day,[tutor],[student]]}
    app.post("/post/allCourse",function(req,res){
        var output=[];
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            courseDB.find().forEach(function(result){
                output.push({courseID:result._id,
                    subject:result.subject,grade:result.grade,level:result.level,
                    day:result.day,tutor:result.tutor,student:result.student
                });
            },function(err){
                res.send({course:output});
            });
        });
    });
    //TODO TEST {} return {student:[{studentID,firstname,lastname,nickname}]}
    app.post("/post/allStudent",function(req,res){
        var output=[];
        userDB.find({position:"student"}).toArray(function(err,result){
            for(i=0;i<result.length;i++){
                output.push({studentID:result[i]._id,
                    firstname:result[i].firstname,
                    lastname:result[i].lastname,
                    nickname:result[i].nickname
                });
            }
            res.send({student:output});
        });
    });
    //TODO TEST {studentID} return {grade,registrationState,skillDay,hybridDay,balance,status}
    app.post("/post/studentProfile",function(req,res){
        var studentID=parseInt(req.body.studentID);
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else{
                if(result.position=="student"){
                    var request=require("request");
                    request.post("http://localhost/post/name",{form:{userID:studentID}},function(err,response,body){
                        console.log("==[Body]==");
                        body=JSON.parse(body);
                        console.log(body);
                        console.log(typeof(body));
                        console.log("==[Result.student]==");
                        console.log(result.student);
                        console.log(typeof(result.student));
                        res.send(Object.assign(body,result.student));
                    });
                    // res.send(result.student);
                }
                else res.send({err:"The requested ID isn't a student."});
            }
        });
    });


    //OK {password,firstname,lastname,nickname,grade(1-12)} return {}
    app.post("/post/addStudent",function(req,res){
        console.log("[REQUEST] addStudent");
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var grade=parseInt(req.body.grade);
        var balance=[{subject:"M",value:0},{subject:"PH",value:0}];
        configDB.findOne({},function(err,config){
            userDB.findOne({firstname:firstname,lastname:lastname},function(err,result){
                if(result==null){
                    userDB.insertOne({
                        _id:config.nextStudentID,password:password,position:"student",
                        firstname:firstname,lastname:lastname,nickname:nickname,
                        student:{grade:grade,registrationState:"registered",skillDay:[],hybridDay:[],balance:balance,status:"active"}
                    },function(err,result){
                        configDB.updateOne({},{$inc:{nextStudentID:1}});
                        // res.send({}); TODO
                        res.send(result.ops);
                    });
                }
                else res.send({err:"Student is already exists."});
            });
        });
    });
    //OK {studentID} return {}
    app.post("/post/removeStudent",function(req,res){
        console.log("[REQUEST] removeStudent");
        var studentID=parseInt(req.body.studentID);
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null)res.send({err:"The requested ID doesn't exist."});
            else if(result.position!="student")res.send({err:"The requested ID isn't a student."});
            else{
                userDB.deleteOne({_id:studentID});
                res.send({});
            }
        });
    });

    //OK {password,firstname,lastname,nickname,email,nicknameEng} return {}
    app.post("/post/addTutor",function(req,res){
        console.log("[REQUEST] addTutor");
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var email=req.body.email;
        var nicknameEng=req.body.nicknameEng;
        configDB.findOne({},function(err,config){
            userDB.findOne({firstname:firstname,lastname:lastname},function(err,result){
                if(result==null){
                    userDB.insertOne({
                        _id:config.nextTutorID,password:password,position:"tutor",
                        firstname:firstname,lastname:lastname,nickname:nickname,
                        tutor:{email:email,nicknameEng:nicknameEng,status:"active"}
                    },function(err,result){
                        configDB.updateOne({},{$inc:{nextTutorID:1}});
                        // res.send({}); TODO
                        res.send(result.ops);
                    });
                }
                else res.send({err:"Tutor is already exists."});
            });
        });
    });
    //OK {tutorID} return {}
    app.post("/post/removeTutor",function(req,res){
        console.log("[REQUEST] removeTutor");
        var tutorID=parseInt(req.body.tutorID);
        userDB.findOne({_id:tutorID},function(err,result){
            if(result==null)res.send({err:"The requested ID doesn't exist."});
            else if(result.position!="tutor")res.send({err:"The requested ID isn't a tutor."});
            else{
                userDB.deleteOne({_id:tutorID});
                res.send({});
            }
        });
    });

    //TODO {subject,[grade],level,day,[tutor],[student]} return {}
    app.post('/post/addCourse',function(req,res){
        var subject=req.body.subject;
        var grade=req.body.grade;
        var level=req.body.level;
        var tutor=req.body.tutor;
        var day=req.body.day;
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            courseDB.insertOne({subject:subject,grade:grade,level:level,day:day,tutor:[],student:[],submission:[]},function(err,result){
                console.log(result);
            });
        });
    });


    //OK {} return {_id,year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID}
    app.post('/post/getConfig',function(req,res){
        configDB.findOne({},function(err,config){
            res.send(config);
        });
    });
    //OK {year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID} return {}
    app.post('/post/editConfig',function(req,res){
        configDB.updateOne({},{
            year:parseInt(req.body.year),
            quarter:parseInt(req.body.quarter),
            courseMaterialPath:req.body.courseMaterialPath,
            receiptPath:req.body.receiptPath,
            nextStudentID:parseInt(req.body.nextStudentID),
            nextTutorID:parseInt(req.body.nextTutorID)
        },function(){
            configDB.findOne({},function(err,config){
                console.log(config);
                res.send({});
            });
        });
    });
    //OK {toAdd} return {}
    app.post('/post/addStudentGrade',function(req,res){
        userDB.updateMany({position:"student"},{$inc:{"student.grade":parseInt(req.body.toAdd)}});
        res.send({});
    });


    app.post("/debug/listUser",function(req,res){
        userDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listCourse",function(req,res){
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            courseDB.find().toArray(function(err,result){
                res.send(result);
            });
        });
    });
}
module.exports.run=run;
