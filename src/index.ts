/* tslint:disable:import-sources-order */
import { config } from 'dotenv';
process.env = config().parsed;
/* tslint:enable:import-sources-order */

import * as express from 'express';
import * as fs from 'fs-extra';
import * as http from 'http';
import * as https from 'https';
import { join } from 'path';
import app from './controllers/Controller';
import { Connection } from './model/Connection';

const caPath = join(__dirname, '../MonkeyWebConfig/ca_bundle.crt');
const keyPath = join(__dirname, '../MonkeyWebConfig/private.key');
const certPath = join(__dirname, '../MonkeyWebConfig/certificate.crt');
if (fs.existsSync(caPath) && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const credentials = {
        ca: fs.readFileSync(caPath),
        cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath),
    };
    https.createServer(credentials, app).listen(443);
    http.createServer(express().use((req, res) => { res.redirect('https://' + req.hostname + req.url); })).listen(80);
}

// Start listening on request after database connection has been made
// tslint:disable-next-line:no-empty
Connection.getInstance().connect().subscribe(() => { }, (error) => {
    console.log(error);
}, () => {
    app.listen(process.env.PORT || 8080, () => { console.log('Start listening'); });
});

console.log('running........');

function exitHandler() {
    Connection.getInstance().close();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
