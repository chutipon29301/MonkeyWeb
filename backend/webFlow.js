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
        addPage("tutorCourse",options);
        addPage("adminHome",options);
        addPage("adminAllstudent",options);
        addPage("adminAllcourse",options);
        addPage("adminStudentprofile",options);
        addPage("adminCoursedescription",options);
        addPage("adminCourseRoom",options);
        addPage("adminCourseTable",options);
    app.locals.post("post/allCourseMaterial",{},function(output){
        db.collection("config").findOne({},function(err,config){
            addPage("adminCourseMaterial",Object.assign({},options,{type:"pug",local:Object.assign({},output,{moment:moment,config:config})}));
            addPage("tutorCourseMaterial",Object.assign({},options,{type:"pug"}));
            addPage("testadmin",{backendDir:true,middlewareOptions:{login:true,position:"dev"}});

            app.all("*",return404);
        });
    });
    // addPage("firstConfig",{backendDir:true});
}
