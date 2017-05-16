console.log("[START] index.js");

var bodyParser=require("body-parser");
var express=require("express");
var multer=require("multer");
var MongoClient=require('mongodb').MongoClient;

var app=express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({dest:"/tmp/"}).any());
app.use(express.static("public"));
app.listen(80);

MongoClient.connect("mongodb://127.0.0.1:27017/monkeyDB",function(err,db){
    if(err){
        console.error("[ERROR] "+err.message);
        return;
    }
    // db.dropCollection("user");
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
            configDB.insertOne({year:60,quarter:2},function(err){
                console.log("[WARNING] Please update path/year/quarter");
                console.log(config);
                require("./post.js").run(app,db);
            });
        }
        else{
            console.log(config);
            require("./post.js").run(app,db);
        }
    });
});
