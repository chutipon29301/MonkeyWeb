module.exports = function(app,db,post,passport){
    var path = require('path')
    post('/post/v1/login', function(req,res,next){
        passport.authenticate('local', function(err,user){    
            if(err) throw err;
            if(!user) res.status(202).send({
                err : 202,
                msg : "This ID or password do not match."
            });
            else{
                req.logIn(user , function(err){
                    if(err) throw err;
                    // res.status(200).send({msg : 'ok' , redirect : '/test' , status : req.isAuthenticated()})
                    return res.redirect(307,'/test')
                })
            }
        })(req,res,next)
    })
    post('/post/v1/isLoggedIn', function(req,res,next){
        if(req.isAuthenticated()) res.status(200).send({loggedIn : true})
        else{res.status(202).send({loggedIn : false})}
    })
    post('/post/v1/logout',function(req,res,next){
        req.logOut()
    })
    app.get('/logout',function(req,res,next){
        req.logOut();
        res.redirect('/')
    })
}