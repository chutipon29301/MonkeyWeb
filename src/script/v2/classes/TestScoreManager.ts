import * as mongoose from "mongoose";
import { Document, Schema } from "mongoose";
import { Observable } from "rx";
import { UpdateResponse } from "./Constants";

interface TestScoreInterface extends Document {
    testName: String,
    testDate: Date,
    courseID?: mongoose.Types.ObjectId,
    scores: [{
        _id: Number,
        score: Number,
    }],
    maxScore: Number,
}

let testScoreSchema = new Schema({
    testName: String,
    testDate: Date,
    courseID: Schema.Types.ObjectId,
    scores: [{
        _id: Number,
        score: Number,
    }],
    maxScore: Number,
});

let TestScoreModel = mongoose.model<TestScoreInterface>('TestScore', testScoreSchema, 'testScore');

export class TestScoreManager {

    static addTest(testName: string, testDate: Date, maxScore: number, courseID?: string | mongoose.Types.ObjectId): Observable<TestScore> {
        if (courseID! instanceof mongoose.Types.ObjectId) courseID = new mongoose.Types.ObjectId(courseID);
        let testScore = new TestScoreModel({
            testName, testDate, maxScore, courseID
        });
        return Observable.fromPromise(testScore.save()).map(result => new TestScore(result));
    }

    static find(testScoreID: string | mongoose.Types.ObjectId): Observable<TestScore> {
        if (testScoreID! instanceof mongoose.Types.ObjectId) testScoreID = new mongoose.Types.ObjectId(testScoreID);
        return Observable.fromPromise(TestScoreModel.findById(testScoreID)).map(result => new TestScore(result));
    }

    static list(): Observable<TestScore[]> {
        return Observable.fromPromise(TestScoreModel.find({})).map(results => results.map(result => new TestScore(result)));
    }

    static delete(testScoreID: string | mongoose.Types.ObjectId): Observable<UpdateResponse> {
        return Observable.fromPromise(TestScoreModel.deleteOne({ _id: testScoreID }));
    }
}

export class TestScore {

    constructor(private testScore: TestScoreInterface) { }

    public addStudentScore(scores: [{ userID: number, score: number }]): Observable<TestScore> {
        return Observable.fromPromise(TestScoreModel.findByIdAndUpdate(this.testScore._id, {
            $push: {
                scores: {
                    $each: scores
                }
            }
        })).map(result => new TestScore(result));
    }

    public removeStudentScore(userID: number[]): Observable<TestScore> {
        return Observable.fromPromise(TestScoreModel.findByIdAndUpdate(this.testScore._id, {
            $pull: {
                score: {
                    $each: userID
                }
            }
        })).map(result => new TestScore(result));
    }

    public getID():mongoose.Types.ObjectId {
        return this.testScore._id;
    }

}