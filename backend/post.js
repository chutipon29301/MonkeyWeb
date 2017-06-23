console.log("[START] post.js");
module.exports=function(app,db){
    var CryptoJS=require("crypto-js");
    var events=require("events");
    var fs=require("fs-extra");
    var moment=require("moment");
    var ObjectID=require('mongodb').ObjectID;

    var configDB=db.collection("config");
    var courseSuggestionDB=db.collection("courseSuggestion");
    var hybridSeatDB=db.collection("hybridSeat");
    // var hybridSheetDB=db.collection("hybridSheet");
    var randomPasswordDB=db.collection("randomPassword");
    var userDB=db.collection("user");

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
    var gradeBitToArray=function(bit){
        var output=[];
        for(var i=0;i<13;i++){
            if(bit&(1<<i)){
                output.push(i+1);
            }
        }
        return output;
    };
    var gradeArrayToBit=function(array){
        var output=0;
        for(var i=0;i<array.length;i++){
            output|=(1<<(array[i]-1));
        }
        return output;
    };
    // var gradeStringToBit=function(grade){
    //     var output=0;
    //     if(grade[0]=='P'){
    //         for(var i=1;i<grade.length;i++){
    //             output|=(1<<(grade[i]-'1'));
    //         }
    //     }
    //     if(grade[0]=='S'){
    //         for(var i=1;i<grade.length;i++){
    //             output|=(1<<(grade[i]-'1'+6));
    //         }
    //     }
    //     return output;
    // };
    var getCourseDB=function(callback){
        configDB.findOne({},function(err,config){
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

    var findUser=function(res,userID,options,callback){
        userDB.findOne({_id:userID},function(err,result){
            if(result==null)res.send({err:"The requested userID doesn't exist."});
            else{
                if(options.position!=undefined&&options.position!=result.position)return res.send({err:"The requested userID isn't a "+options.position+"."});
                else callback(result);
            }
        });
    };

    var callbackLoop=function(n,inLoop,endLoop){
        var c=0;
        var eventEmitter=new events.EventEmitter();
        eventEmitter.on("finish",function(){
            if(c==n)endLoop();
            c++;
        });
        for(var i=0;i<n;i++){
            inLoop(i,function(){
                eventEmitter.emit("finish");
            });
        }
        eventEmitter.emit("finish");
    };

    // All post will return {err} if error occurs
    var post=function(url,callback){
        app.post(url,function(req,res){
            console.log("[POST REQUEST] "+url.slice(1)+" FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
            console.log("\treq.body => ",req.body);
            console.log("\treq.files => ",req.files);
            console.log("\treq.cookies => ",req.cookies);
            callback(req,res);
            console.log("[END REQUEST]");
        });
    };

    // User Information
    //OK {userID,password} return {verified}
    post("/post/password",function(req,res){
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
    //OK {userID} return {firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn}
    post("/post/name",function(req,res){
        var userID=parseInt(req.body.userID);
        findUser(res,userID,{},function(result){
            res.send({firstname:result.firstname,lastname:result.lastname,nickname:result.nickname,
                firstnameEn:result.firstnameEn,lastnameEn:result.lastnameEn,nicknameEn:result.nicknameEn
            });
        });
    });
    //OK {userID} return {position}
    post("/post/position",function(req,res){
        var userID=parseInt(req.body.userID);
        findUser(res,userID,{},function(result){
            res.send({position:result.position});
        });
    });
    //OK {userID} return {status}
    post("/post/status",function(req,res){
        var userID=parseInt(req.body.userID);
        findUser(res,userID,{},function(result){
            if(result.position=="student")res.send({status:result.student.status});
            else res.send({status:result.tutor.status});
        });
    });
    //OK {userID,status} return {}
    post("/post/changeStatus",function(req,res){
        var userID=parseInt(req.body.userID);
        var status=req.body.status;
        findUser(res,userID,{},function(result){
            if(result.position=="student"){
                userDB.updateOne({_id:userID},{$set:{"student.status":status}},function(){
                    res.send({});
                });
            }
            else{
                userDB.updateOne({_id:userID},{$set:{"tutor.status":status}},function(){
                    res.send({});
                });
            }
        });
    });

    // Student Information
    //OK {} return {student:[{studentID,firstname,lastname,nickname,grade,registrationState,status,inCourse,inHybrid}]}
    post("/post/allStudent",function(req,res){
        var output=[];
        userDB.find({position:"student"}).sort({_id:1}).toArray(function(err,result){
            callbackLoop(result.length,function(i,continueLoop){
                getCourseDB(function(courseDB){
                    courseDB.findOne({student:result[i]._id},function(err,course){
                        hybridSeatDB.findOne({"student.studentID":result[i]._id},function(err,hybrid){
                            output[i]={studentID:result[i]._id,
                                firstname:result[i].firstname,
                                lastname:result[i].lastname,
                                nickname:result[i].nickname,
                                grade:result[i].student.grade,
                                registrationState:result[i].student.registrationState,
                                status:result[i].student.status,
                                inCourse:course!=null,
                                inHybrid:hybrid!=null
                            };
                            continueLoop();
                        });
                    });
                });
            },function(){
                res.send({student:output});
            });
        });
    });
    //OK {studentID} return {user.student,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,[courseID],[hybridDay]}
    post("/post/studentProfile",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var output={};
        findUser(res,studentID,{position:"student"},function(result){
            output=Object.assign(result.student,{firstname:result.firstname,lastname:result.lastname,nickname:result.nickname,
                firstnameEn:result.firstnameEn,lastnameEn:result.lastnameEn,nicknameEn:result.nicknameEn,
                email:result.email,phone:result.phone,courseID:[],hybridDay:[]
            });
            getCourseDB(function(courseDB){
                courseDB.find({student:studentID}).sort({day:1}).toArray(function(err,course){
                    for(var i=0;i<course.length;i++){
                        output.courseID.push(course[i]._id);
                    }
                    hybridSeatDB.find({"student.studentID":studentID}).sort({day:1}).toArray(function(err,hybrid){
                        for(var i=0;i<hybrid.length;i++){
                            var index=hybrid[i].student.findIndex(function(x){
                                return x.studentID==studentID;
                            });
                            output.hybridDay.push({subject:hybrid[i].student[index].subject,day:hybrid[i].day});
                        }
                        res.send(output);
                    });
                });
            });
        });
    });
    //OK {studentID} return {registrationState}
    post("/post/registrationState",function(req,res){
        var studentID=parseInt(req.body.studentID);
        findUser(res,studentID,{position:"student"},function(result){
            res.send({registrationState:result.student.registrationState});
        });
    });
    //OK {studentID,registrationState} return {}
    post("/post/changeRegistrationState",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var registrationState=req.body.registrationState;
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},{$set:{"student.registrationState":registrationState}},function(){
                res.send({});
            });
        });
    });

    // Student Timetable
    //OK {studentID,[courseID]} return {}
    post("/post/addStudentCourse",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var courseID=req.body.courseID;
        //TODO var errOutput=[];
        findUser(res,studentID,{position:"student"},function(result){
            getCourseDB(function(courseDB){
                callbackLoop(courseID.length,function(i,continueLoop){
                    courseDB.updateOne({_id:courseID[i]},{$addToSet:{student:studentID}},function(){
                        continueLoop();
                    });
                },function(){
                    res.send({});
                });
            });
        });
    });
    //OK {studentID,[courseID]} return {}
    post("/post/removeStudentCourse",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var courseID=req.body.courseID;
        //TODO var errOutput=[];
        findUser(res,studentID,{position:"student"},function(result){
            getCourseDB(function(courseDB){
                callbackLoop(courseID.length,function(i,continueLoop){
                    courseDB.updateOne({_id:courseID[i]},{$pull:{student:studentID}},function(){
                        continueLoop();
                    });
                },function(){
                    res.send({});
                });
            });
        });
    });
    //OK {studentID,day,subject} return {}
    post("/post/addSkillDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        var subject=req.body.subject;
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},
                {$addToSet:{"student.skillDay":{subject:subject,day:day}}},
                function(){
                    res.send({});
                }
            );
        });
    });
    //OK {studentID,day} return {}
    post("/post/removeSkillDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},
                {$pull:{"student.skillDay":{day:day}}},
                function(){
                    res.send({});
                }
            );
        });
    });
    //OK {studentID,day,subject} return {}
    post("/post/addHybridDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        var subject=req.body.subject;
        findUser(res,studentID,{position:"student"},function(result){
            hybridSeatDB.updateOne({day:day},
                {$setOnInsert:{_id:moment(day).format("dddHH")},
                    $addToSet:{student:{studentID:studentID,subject:subject}}
                },{upsert:true},function(){
                    res.send({});
                }
            );
        });
    });
    //OK {studentID,day} return {}
    post("/post/removeHybridDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        findUser(res,studentID,{position:"student"},function(result){
            hybridSeatDB.updateOne({day:day},
                {$pull:{student:{studentID:studentID}}},
                function(){
                    res.send({});
                }
            );
        });
    });

    // User Management
    //OK {password,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,email,phone,grade(1-12),phoneParent} return {}
    post("/post/addStudent",function(req,res){
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var firstnameEn=req.body.firstnameEn;
        var lastnameEn=req.body.lastnameEn;
        var nicknameEn=req.body.nicknameEn;
        var email=req.body.email;
        var phone=req.body.phone;
        var grade=parseInt(req.body.grade);
        var phoneParent=req.body.phoneParent;
        var balance=[{subject:"M",value:0},{subject:"PH",value:0}];
        configDB.findOne({},function(err,config){
            userDB.insertOne({
                _id:config.nextStudentID,password:password,position:"student",
                firstname:firstname,lastname:lastname,nickname:nickname,
                firstnameEn:firstnameEn,lastnameEn:lastnameEn,nicknameEn:nicknameEn,
                email:email,phone:phone,
                student:{grade:grade,registrationState:"unregistered",skillDay:[],balance:balance,phoneParent:phoneParent,status:"active"}
            },function(err,result){
                configDB.updateOne({},{$inc:{nextStudentID:1}});
                // res.send({}); TODO
                res.send(result.ops);
            });
        });
    });
    //OK {studentID} return {}
    post("/post/removeStudent",function(req,res){
        var studentID=parseInt(req.body.studentID);
        findUser(res,studentID,{position:"student"},function(result){
            userDB.deleteOne({_id:studentID},function(){
                res.send({});
            });
        });
    });
    //TODO {studentID,password,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,email,phone,grade(1-12),phoneParent} return {}
    post("/post/editStudent",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var input={};
        var addField=function(field,out){
            if(out==undefined)out=field;
            if(req.body[field])input[out]=req.body[field];
        };
        var addFieldInt=function(field,out){
            if(out==undefined)out=field;
            if(req.body[field])input[out]=parseInt(req.body[field]);
        };
        addField("password");
        addField("firstname");
        addField("lastname");
        addField("nickname");
        addField("firstnameEn");
        addField("lastnameEn");
        addField("nicknameEn");
        addField("email");
        addField("phone");
        addFieldInt("grade","student.grade");
        addField("phoneParent","student.phoneParent");
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},{$set:input},function(){
                if(result.student.registrationState=="unregistered"){
                    userDB.updateOne({_id:studentID},{$set:{"student.registrationState":"untransferred"}},function(){
                        res.send({});
                    });
                }
                else res.send({});
            });
        });
    });
    //OK {password,firstname,lastname,nickname,email,nicknameEng} return {}
    post("/post/addTutor",function(req,res){
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var firstnameEn=req.body.firstnameEn;
        var lastnameEn=req.body.lastnameEn;
        var nicknameEn=req.body.nicknameEn;
        var email=req.body.email;
        var phone=req.body.phone;
        configDB.findOne({},function(err,config){
            userDB.insertOne({
                _id:config.nextTutorID,password:password,position:"tutor",
                firstname:firstname,lastname:lastname,nickname:nickname,
                firstnameEn:firstnameEn,lastnameEn:lastnameEn,nicknameEn:nicknameEn,
                email:email,phone:phone,
                tutor:{status:"active"}
            },function(err,result){
                configDB.updateOne({},{$inc:{nextTutorID:1}});
                // res.send({}); TODO
                res.send(result.ops);
            });
        });
    });
    //OK {tutorID} return {}
    post("/post/removeTutor",function(req,res){
        var tutorID=parseInt(req.body.tutorID);
        findUser(res,studentID,{position:"tutor"},function(result){
            userDB.deleteOne({_id:tutorID},function(){
                res.send({});
            });
        });
    });
    //TODO ADD editTutor
    //OK {studentID} return {}
    post("/post/addBlankStudent",function(req,res){
        var studentID=req.body.studentID.split(" ");
        var balance=[{subject:"M",value:0},{subject:"PH",value:0}];
        for(var i=0;i<studentID.length;i++){
            studentID[i]=parseInt(studentID[i]);
            var password="";
            password+=Math.floor(Math.random()*10);
            password+=Math.floor(Math.random()*10);
            password+=Math.floor(Math.random()*10);
            password+=Math.floor(Math.random()*10);
            userDB.insertOne({
                _id:studentID[i],password:CryptoJS.SHA3(password).toString(),position:"student",
                firstname:"",lastname:"",nickname:"",
                firstnameEn:"",lastnameEn:"",nicknameEn:"",
                email:"",phone:"",
                student:{grade:0,registrationState:"unregistered",skillDay:[],balance:balance,phoneParent:"",status:"active"}
            });
            randomPasswordDB.insertOne({_id:studentID[i],password:password})
        }
        res.send({});
    });
    //OK {} return {[student]}
    post("/post/listRandomStudent",function(req,res){
        var output=[];
        randomPasswordDB.find().sort({_id:1}).toArray(function(err,result){
            for(var i=0;i<result.length;i++){
                output[i]={studentID:result[i]._id,password:result[i].password};
            }
            res.send({student:output});
        });
    });
    //OK {tutorID,position} return {}
    post("/post/changePosition",function(req,res){
        var tutorID=parseInt(req.body.tutorID);
        var position=req.body.position;
        userDB.findOne({_id:tutorID},function(err,result){
            if(result==null)res.send({err:"The requested ID doesn't exist."});
            else if(result.position!="student"){
                userDB.updateOne({_id:tutorID},{$set:{position:position}},function(){
                    res.send({});
                });
            }
            else res.send({err:"The requested ID isn't a staff."});
        });
    });

    // Course
    //OK {} return {course:[{courseID,subject,[grade],level,day,[tutor],[student],courseName}]}
    post("/post/allCourse",function(req,res){
        var output=[];
        getCourseDB(function(courseDB){
            courseDB.find().sort({subject:1,grade:1,level:1,tutor:1}).toArray(function(err,result){
                callbackLoop(result.length,function(i,continueLoop){
                    getCourseName(result[i]._id,function(courseName){
                        output[i]={courseID:result[i]._id};
                        output[i]=Object.assign(output[i],result[i]);
                        delete output[i]._id;
                        output[i].grade=gradeBitToArray(output[i].grade);
                        delete output[i].submission;
                        output[i].courseName=courseName;
                        continueLoop();
                    });
                },function(){
                    res.send({course:output});
                });
            });
        });
    });
    //OK {grade(1-13)} return {course:[{courseID,courseName,day,[tutor]}]}
    post("/post/gradeCourse",function(req,res){
        var grade=parseInt(req.body.grade);
        var output=[];
        getCourseDB(function(courseDB){
            courseDB.find({grade:{$bitsAllSet:[grade-1]}}).sort({subject:1,grade:1,level:1,tutor:1}).toArray(function(err,result){
                callbackLoop(result.length,function(i,continueLoop){
                        getCourseName(result[i]._id,function(courseName){
                            output.push({courseID:result[i]._id,courseName:courseName,day:result[i].day,tutor:result[i].tutor});
                            continueLoop();
                        });
                },function(){
                    res.send({course:output});
                });
            });
        });
    });
    //OK {courseID} return {courseName,day,[tutor],[student]}
    post("/post/courseInfo",function(req,res){
        var courseID=req.body.courseID;
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"No course found."});
                else{
                    getCourseName(courseID,function(courseName){
                        res.send({courseName:courseName,day:result.day,tutor:result.tutor,student:result.student});
                    });
                }
            });
        });
    });
    //OK {grade} return {[course]}
    post("/post/listCourseSuggestion",function(req,res){
        var grade=parseInt(req.body.grade);
        var output=[];
        courseSuggestionDB.find({grade:grade}).sort({level:1}).toArray(function(err,result){
            if(result==null)res.send({course:output});
            else{
                for(var i=0;i<result.length;i++){
                    output[i]={level:result[i].level,courseID:result[i].courseID};
                }
                res.send({course:output});
            }
        });
    });
    //OK {grade,level,[courseID]} return {}
    post("/post/addCourseSuggestion",function(req,res){
        var grade=parseInt(req.body.grade);
        var level=req.body.level;
        var courseID=req.body.courseID;
        courseSuggestionDB.updateOne({grade:grade,level:level},
            {$setOnInsert:{_id:grade+level},$addToSet:{courseID:{$each:courseID}}},
            {upsert:true},function(){
                res.send({});
            }
        );
    });
    //OK {grade,level,[courseID]} return {}
    post("/post/removeCourseSuggestion",function(req,res){
        var grade=parseInt(req.body.grade);
        var level=req.body.level;
        var courseID=req.body.courseID;
        courseSuggestionDB.updateOne({grade:grade,level:level},
            {$pull:{courseID:{$in:courseID}}},function(){
                res.send({});
            }
        );
    });
    //OK {subject,[grade],level,day,[tutor]} return {}
    post('/post/addCourse',function(req,res){
        var subject=req.body.subject;
        var grade=req.body.grade;
        for(var i=0;i<grade.length;i++){
            grade[i]=parseInt(grade[i]);
        }
        grade=gradeArrayToBit(grade);
        var level=req.body.level;
        var day=parseInt(req.body.day);
        var tutor=req.body.tutor;
        for(var i=0;i<tutor.length;i++){
            tutor[i]=parseInt(tutor[i]);
        }
        var courseID=new ObjectID().toString();
        getCourseDB(function(courseDB){
            courseDB.insertOne({_id:courseID,subject:subject,grade:grade,level:level,day:day,tutor:tutor,student:[],submission:[]},function(err,result){
                res.send(result.ops);//TODO ret {}
            });
        });
    });
    //OK {courseID} return {}
    post("/post/removeCourse",function(req,res){
        var courseID=req.body.courseID;
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"The requested course doesn't exist."});
                else{
                    courseDB.deleteOne({_id:courseID},function(){
                        res.send({});
                    });
                }
            });
        });
    });
    //TODO ADD editCourse

    // File Uploading
    //OK configPath/File {studentID,file} return {}
    post("/post/submitReceipt",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var file=req.files[0];
        findUser(res,studentID,{position:"student"},function(result){
            configDB.findOne({},function(err,config){
                var newPath=config.receiptPath+"CR"+config.year+"Q"+config.quarter+"/";
                fs.ensureDir(newPath,function(err){
                    if(err)res.send({err:err,at:"ensureDir"});
                    else{
                        var originalName=file.originalname;
                        var originalType=originalName.slice(originalName.lastIndexOf("."));
                        var oldPath=file.path;
                        fs.readdir(newPath,function(err,files){
                            for(var i=0;i<files.length;i++){
                                if(files[i].split(".",1)[0]==studentID){
                                    fs.removeSync(newPath+files[i]);
                                }
                            }
                            fs.readFile(oldPath,function(err,data){
                                if(err)res.send({err:err,at:"readFile"});
                                else fs.writeFile(newPath+studentID+originalType.toLowerCase(),data,function(err){
                                    if(err)res.send({err:err,at:"writeFile"});
                                    else{
                                        if(result.student.registrationState=="untransferred"||result.student.registrationState=="rejected"){
                                            userDB.updateOne({_id:studentID},{$set:{"student.registrationState":"transferred"}},function(){
                                                res.send({});
                                            });
                                        }
                                        else res.send({});
                                    }
                                });
                            });
                        });
                    }
                });
            });
        });
    });
    //OK {userID,file} return {}
    post("/post/updateProfilePicture",function(req,res){
        var userID=parseInt(req.body.userID);
        var file=req.files[0];
        findUser(res,userID,{},function(result){
            configDB.findOne({},function(err,config){
                var newPath=config.profilePicturePath;
                fs.ensureDir(newPath,function(err){
                    if(err)res.send({err:err,at:"ensureDir"});
                    else{
                        var originalName=file.originalname;
                        var originalType=originalName.slice(originalName.lastIndexOf("."));
                        var oldPath=file.path;
                        fs.readdir(newPath,function(err,files){
                            for(var i=0;i<files.length;i++){
                                if(files[i].split(".",1)[0]==userID){
                                    fs.removeSync(newPath+files[i]);
                                }
                            }
                            fs.readFile(oldPath,function(err,data){
                                if(err)res.send({err:err,at:"readFile"});
                                else fs.writeFile(newPath+userID+originalType.toLowerCase(),data,function(err){
                                    if(err)res.send({err:err,at:"writeFile"});
                                    else res.send({});
                                });
                            });
                        });
                    }
                });
            });
        });
    });
    //OK {file} return {}
    post("/post/updateStudentSlideshow",function(req,res){
        var files=req.files;
        var errOutput=[];
        configDB.findOne({},function(err,config){
            var newPath=config.studentSlideshowPath;
            fs.emptyDir(newPath,function(err){
                if(err)res.send({err:err,at:"emptyDir"});
                else{
                    callbackLoop(files.length,function(i,continueLoop){
                        var file=files[i];
                        var originalName=file.originalname;
                        var oldPath=file.path;
                        fs.readFile(oldPath,function(err,data){
                            if(err)errOutput.push({err:err,at:"readFile#"+(i+1)});
                            else fs.writeFile(newPath+originalName,data,function(err){
                                if(err)errOutput.push({err:err,at:"writeFile#"+(i+1)});
                                continueLoop();
                            });
                        });
                    },function(){
                        if(errOutput.length)res.send({err:errOutput});
                        else res.send({});
                    });
                }
            });
        });
    });

    // Configuration
    //OK {} return {_id,year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID}
    post('/post/getConfig',function(req,res){
        configDB.findOne({},function(err,config){
            res.send(config);
        });
    });
    //OK {year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID,maxHybridSeat} return {}
    post('/post/editConfig',function(req,res){
        var dirPath=function(path){
            if(path.endsWith("/"))return path;
            return path+"/";
        };
        configDB.updateOne({},{$set:{
            year:parseInt(req.body.year),
            quarter:parseInt(req.body.quarter),
            courseMaterialPath:dirPath(req.body.courseMaterialPath),
            receiptPath:dirPath(req.body.receiptPath),
            nextStudentID:parseInt(req.body.nextStudentID),
            nextTutorID:parseInt(req.body.nextTutorID),
            maxHybridSeat:parseInt(req.body.maxHybridSeat),
            profilePicturePath:dirPath(req.body.profilePicturePath),
            studentSlideshowPath:dirPath(req.body.studentSlideshowPath)
        }},function(){
            configDB.findOne({},function(err,config){
                console.log("[SHOW] config");
                console.log(config);
                res.send({});
            });
        });
    });
    //OK {toAdd} return {}
    post('/post/addStudentGrade',function(req,res){
        userDB.updateMany({position:"student"},{$inc:{"student.grade":parseInt(req.body.toAdd)}});
        res.send({});
    });


    app.post("/debug/listUser",function(req,res){
        userDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listCourse",function(req,res){
        getCourseDB(function(courseDB){
            courseDB.find().toArray(function(err,result){
                res.send(result);
            });
        });
    });
    app.post("/debug/listHybridSeat",function(req,res){
        hybridSeatDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listCourseSuggestion",function(req,res){
        courseSuggestionDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
}
