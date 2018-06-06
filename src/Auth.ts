import { Request, Response } from 'express';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { User } from './repositories/v1/User';
import * as jwt from 'jwt-simple';
import { IUserModel } from './models/v1/user';
import { RequestHandlerParams } from 'express-serve-static-core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
interface IPayload {
  userID: any;
  expire: string;
}

interface IToken {
  token: string;
  refreshToken: string;
}

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
};

class Auth {
  public static refreshTokens: any = {};
  public static initialize(): RequestHandlerParams {
    passport.use(
      new JwtStrategy(opts, (req: Request, payload: IPayload, done: any) => {
        const expire = new Date(payload.expire);
        const today = new Date();
        if (expire > today) {
          User.getInstance()
            .getUserInfo(payload.userID)
            .subscribe(
              user => {
                if (user) req.user = user;
                done(null, user || false);
              },
              error => done(error, false)
            );
        } else {
          done(null, false);
        }
      })
    );
    return passport.initialize();
  }
  public static session() {
    return passport.session();
  }
  public static authenticate() {
    return passport.authenticate('jwt', { session: false });
  }
  public static generateToken(payload: IPayload): IToken {
    let refreshExpire = new Date();
    refreshExpire.setDate(refreshExpire.getDate() + 365);
    let refreshToken = jwt.encode(
      { userID: payload.userID, expire: refreshExpire },
      process.env.JWT_SECRET
    );
    let response = {
      token: 'bearer ' + jwt.encode(payload, process.env.JWT_SECRET),
      refreshToken: refreshToken
    };
    this.refreshTokens[refreshToken] = response.token;
    return response;
  }
  public static refresh() {}
  public static login(userID: number, password: string): Observable<IToken> {
    return User.getInstance()
      .login(userID, password)
      .pipe(
        map(user => {
          if (user) {
            const expire = new Date();
            expire.setDate(expire.getDate() + 7);
            // tslint:disable:object-literal-sort-keys
            let payload = {
              userID: userID,
              expire: expire.toString()
            };
            return Auth.generateToken(payload);
          } else {
            throw new Error('Failed to login');
          }
        })
      );
  }
}
export default Auth;
