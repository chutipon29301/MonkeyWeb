import { urlencoded } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as validator from 'express-validator';
import * as logger from 'morgan';
import * as passport from 'passport';
import { join } from 'path';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { passport as auth } from '../Auth';
import { router as api } from './api';

export default class Server {

    private app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.static(join(__dirname, '../../public')));
        this.app.use(urlencoded({ extended: true }));
        this.app.use(cookieParser(process.env.COOKIE_SECRET || 'TEST'));
        this.app.use(validator());
        this.app.use(logger('dev'));
        this.app.use(auth.initialize());
        this.app.use(passport.session());

        this.app.use('/api', api);
        this.app.get('/testget', (req, res) => {
            return res.status(200).send({ gg: 'ez' });
        });
    }

    public getApp(): Observable<express.Application> {
        return of(this.app);
    }
}
