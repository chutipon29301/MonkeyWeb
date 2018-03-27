import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";

interface Hybrid extends Document {
    quarterID: String,
    day: Number,
    student: [{
        studentID: Number,
        subject: String
    }]
}

let hybridSchema = new Schema({
    quarterID: String,
    day: Number,
    student: [{
        studentID: Number,
        subject: String
    }]
});

let HybridModel = mongoose.model<Hybrid>('Hybrid', hybridSchema, 'hybridStudent');

export class HybridManager {
    static getHybridForQuarter(quarterID: string): Observable<HybridObject> {
        return Observable.fromPromise(HybridModel.findOne({
            quarterID: quarterID
        })).map(hybrid => new HybridObject(hybrid));
    }

    static findHybridContainStudent(studentID: number): Observable<HybridObject[]> {
        return Observable.fromPromise(HybridModel.find({
            "student.studentID": studentID
        })).map(hybrid => HybridObject.getHybridArrayObject(hybrid));
    }
}

export class HybridObject {
    hybrid: Hybrid

    constructor(hybrid: Hybrid) {
        this.hybrid = hybrid;
    }

    static getHybridArrayObject(hybrids: Hybrid[]): HybridObject[] {
        return hybrids.map(hybrid => new HybridObject(hybrid));
    }

    getQuarterID(): string {
        return this.hybrid.quarterID.toString();
    }
}