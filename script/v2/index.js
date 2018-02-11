module.exports = function (passport, db) {
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var express = require('express');
    var morgan = require('morgan');
    var app = express();

    app.use(express.static('assets'));
    app.use(morgan('tiny'));

    require('./task.js')(app, passport, db);

    return app;
}