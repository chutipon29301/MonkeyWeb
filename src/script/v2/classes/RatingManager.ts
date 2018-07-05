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
    quarterID: number;
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
    tutorID: Number,
    quarterID: {
        type: Number,
        default: null,
    }
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

    static add(score: number, studentID: number, type: string, tutorID: number, courseID?: string): Observable<Rating> {
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

    static addSpecial(score: number, studentID: number, tutorID: number): Observable<Rating> {
        return Observable.fromPromise(RatingModel.findOne({
            studentID: studentID,
            type: "mel"
        })).flatMap(rating => {
            if (rating) {
                return Observable.fromPromise(rating.update({
                    $set: {
                        score: score
                    }
                }));
            } else {
                let newRating = new RatingModel({
                    type: "mel",
                    studentID: studentID,
                    score: score,
                    tutorID: tutorID,
                });
                return Observable.fromPromise(newRating.save()).map(result => {
                    return new Rating(result)
                });
            }
        })
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

    static listDetail(studentID: number): Observable<any[]> {

        // return Observable.fromPromise(RatingModel.find({ studentID })).map(results => results.map(result => new Rating(result)));
        return Observable.fromPromise(RatingModel.aggregate([
            {
                $match: { studentID },
            }, {
                $lookup: {
                    from: 'user',
                    localField: 'tutorID',
                    foreignField: '_id',
                    as: 'tutor'
                }
            }
        ])).map(ratings => {
            return ratings.map(rating => {
                return {
                    _id: rating._id,
                    timestamp: rating.timestamp,
                    courseID: rating.courseID,
                    type: rating.type,
                    score: rating.score,
                    tutorName: rating.tutor[0].nicknameEn
                };
            });
        });
    }
}