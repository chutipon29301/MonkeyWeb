console.log("[START] post.js");
var run=function(app,db){
    var path=require("path");

    var configDB=db.collection("config");
    // var hybridSeatDB=db.collection("hybridSeat");
    // var hybridSheetDB=db.collection("hybridSheet");
    // in function var courseDB=db.collection("CRXXQX");
    var userDB=db.collection("user");

    app.get("/",function(req,res){
        now=new Date();
        console.log("[PAGE REQUEST] index FROM "+req.ip+" @ "+new Date().toLocaleTimeString());
        res.sendFile(path.join(__dirname,"../","login.html"));
    });
    app.get("/regis",function(req,res){
        now=new Date();
        console.log("[PAGE REQUEST] regis FROM "+req.ip+" @ "+new Date().toLocaleTimeString());
        res.sendFile(path.join(__dirname,"../","registrationCourse.html"));
    });
    app.get("/testadmin",function(req,res){
        now=new Date();
        console.log("[PAGE REQUEST] testadmin FROM "+req.ip+" @ "+new Date().toLocaleTimeString());
        res.sendFile(path.join(__dirname,"testadmin.html"));
    });

    //{id,pass} return {err,verified}
    app.post("/post/password",function(req,res){
        var id=req.body.id;
        var pass=req.body.pass;
        userDB.findOne({id:id,pass:pass},function(err,result){
            if(result==null){
                res.send({verified:false});
            }
            else{
                res.send({verified:true});
            }
        });
    });
    //{id} return {err,firstname,lastname,nickname}
    app.post("/post/name",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                res.send({firstname:result.firstname,lastname:result.lastname,nickname:result.nickname});
            }
        });
    });
    //{id} return {err,status}
    app.post("/post/status",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                res.send({status:result.student.status});
            }
        });
    });
    //{id} return {err,status}
    app.post("/post/status",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                res.send({status:result.student.status});
            }
        });
    });
    //TODO course {grade} return {err,[{course._id,courseName,courseDay}]}
    app.post("/post/gradeCourse",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO course {id,[course._id]} return {err}
    app.post("/post/addStudentCourse",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO Date {id,[skillDate]} return {err}
    app.post("/post/addSkillDate",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO Date {id,[hybridDate]} return {err}
    app.post("/post/addHybridDate",function(req,res){
        var id=req.body.id;
        userDB.findOne({id:id},function(err,result){
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
        userDB.findOne({id:id},function(err,result){
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
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO course {id,[course._id]} return {err}
    app.post("/post/removeStudentCourse",function(req,res){
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO {} return {err,[{firstname,lastname,nickname,student._id}]}
    app.post("/post/allStudent",function(req,res){
        userDB.findOne({id:id},function(err,result){
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
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO Date {id,[skillDate]} return {err}
    app.post("/post/removeSkillDate",function(req,res){
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });
    //TODO Date {id,[hybridDate]} return {err}
    app.post("/post/removeHybridDate",function(req,res){
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                res.send({err:"ID doesn't exist."});
            }
            else{
                //
            }
        });
    });



    //{id,pass,firstname,lastname,nickname,grade} return {err}
    app.post("/post/addStudent",function(req,res){
        console.log("[REQUEST] addStudent");
        var id=req.body.id;
        // var pass=req.body.pass;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var grade=req.body.grade;
        userDB.findOne({id:id},function(err,result){
            if(result==null){
                userDB.insertOne({
                    id:id,pass:"1234",firstname:firstname,lastname:lastname,nickname:nickname,position:"student",
                    student:{grade:grade,registrationState:"registered",course:[],skill:[],hybrid:[],status:"active"}
                });
                res.send();
            }
            else res.send({err:"New user's ID already exists."});
        });
    });
    //
    app.post("/post/list",function(req,res){
        console.log("[REQUEST] list");
        userDB.find({}).toArray(function(err,result){
            res.send(result);
        });
    });
}
module.exports.run=run;
