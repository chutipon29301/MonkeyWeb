import { Schema, Document } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";

export interface IOSToken extends Document {
    _id: string,
    device: string,
    userID: number
}

let IOSTokenSchema = new Schema({
    _id: String,
    device: String,
    userID: Number
});

export let IOSTokenModel = mongoose.model<IOSToken>('IOSToken', IOSTokenSchema, 'deviceToken');

export class IOSTokenManager {
    static addToken(token: string, userID: number): Observable<IOSToken> {
        let deviceToken = new IOSTokenModel({
            _id: token,
            device: 'iOS',
            userID: userID
        });
        return Observable.fromPromise(deviceToken.save());
    }

    static getUserToken(userID: number): Observable<IOSToken[]> {
        return Observable.fromPromise(IOSTokenModel.find({
            userID: userID
        }));
    }
}


export class IOSNotificationManager {
    private static _instance: IOSNotificationManager = new IOSNotificationManager();
    private provider: any;
    private apn: any;
    private constructor() {
        this.apn = require('apn');
        try {
            var keyPath = __dirname.substring(0, __dirname.indexOf('script')) + 'key/MonkeyTutorNotification.p8';
            this.provider = new this.apn.Provider({
                token: {
                    key: keyPath,
                    keyId: 'GPJR9B9WJ6',
                    teamId: 'S4F5J66T3H'
                },
                production: false
            });
        } catch (error) {
            console.log(error);
        }

    }

    public static getInstance(): IOSNotificationManager {
        return this._instance;
    }

    public send(userID: number, msg: string): Observable<any> {
        return IOSTokenManager.getUserToken(userID).flatMap(tokens => {
            var notification = new this.apn.Notification();
            notification.topic = 'com.monkey-monkey.tutor';
            notification.expiry = Math.floor(Date.now() / 1000) + 86400;
            notification.badge = 1;
            notification.sound = 'ping.aiff';
            notification.alert = msg;
            notification.payload = {
                id: 123
            };
            return Observable.fromPromise(mongoose.Promise.all(tokens.map(token => {
                return this.provider.send(notification, token._id);
            })));
        });
    }
}