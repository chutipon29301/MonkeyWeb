import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";

interface HybridZoneInterface extends Document {
    date: Date,
    zone: String,
    student: [{
        _id: Number,
        status: String,
    }]
}

let hybridZoneSchema = new Schema({
    date: Date,
    zone: String,
    student: [{
        _id: Number,
        status: String,
    }]
});

let HybridZoneModel = mongoose.model<HybridZoneInterface>("HybridZone", hybridZoneSchema, "hybridZone");

export class HybridZone {
    constructor(private hybridZone: HybridZoneInterface) { }

    getInterface(): HybridZoneInterface {
        return this.hybridZone
    }
}

export class HybridZoneManager {
    static add(date: Date, zone: string): Observable<HybridZoneInterface> {
        let hybridZone = new HybridZoneModel({
            date: date,
            zone: zone,
            student: []
        });
        return Observable.fromPromise(hybridZone.save());
    }

    static addStudent(date: Date, zone: string, studentID: number): Observable<HybridZoneInterface> {
        return Observable.fromPromise(HybridZoneModel.updateOne({
            date: date,
            zone: zone
        }, {
                $push: {
                    student: {
                        _id: studentID,
                        status: 'CheckIn'
                    }
                }
            }));
    }

    static removeStudent(date: Date, zone: string, studentID: number): Observable<HybridZoneInterface> {
        return Observable.fromPromise(HybridZoneModel.updateOne({
            date: date,
            zone: zone
        }, {
                $pull: {
                    student: {
                        _id: studentID
                    }
                }
            }
        ));
    }

    static checkOut(date: Date, zone: string, studentID: number): Observable<HybridZoneInterface> {
        return this.removeStudent(date, zone, studentID).flatMap(_ => {
            return Observable.fromPromise(HybridZoneModel.updateOne({
                date: date,
                zone: zone
            }, {
                    $push: {
                        student: {
                            _id: studentID,
                            status: 'CheckOut'
                        }
                    }
                }));
        });
    }
}