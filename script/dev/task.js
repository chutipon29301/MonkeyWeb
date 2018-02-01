module.exports = function (app, passport, db) {
    app.get('/taskDB', passport.isLoggedIn, (req, res) => {
        db.collection('task').find({}).toArray().then(tasks => {
            res.render('taskDB',{
                tasks: tasks
            });
        });
    });
}