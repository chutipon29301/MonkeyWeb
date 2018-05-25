import { Request, Response } from 'express';
import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from './repositories/v1/User';

interface IPayload {
    userID: any;
    expire: string;
}

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(new Strategy(opts, (payload: IPayload, done) => {
    const expire = new Date(payload.expire);
    const today = new Date();
    if (expire > today) {
        User.getInstance().getUserInfo(payload.userID)
            .subscribe(
                (user) => done(null, user || false),
                (error) => done(error, false),
        );
    } else {
        done(null, false);
    }
}));

export { passport };
