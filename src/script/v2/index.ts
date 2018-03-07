import * as express from 'express';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';

export function app(passport: any) {
    console.log('Hello from ts');
    var app = express();
    app.use(morgan('tiny'));
    mongoose.connect('mongodb://127.0.0.1:27017/monkeyDB');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('OK');
        // require('./workflow.js')(app, passport, db);
    });

    return app;
}