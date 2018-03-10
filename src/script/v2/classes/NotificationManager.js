class NotificationManager {
    constructor(deviceTokenCollection) {
        var apn = require('apn');
        try {
            var keyPath = __dirname.substring(0, __dirname.indexOf('script')) + 'key/MonkeyTutorNotification.p8';
            this.apnProvider = new apn.Provider({
                token: {
                    key: keyPath,
                    keyId: 'GPJR9B9WJ6',
                    teamId: 'S4F5J66T3H'
                },
                production: false
            });
            this.deviceTokenCollection = deviceTokenCollection;
        } catch (error) {
            console.log(error);
        }
    }

    sendNotification(msg, users) {
        return this.deviceTokenCollection.find({
            userID: {
                $in: users
            }
        }).toArray().then(tokens => {
            return Promise.all(tokens.map(token => {
                var notification = new apn.Notification();
                notification.topic = 'com.monkey-monkey.tutor';
                notification.expiry = Math.floor(Date.now() / 1000) + 86400;
                notification.badge = 1;
                notification.sound = 'ping.aiff';
                notification.alert = msg;
                notification.payload = {
                    id: 123
                };
                return this.apnProvider.send(notification, token._id);
            }));
        });
    }
}

module.exports = NotificationManager;