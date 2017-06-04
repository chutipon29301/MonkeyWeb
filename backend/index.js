
console.log("[START] index.js");

var bodyParser=require("body-parser");
var express=require("express");
var multer=require("multer");
var MongoClient=require('mongodb').MongoClient;

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer({dest:"/tmp/"}).any());//Temp folder for uploading
app.use(express.static("public"));// node backend/index.js
app.use(express.static("../public"));// node index.js
app.use(function(req, res, next) {// Allow access from other domain
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen(80);

MongoClient.connect("mongodb://127.0.0.1:27017/monkeyDB",function(err,db){
    if(err){
        console.error("[ERROR] "+err.message);
        return;
    }
    // db.dropDatabase();
    // db.collection("user").deleteMany({position:"student"});
    // db.dropCollection("user");
    // var moment=require("moment");
    // db.collection("user").insertOne({day:moment(0).hour(8).day(6).toDate()});
    // db.collection("CR60Q2").deleteOne({grade:"12"});
    // db.collection("user").insertOne({day:moment(0).hour(9).day(6).toDate()});
    // db.collection("user").insertOne({day:moment(0).hour(6).day(6).toDate()});
    // db.collection("user").insertOne({day:moment(0).hour(7).day(6).toDate()});
    // db.collection("user").updateMany({},{$set:{password:"927eda538a92dd17d6775f37d3af2db8ab3dd811e71999401bc1b26c49a0a8dbb7c8471cb1fc806105138ed52e68224611fb67f150e7aa10f7c5516056a71130"}});
    function splitCourseName(name){
    	if (typeof name == 'string'){
    		if(name.slice(0,3).toLowerCase()=='sat'){
    			return {subject:name.slice(3),grade:"SAT",level:""}
    		}
    		var subject,grade,level;
    		var firstdigit = name.indexOf(name.match(/\d/));
    		subject = name.slice(0,firstdigit-1).toUpperCase();
    		if(/[0-9]/.test(name[name.length-1])){
    			grade = name.slice(firstdigit-1,name.length).toUpperCase();
    			level = "";
    		}
    		else{
    			grade = name.slice(firstdigit-1,name.length-1).toUpperCase();
    			level = name[name.length-1].toLowerCase();
    		}
    		return {subject:subject , grade:grade , level:level}
    	}
    	else{
    		return {subject:'Wrong input' , grade:'Wrong input' , level:'Wrong input'}
    	}
    }
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
    //Data Migration
    // db.collection("CR60Q2").find().forEach(function(result){
    //     var moment=require("moment");
    //     var subject=splitCourseName(result.courseName).subject,
    //         // grade=splitCourseName(result.courseName).grade,
    //         grade=stringToBit(splitCourseName(result.courseName).grade),
    //         level=splitCourseName(result.courseName).level,
    //         day,tutor=[],student=[],submission=[];
    //     var tday,ttime;
    //     if(result.day=="sat")tday=6;
    //     else if(result.day=="sun")tday=7;
    //     if(result.time=="8-10")ttime=8;
    //     else if(result.time=="10-12")ttime=10;
    //     else if(result.time=="13-15")ttime=13;
    //     else if(result.time=="15-17")ttime=15;
    //     day=moment(0).day(tday).hour(ttime).toDate();
    //     for(var i=0;i<result.submission.length;i++){
    //         if(result.submission[i]!=null){
    //             submission[i]={
    //                 teachDate:moment(result.submission[i].dated+result.submission[i].datem+result.submission[i].datey,"DDMMYY").toDate(),
    //                 status:result.submission[i].status
    //             }
    //         }
    //     }
    //     db.collection("user").findOne({"tutor.nicknameEng":{$regex:new RegExp("^"+result.tutor+"$","i")}},function(err,restutor){
    //         if(restutor==null){
    //             if(result.tutor=="pe/ch"){
    //                 tutor.push(99011);
    //                 tutor.push(99012);
    //             }
    //             else if(result.tutor=="pre/pele"){
    //                 tutor.push(99004);
    //                 tutor.push(99022);
    //             }
    //         }
    //         else tutor.push(restutor._id);
    //         db.collection("CR60Q2").updateOne({_id:result._id},{
    //             $unset:{
    //                 courseName:"",
    //                 time:"",
    //                 day:"",
    //                 tutor:"",
    //                 submission:""
    //             }
    //         },function(){
    //             db.collection("CR60Q2").updateOne({_id:result._id},{
    //                 $set:{
    //                     subject:subject,
    //                     grade:grade,
    //                     level:level,
    //                     day:day,
    //                     tutor:tutor,
    //                     student:student,
    //                     submission:submission
    //                 }
    //             });
    //         });
    //         // db.collection("CR60Q2").deleteOne({_id:result._id},function(){
    //         //     db.collection("CR60Q2").insertOne({
    //         //         _id:result._id,
    //         //         subject:subject,
    //         //         grade:grade,
    //         //         level:level,
    //         //         day:day,
    //         //         tutor:tutor,
    //         //         student:student,
    //         //         submission:submission
    //         //     });
    //         // });
    //     });
    // });
    console.log("[CONNECT] MonkeyDB successfully");
    db.admin().listDatabases(function(err,result){
        console.log("[SHOW] All databases");
        console.log(result);
        db.listCollections().toArray(function(err,result){
            console.log("[SHOW] All collections");
            console.log(result);
        });
    });
    var configDB=db.collection("config");
    configDB.findOne({},function(err,config){
        if(config==null){
            configDB.insertOne({_id:"config",year:60,quarter:2,
                courseMaterialPath:"",receiptPath:"",
                nextStudentID:17001,nextTutorID:99001,maxHybridSeat:40
            },function(err){
                require("opn")("http://127.0.0.1/firstConfig");
                console.log("[WARNING] Please update path/year/quarter");
                configDB.findOne({},function(err,config){
                    console.log(config);
                    require("./post.js").run(app,db);
                });
            });
        }
        else{
            console.log(config);
            require("./post.js").run(app,db);
        }
    });
});
