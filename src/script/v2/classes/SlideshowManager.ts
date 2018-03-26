import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";
import { UpdateResponse } from "./Constants";
import { join } from "path";

export enum SlideshowType {
    NEWS = 0,
    STUDENT_PORTAIT = 1,
    STUDENT_LANDSCAPE = 2
}

export interface Slideshow extends Document {
    startDate: Date,
    endDate: Date,
    fileName: String,
    path: String,
    type: Number
}

export interface SlideshowResponse {
    startDate: Date,
    endDate: Date,
    fileName: string,
    path: string,
    type: number,
    link: string
}

let slideshowSchema = new Schema({
    startDate: Date,
    endDate: Date,
    fileName: String,
    path: String,
    type: Number
});

export let SlideshowModel = mongoose.model<Slideshow>('SlideshowModel', slideshowSchema, 'slideshow');

export class SlideshowObject {
    slideshow: Slideshow

    constructor(slideshow: Slideshow) {
        this.slideshow = slideshow;
    }

    getSlideshowResponse(): SlideshowResponse {
        return {
            startDate: this.slideshow.startDate,
            endDate: this.slideshow.endDate,
            fileName: this.slideshow.fileName.valueOf(),
            path: this.slideshow.path.valueOf(),
            type: this.slideshow.type.valueOf(),
            link: encodeURI(process.env.SLIDESHOW_BASE_NAME + "?id=" + this.slideshow._id)
        };
    }
}

export class SlideshowManager {

    static getPath(fileName: string): string {
        return join(process.env.SLIDESHOW_PATH, fileName);
    }

    static addSlideshowImage(startDate: Date, endDate: Date, fileName: string, path: string, type: number): Observable<Slideshow> {
        let slideshow = new SlideshowModel({
            startDate: startDate,
            endDate: endDate,
            fileName: fileName,
            path: path,
            type: type
        });
        return Observable.fromPromise(slideshow.save());
    }

    static addSlideshowImages(startDate: Date, endDate: Date, files: Express.Multer.File[], type: number): Observable<Slideshow[]> {
        return Observable.forkJoin(files.map(file => {
            return this.addSlideshowImage(startDate, endDate, file.filename, this.getPath(file.filename), type);
        }));
    }

    static getSlideshow(slideshowID: string | mongoose.Types.ObjectId): Observable<Slideshow> {
        if (typeof slideshowID === "string") slideshowID = new mongoose.Types.ObjectId(slideshowID);
        return Observable.fromPromise(SlideshowModel.findById(slideshowID));
    }

    static deleteSlideshow(slideshowID: string | mongoose.Types.ObjectId): Observable<UpdateResponse> {
        if (typeof slideshowID === "string") slideshowID = new mongoose.Types.ObjectId(slideshowID);
        return Observable.fromPromise(SlideshowModel.deleteOne({
            _id: slideshowID
        }));
    }

    static listSlideshow(startDate: Date, endDate: Date): Observable<Slideshow[]> {
        return Observable.fromPromise(SlideshowModel.find({
            $or: [{
                $and: [
                    { startDate: { $gte: startDate } },
                    { startDate: { $lte: endDate } }
                ]
            }, {
                $and: [
                    { endDate: { $gte: startDate } },
                    { endDate: { $lte: endDate } }
                ]
            }]
        }).sort({
            startDate: -1
        }));
    }
}