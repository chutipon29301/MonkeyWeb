console.log("[START] index.js");

var bodyParser=require("body-parser");
var cookieParser=require('cookie-parser');
var express=require("express");
var fs=require("fs-extra");
var multer=require("multer");
var MongoClient=require('mongodb').MongoClient;

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(multer({dest:"/tmp/"}).any());//Temp folder for uploading
app.use(express.static("public"));// node index.js
app.use(express.static("../public"));// node backend/index.js
app.use(function(req, res, next) {// Allow access from other domain
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// var credentials = {key:fs.readFileSync('private.key'),cert:fs.readFileSync('certificate.crt')};
// require("https").createServer(credentials,app).listen(443);
// require("http").createServer(express().use(function(req,res){
// 	res.redirect("https://"+req.hostname+req.url);
// })).listen(80);
// Uncomment code above and comment code below to automatically redirect to https
app.listen(80);

MongoClient.connect("mongodb://127.0.0.1:27017/monkeyDB",function(err,db){
    if(err){
        console.error("[ERROR] "+err.message);
        return;
    }
    // db.dropDatabase();
    // db.dropCollection("user");
    // db.dropCollection("hybridSeat");
    // db.dropCollection("randomPassword");
    // db.collection("user").updateOne({_id:99033},{$set:{position:"admin"},$setOnInsert:{password:"927eda538a92dd17d6775f37d3af2db8ab3dd811e71999401bc1b26c49a0a8dbb7c8471cb1fc806105138ed52e68224611fb67f150e7aa10f7c5516056a71130"}},{upsert:true});
    db.collection("user").updateOne({_id:99033},
		{
			$set:{
				password:"927eda538a92dd17d6775f37d3af2db8ab3dd811e71999401bc1b26c49a0a8dbb7c8471cb1fc806105138ed52e68224611fb67f150e7aa10f7c5516056a71130",
				position:"dev",
				firstname:"สิรภพ",lastname:"ครองอภิรดี",nickname:"เชี้ยง",
				firstnameEn:"Siraphop",lastnameEn:"Krongapiradee",nicknameEn:"Chiang",
				email:"chiang-siraphop@mkyhybrid.com",phone:"0820105315",
				tutor:{status:"active"}
			}
		},
		{upsert:true}
    );
    // db.collection("user").deleteMany({position:"student"});
    // var moment=require("moment");
    // db.collection("user").insertOne({day:moment(0).hour(8).day(6).toDate()});
    // db.collection("CR60Q2").deleteOne({grade:[11,12]});
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
            return {subject:subject,grade:grade,level:level};
        }
        else return {subject:'Wrong input' , grade:'Wrong input' , level:'Wrong input'};
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
    configDB.updateOne({_id:"config"},
        {$setOnInsert:{
            year:60,quarter:3,courseMaterialPath:"courseMaterial",receiptPath:"receipt",
            nextStudentID:17001,nextTutorID:99001,maxHybridSeat:40,
            profilePicturePath:"profilePicture",studentSlideshowPath:"studentSlideshow"}
        },{upsert:true},function(err,result){
            if(result.upsertedCount){
                require("opn")("http://127.0.0.1/firstConfig");
                console.log("[WARNING] Please update path/year/quarter");
            }
            configDB.findOne({},function(err,config){
                console.log(config);
                require("./post.js")(app,db);
                require("./webFlow.js")(app,db);
            });
        }
    );
});
