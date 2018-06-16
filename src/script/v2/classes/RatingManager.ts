import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";
import { UpdateResponse } from "./Constants";

interface RatingInterface extends Document {
    timestamp: Date;
    courseID: mongoose.Types.ObjectId;
    type: string;
    studentID: number;
    score: number;
    tutorID: number;
}

let ratingSchema = new Schema({
    timestamp: {
        type: Date,
        default: new Date(),
    },
    courseID: {
        type: Schema.Types.ObjectId,
        default: null
    },
    type: String,
    studentID: Number,
    score: Number,
    tutorID: Number
});

let RatingModel = mongoose.model<RatingInterface>("Rating", ratingSchema, "rating");

export class Rating {

    constructor(private rating: RatingInterface) { }

    getInterface(): RatingInterface {
        return this.rating;
    }

    delete(): Observable<UpdateResponse> {
        return Observable.fromPromise(RatingModel.deleteOne({
            _id: this.rating._id
        }));
    }

}

export class RatingManager {

    static add(score: number, studentID: number, type: string, tutorID: string, courseID?: string): Observable<Rating> {
        let rating = new RatingModel({
            courseID: courseID,
            type: type,
            studentID: studentID,
            score: score,
            tutorID: tutorID,
        });
        return Observable.fromPromise(rating.save()).map(result => {
            return new Rating(result)
        });
    }

    static find(id: mongoose.Types.ObjectId | string): Observable<Rating> {
        if (typeof id === "string") id = new mongoose.Types.ObjectId(id);
        return Observable.fromPromise(RatingModel.findById(id)).map(result => new Rating(result));
    }

    static list(studentID: number): Observable<{ type: string, rating: number }[]> {
        return Observable.fromPromise(RatingModel.aggregate([{
            $match: { studentID },
        }, {
            $group: {
                _id: "$type",
                rating: {
                    $avg: "$score"
                }
            }
        }])).map(result => {
            return result.map(res => {
                return {
                    type: res._id,
                    rating: res.rating,
                };
            });
        });
    }
}