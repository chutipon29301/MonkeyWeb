export class IOSNotificationManager {
    constructor() {
        var apn = require('apn');
        var keyPath = __dirname.substring(0, __dirname.indexOf('script')) + 'key/MonkeyTutorNotification.p8';
        var provider = new apn.Provider({
            token: {
                key: keyPath,
                keyId: 'GPJR9B9WJ6',
                teamId: 'S4F5J66T3H'
            },
            production: false
        });
    }
}