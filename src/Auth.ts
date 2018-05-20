import { Request, Response } from 'express';
import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getUserInfo } from './model/v1/user';

interface Payload {
    userID: any,
    expire: string
}

let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

passport.use(new Strategy(opts, (payload: Payload, done) => {
    let expire = new Date(payload.expire);
    let today = new Date();
    if (expire > today) {
        getUserInfo(payload.userID).subscribe((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        }, (err) => {
            return done(err, false);
        })
    } else {
        done(null, false);
    }
}));

//TODO:
// login by check userID and password in req.body and send token of userID and expire back to client
let login = (req: Request, res: Response) => {

}

export { passport, login };