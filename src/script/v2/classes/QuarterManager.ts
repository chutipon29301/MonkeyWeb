import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";

interface Quarter extends Document {
    year: Number,
    quarter: Number,
    name: String,
    maxSeat: [Number],
    status: String
}

let quarterSchema = new Schema({
    year: Number,
    quarter: Number,
    name: String,
    maxSeat: [Number],
    status: String
});

let QuarterModel = mongoose.model<Quarter>('Quarter', quarterSchema, 'quarter');

export class QuarterManager {
    static getQuarter(quarterID: string): Observable<QuarterObject> {
        return Observable.fromPromise(QuarterModel.findById(quarterID)).map(quarter => new QuarterObject(quarter));
    }
}

export class QuarterObject {

    quarter: Quarter

    constructor(quarter: Quarter) {
        this.quarter = quarter
    }

    getYear(): number {
        return this.quarter.year.valueOf();
    }

    getQuarter(): number {
        return this.quarter.quarter.valueOf();
    }

    getQuarterID(): string {
        return this.quarter._id;
    }
}
