import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getUserInfo } from './model/v1/user'

let opts = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.JWT_SECRET,
}

passport.use(new Strategy(opts,(payload,done)=>{
    console.log(payload)
    getUserInfo(payload.userID).subscribe((user)=>{
        if(user[0]) return done(null, user[0]);
        else return done(null, false);
    },(err)=>{
        return done(err, false);
    })
}))

export default passport;