console.log("[START] post.js");
module.exports=function(app,db){
    var moment=require("moment");
    var path=require("path");

    var userDB=db.collection("user");

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
                if(result==null)res.status(404).sendFile(path.join(__dirname,"../404.html"));
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
        app.get(url,checkAuth(middlewareOptions),function(req,res){
            console.log("[PAGE REQUEST] "+page+" FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
            console.log("\treq.cookies => ",req.cookies);
            res.sendFile(outputPath);
        });
    };

    addPage("login");
    addPage("login",{url:"/"});
    var options={middlewareOptions:{login:true,position:"student"}};
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
    options.middlewareOptions.position={$ne:"student"};
        addPage("adminHome",options);
        addPage("adminAllstudent",options);
        addPage("adminAllcourse",options);
        addPage("adminStudentprofile",options);
        addPage("adminCoursedescription",options);
    addPage("testadmin",{backendDir:true,middlewareOptions:{login:true,position:"admin"}});
    addPage("firstConfig",{backendDir:true});

    app.all("*",function(req,res){
        console.log("[404 REQUEST] "+req.method+" "+req.originalUrl+" FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        console.log("\treq.body => ",req.body);
        res.status(404).sendFile(path.join(__dirname,"../404.html"));
    });
}
