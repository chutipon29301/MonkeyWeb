var ObjectID = require("mongodb").ObjectID;

module.exports = function (app, passport, db) {
    app.post('/addTask', passport.isLoggedIn, (req, res) => {
        res.status(200).send('OK');
    });
}