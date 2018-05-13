import { config } from 'dotenv';
process.env = config().parsed;

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import { join } from 'path';
import Controller from './controllers/Controller'
import * as https from 'https';
import * as http from 'http';
import model from './model/model'
import * as fs from 'fs-extra';


let app: express.Application = express();

app.use(express.static(join(__dirname, '../public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
var caPath = join(__dirname, "../MonkeyWebConfig/ca_bundle.crt");
var keyPath = join(__dirname, "../MonkeyWebConfig/private.key");
var certPath = join(__dirname, "../MonkeyWebConfig/certificate.crt");
if (fs.existsSync(caPath) && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    var credentials = {
        ca: fs.readFileSync(caPath),
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
    https.createServer(credentials, app).listen(443);
    http.createServer(express().use((req, res) => {
        res.redirect("https://" + req.hostname + req.url);
    })).listen(80);
}

app.use(cookieParser(process.env.COOKIE_SECRET || 'TEST'));
app.use(logger('dev'));

let controller = new Controller(app);

model.getUser(99011).subscribe(
    (data) => {
        console.log(data)
    },
    (err) => {
        if (err) throw err;
    },
    () => {
        console.log('complete!')
    }
)

console.log('running........')