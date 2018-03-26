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
    date: Date,
    fileName: String,
    path: String,
    type: Number,
    visible: Boolean,
}

export interface SlideshowResponse {
    date: Date,
    fileName: String,
    path: String,
    type: Number,
    visible: Boolean,
    link: String
}

let slideshowSchema = new Schema({
    date: Date,
    fileName: String,
    path: String,
    type: Number,
    visible: Boolean
});

export let SlideshowModel = mongoose.model<Slideshow>("Slideshow", slideshowSchema, "slideshow");

export class SlideshowObject {

    slideshow: Slideshow;

    constructor(slideshow: Slideshow) {
        this.slideshow = slideshow;
    }

    getSlideshowResponse(): SlideshowResponse {
        return {
            date: this.slideshow.date,
            fileName: this.slideshow.fileName,
            path: this.slideshow.path,
            type: this.slideshow.type,
            visible: this.slideshow.visible,
            link: encodeURI(process.env.SLIDESHOW_BASE_NAME + "?d=" + this.slideshow.date + "&n=" + this.slideshow.fileName)
        }
    }
}

export class SlideshowManager {

    static getDir(date: Date): string {
        return join(process.env.SLIDESHOW_PATH, "/" + date + "/");
    }

    static getPath(date: Date, fileName: string): string {
        return join(this.getDir(date), '/' + fileName);
    }

    static addSlideshow(date: Date, fileName: string, path: string, type: number): Observable<Slideshow> {
        let slideshow = new SlideshowModel({
            date: date,
            fileName: fileName,
            path: path,
            type: type,
            visible: true
        });
        return Observable.fromPromise(slideshow.save());
    }

    static addSlideshows(date: Date, type: number, files: Express.Multer.File[]): Observable<Slideshow[]> {
        return Observable.forkJoin(files.map(file => {
            return this.addSlideshow(date, file.filename, this.getPath(date, file.filename), type);
        }));
    }

    static getSlideshow(date: Date, fileName: string): Observable<Slideshow> {
        return Observable.fromPromise(SlideshowModel.findOne({
            date: date,
            fileName: fileName
        }));
    }

    static removeSlideshow(objectID: string | mongoose.Types.ObjectId): Observable<UpdateResponse> {
        if (typeof objectID === "string") objectID = new mongoose.Types.ObjectId(objectID);
        return Observable.fromPromise(SlideshowModel.deleteOne({
            _id: objectID
        }));
    }

    static listSlideshow(startDate: Date, endDate: Date, visible: boolean): Observable<Slideshow[]> {
        return Observable.fromPromise(SlideshowModel.find({
            $and: [
                { date: { $gte: startDate } },
                { date: { $lte: endDate } }
            ],
            visible: visible
        }).sort({
            date: -1
        }));
    }
    
    static listAllSlideshow(startDate: Date, endDate: Date): Observable<Slideshow[]>{
        return Observable.fromPromise(SlideshowModel.find({
            $and: [
                { date: { $gte: startDate } },
                { date: { $lte: endDate } }
            ]
        }).sort({
            date: -1
        }));
    }

    static setVisibility(date: Date, fileName: string, visible: boolean): Observable<UpdateResponse> {
        return Observable.fromPromise(SlideshowModel.updateOne({
            date: date,
            fileName: fileName
        }, {
            $set: {
                visible: visible
            }
        }));
    }
}