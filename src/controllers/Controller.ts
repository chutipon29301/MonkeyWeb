import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as validator from 'express-validator';
import * as logger from 'morgan';
import * as passport from 'passport';
import { join } from 'path';
import { passport as auth } from '../Auth';
import { router as api } from './api';

const app = express();

app.use(express.static(join(__dirname, '../public')));
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'TEST'));
app.use(validator());
app.use(logger('dev'));
app.use(auth.initialize());
app.use(passport.session());

app.use('/api', api);

app.get('/testget', (req, res) => {
    return res.status(200).send({ gg: 'ez' });
});

export default app;
