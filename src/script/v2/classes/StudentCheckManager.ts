import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";
import { UpdateResponse } from "./Constants";

interface StudentCheckInterface extends Document {
    studentID: number;
    checkIn: Date;
    checkOut: Date;
}

let studentCheckSchema = new Schema({
    studentID: Number,
    checkIn: Date,
    checkOut: Date,
});

let StudentCheckModel = mongoose.model<StudentCheckInterface>("StudentCheck", studentCheckSchema, "studentCheck");

export class StudentCheck {

    constructor(private studentCheck: StudentCheckInterface) { }

    delete(): Observable<UpdateResponse> {
        return Observable.fromPromise(StudentCheckModel.deleteOne({
            _id: this.studentCheck._id
        }));
    }

    checkOut(): Observable<UpdateResponse> {
        return Observable.fromPromise(StudentCheckModel.updateOne({
            _id: this.studentCheck._id
        }, {
                $set: {
                    checkOut: new Date()
                }
            }
        ));
    }

    isExist(): boolean {
        return this.studentCheck !== null;
    }
}

export class StudentCheckManager {

    static add(studentID: number): Observable<StudentCheck> {
        let studentCheck = new StudentCheckModel({
            studentID,
            checkIn: new Date(),
            checkOut: null
        });
        return Observable.fromPromise(studentCheck.save()).map(result => new StudentCheck(result));
    }

    static find(id: mongoose.Types.ObjectId | string): Observable<StudentCheck> {
        return Observable.fromPromise(StudentCheckModel.findById(id)).map(result => new StudentCheck(result));
    }

    static getPendingCheckIn(studentID: number): Observable<StudentCheck | null> {
        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return Observable.fromPromise(StudentCheckModel.findOne({
            studentID,
            checkOut: null,
            checkIn: {
                $gte: today,
                $lt: tomorrow,
            }
        })).map(result => new StudentCheck(result));
    }
}
