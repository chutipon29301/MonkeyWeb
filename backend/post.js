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

    app.get("/",function(req,res){
        console.log("[PAGE REQUEST] index FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        res.sendFile(path.join(__dirname,"../","login.html"));
    });
    app.get("/regis",function(req,res){
        console.log("[PAGE REQUEST] regis FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        res.sendFile(path.join(__dirname,"../","registrationCourse.html"));
    });
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
    //TODO TEST course {grade(1-13)} return {course:[{courseID,courseName,day}]} grade 1-12 TODO if(10-12)incl13
    app.post("/post/gradeCourse",function(req,res){
        var grade=req.body.grade;
        configDB.findOne({},function(err,config){
            var courseDB=db.collection("CR"+config.year+"Q"+config.quarter);
            courseDB.find({grade:{$bitsAllSet:[grade-1]}}).toArray(function(err,result){
                var output=[];
                for(var i=0;i<result.length;i++){
                    output.append({courseID:result[i]._id,courseName:result[i].subject+result[i].grade+result[i].level,day:result[i].day});
                }
                res.send({course:output});
            });
        });
    });


    //TODO course {studentID,[courseID]} return {err}
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
    //TODO course {id,[course._id]} return {err}
    app.post("/post/removeStudentCourse",function(req,res){
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });

    //TODO Date {id,[skillDay]} return {err}
    app.post("/post/addSkillDay",function(req,res){
        var id=req.body.id;
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO Date {id,[skillDay]} return {err}
    app.post("/post/removeSkillDay",function(req,res){
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });

    //TODO Date {id,[hybridDay]} return {err}
    app.post("/post/addHybridDay",function(req,res){
        var id=req.body.id;
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO Date {id,[hybridDay]} return {err}
    app.post("/post/removeHybridDay",function(req,res){
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });


    //TODO configPath/File {id,file} return {err}
    app.post("/post/submitReceipt",function(req,res){
        var id=req.body.id;
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO course {} return {err,[course]}
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
    //TODO {} return {err,[{firstname,lastname,nickname,student._id}]}
    app.post("/post/allStudent",function(req,res){
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO {id} return {err,[{student}]}
    app.post("/post/studentProfile",function(req,res){
        userDB.findOne({_id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });


    //OK {password,firstname,lastname,nickname,grade} return {}
    app.post("/post/addStudent",function(req,res){
        console.log("[REQUEST] addStudent");
        configDB.findOne({},function(err,config){
            var password=req.body.password;
            var firstname=req.body.firstname;
            var lastname=req.body.lastname;
            var nickname=req.body.nickname;
            var grade=parseInt(req.body.grade);
            userDB.findOne({firstname:firstname,lastname:lastname},function(err,result){
                if(result==null){
                    userDB.insertOne({
                        _id:config.nextStudentID,password:password,position:"student",
                        firstname:firstname,lastname:lastname,nickname:nickname,
                        student:{grade:grade,registrationState:"registered",course:[],skillDay:[],hybridDay:[],status:"active"}
                    },function(err,result){
                        configDB.updateOne({},{$inc:{nextStudentID:1}});
                        // res.send({});
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
        configDB.findOne({},function(err,config){
            var password=req.body.password;
            var firstname=req.body.firstname;
            var lastname=req.body.lastname;
            var nickname=req.body.nickname;
            var email=req.body.email;
            var nicknameEng=req.body.nicknameEng;
            userDB.findOne({firstname:firstname,lastname:lastname},function(err,result){
                if(result==null){
                    userDB.insertOne({
                        _id:config.nextTutorID,password:password,position:"tutor",
                        firstname:firstname,lastname:lastname,nickname:nickname,
                        tutor:{email:email,nicknameEng:nicknameEng}
                    },function(err,result){
                        configDB.updateOne({},{$inc:{nextTutorID:1}});
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

    //TODO TEST {subject,[grade],level,day,[tutor],[student]} return {}
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


    //OK {} return {_id,courseMaterialPath,receiptPath,year,quarter,nextStudentID,nextTutorID}
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