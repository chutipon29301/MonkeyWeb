/* tslint:disable:import-sources-order */
import { config } from 'dotenv';
process.env = config().parsed;
/* tslint:enable:import-sources-order */

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as http from 'http';
import * as https from 'https';
import * as logger from 'morgan';
import { join } from 'path';
import Controller from './controllers/Controller';
import { Connection } from './model/Connection';

const app: express.Application = express();

app.use(express.static(join(__dirname, '../public')));
app.use(bodyParser.urlencoded({
    extended: true,
}));
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

app.use(cookieParser(process.env.COOKIE_SECRET || 'TEST'));
app.use(logger('dev'));

Connection.getInstance();
app.listen(process.env.PORT || 8080);

const controller = new Controller(app);

console.log('running........');

function exitHandler() {
    Connection.getInstance().close();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
