import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import { join } from 'path';
import { Server } from 'http';
import View from './views/View';
let app:express.Application = express();

app.use(express.static(join(__dirname,"../public")));
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(cookieParser(process.env.COOKIE_SECRET||"TEST"));
app.use(logger('dev'));

let server:Server = app.listen(process.env.PORT||8080);
let view = new View(app);
console.log('running........')