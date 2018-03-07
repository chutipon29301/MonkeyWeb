module.exports = function (passport) {
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var mongoose = require('mongoose');
    var express = require('express');
    var morgan = require('morgan');
    var app = express();

    app.use(express.static('assets'));
    app.use(morgan('tiny'));

    mongoose.connect('mongodb://127.0.0.1:27017/monkeyDB');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        require('./workflow.js')(app, passport, db);
    });

    return app;
}