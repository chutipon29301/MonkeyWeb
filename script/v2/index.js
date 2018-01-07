module.exports = function () {
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var express = require('express');
    var app = express();
    console.log('Hello World');
    app.get('/', (req, res) => {
        res.status(200).send('Hello');
    });

    return app;
}