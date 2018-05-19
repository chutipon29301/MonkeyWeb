import { config } from 'dotenv';
process.env = config().parsed;

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as http from 'http';
import * as https from 'https';
import * as logger from 'morgan';
import * as passport from 'passport';
import * as validator from 'express-validator';
import { join } from 'path';
import Controller from './controllers/Controller';
import model from './model/model';

const app: express.Application = express();

console.log(process.env.DB_USERNAME)

app.use(express.static(join(__dirname, '../public')));
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'TEST'));
app.use(validator());
app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session());

const caPath = join(__dirname, '../MonkeyWebConfig/ca_bundle.crt');
const keyPath = join(__dirname, '../MonkeyWebConfig/private.key');
const certPath = join(__dirname, '../MonkeyWebConfig/certificate.crt');
if (fs.existsSync(caPath) && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const credentials = {
        ca: fs.readFileSync(caPath),
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
    };
    https.createServer(credentials, app).listen(443);
    http.createServer(express().use((req, res) => {
        res.redirect('https://' + req.hostname + req.url);
    })).listen(80);
}


const controller = new Controller(app);

model.getUser(99011).subscribe(
    (data) => {
        console.log(data);
    },
    (err) => {
        if (err) { throw err; }
    },
    () => {
        console.log('complete!');
    },
);

console.log('running........');
