console.log("[START] index.js");

var bodyParser=require("body-parser");
var express=require("express");
var multer=require("multer");
var MongoClient=require('mongodb').MongoClient;

var app=express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({dest:"/tmp/"}).any());
app.use(express.static("public"));// node backend/index.js
app.use(express.static("../public"));// node index.js
app.listen(80);

MongoClient.connect("mongodb://127.0.0.1:27017/monkeyDB",function(err,db){
    if(err){
        console.error("[ERROR] "+err.message);
        return;
    }
    // db.dropCollection("config");
    // db.collection("user").deleteMany({position:"student"});
    // db.dropCollection("user");
    // var moment=require("moment");
    // db.collection("user").insertOne({day:moment(0).hour(8).day(6).toDate()});
    // db.collection("user").insertOne({day:moment(0).hour(9).day(6).toDate()});
    // db.collection("user").insertOne({day:moment(0).hour(6).day(6).toDate()});
    // db.collection("user").insertOne({day:moment(0).hour(7).day(6).toDate()});
    function splitCourse(name){
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
    // db.collection("CR60Q2").find().forEach(function(result){
    //     db.collection("CR60Q2").updateOne({_id:result._id},{
    //         $set:{subject:splitCourseName(result.courseName).subject,
    //             grade:splitCourseName(result.courseName).grade,
    //             level:splitCourseName(result.courseName).level
    //         },
    //         $unset:{courseName:"",time:""}
    //     })
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
                nextStudentID:17001,nextTutorID:99001
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
