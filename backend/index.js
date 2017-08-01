console.log("[START] index.js");

var bodyParser=require("body-parser");
var chalk=require("chalk");
var cookieParser=require('cookie-parser');
var express=require("express");
var fs=require("fs-extra");
var multer=require("multer");
var MongoClient=require('mongodb').MongoClient;
var path=require("path");

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(multer({dest:"/tmp/"}).any());//Temp folder for uploading
app.use(express.static(path.join(__dirname,"../public")));// Serve static files
app.use(express.static(path.join(__dirname,"../../MonkeyWebData")));// Serve static files
app.use(function(req,res,next){
    // Allow access from other domain
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
    // No cache kept in local
    res.header("Cache-Control","no-cache, no-store, must-revalidate");
    res.header("Pragma","no-cache");
    res.header("Expires","0");
    next();
});
app.set("views",path.join(__dirname,"../views"));
app.set("view engine","pug");

// var credentials = {key:fs.readFileSync('private.key'),cert:fs.readFileSync('certificate.crt')};
// require("https").createServer(credentials,app).listen(443);
// require("http").createServer(express().use(function(req,res){
//     res.redirect("https://"+req.hostname+req.url);
// })).listen(80);
// Uncomment code above and comment code below to automatically redirect to https
app.listen(80);

console.log(chalk.black.bgBlack("Black"));
console.log(chalk.black.bgRed("Red : [ERROR POST]-all,invalidPassword"));
console.log(chalk.black.bgGreen("Green : [PAGE],student"));
console.log(chalk.black.bgYellow("Yellow : [404]-full"));
console.log(chalk.black.bgBlue("Blue : [POST],dev"));
console.log(chalk.black.bgMagenta("Magenta : tutor"));
console.log(chalk.black.bgCyan("Cyan : admin"));
console.log(chalk.black.bgWhite("White : noUser"));
MongoClient.connect("mongodb://127.0.0.1:27017/monkeyDB",function(err,db){
    if(err){
        console.error(chalk.black.bgRed("[ERROR]",err.message));
        return;
    }

    var configDB=db.collection("config");
    var studentCommentDB=db.collection("studentComment");
    var userDB=db.collection("user");

    // db.dropDatabase();
    // db.dropCollection("studentComment");
    // db.renameCollection("hybridSeat","fullHybrid");
    // configDB.updateOne({},{$set:{maxSeat:[8+6+12+6+6+2,27,12,10,16,12]},$unset:{maxHybridSeat:""}});
    // userDB.updateOne({_id:99033},{$set:{position:"admin"},$setOnInsert:{password:"927eda538a92dd17d6775f37d3af2db8ab3dd811e71999401bc1b26c49a0a8dbb7c8471cb1fc806105138ed52e68224611fb67f150e7aa10f7c5516056a71130"}},{upsert:true});
    // userDB.deleteMany({position:"student"});
    // db.collection("CR60Q2").deleteOne({grade:[11,12]});

    studentCommentDB.dropIndexes();
    studentCommentDB.createIndex({studentID:1,priority:-1,timestamp:-1});
    studentCommentDB.createIndex({timestamp:-1});
    studentCommentDB.createIndex({priority:-1,timestamp:-1});
    // setTimeout(function(){
    //     studentCommentDB.indexes(function(err,result){
    //         console.log("==== indexes");
    //         console.log(result);
    //     });
    // },1000);

    userDB.updateMany({position:"student"},{$unset:{"student.balance":""}});

    db.collection("user").updateOne({_id:99033},{
        $set:{
            password:"927eda538a92dd17d6775f37d3af2db8ab3dd811e71999401bc1b26c49a0a8dbb7c8471cb1fc806105138ed52e68224611fb67f150e7aa10f7c5516056a71130",
            position:"dev",
            firstname:"สิรภพ",lastname:"ครองอภิรดี",nickname:"เชี้ยง",
            firstnameEn:"Siraphop",lastnameEn:"Krongapiradee",nicknameEn:"Chiang",
            email:"chiang-siraphop@mkyhybrid.com",phone:"0820105315",
            tutor:{status:"active"}
        }
    },{upsert:true});

    console.log("[CONNECT] MonkeyDB successfully");
    db.admin().listDatabases(function(err,result){
        console.log("[SHOW] All databases");
        console.log(result);
        db.listCollections().toArray(function(err,result){
            console.log("[SHOW] All collections");
            console.log(result);
        });
    });

    configDB.updateOne({_id:"config"},{
        $setOnInsert:{
            year:60,quarter:3,
            courseMaterialPath:"courseMaterial",
            receiptPath:"receipt",
            nextStudentID:17001,nextTutorID:99035,
            profilePicturePath:"profilePicture",
            studentSlideshowPath:"studentSlideshow",
            maxSeat:[8+6+12+6+6+2,27,12,10,16,12]
        }
    },{upsert:true},function(err,result){
        if(result.upsertedCount){
            require("opn")("http://127.0.0.1/login");
            console.log(chalk.black.bgRed("[WARNING] Please update configurations"));
        }
        configDB.findOne({},function(err,config){
            console.log(config);
            app.locals.post=function(method,input,callback){
                app.locals.postFunction[method]({
                    body:input
                },{
                    send:function(output){
                        callback(output);
                    }
                });
            };
            app.locals.postFunction={};
            require("./post.js")(app,db);
            require("./webFlow.js")(app,db);
        });
    });
});
