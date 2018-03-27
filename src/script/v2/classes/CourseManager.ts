import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";
import { QuarterManager } from "./QuarterManager";

interface Course extends Document {
    subject: String,
    grade: Number,
    level: String,
    day: Number,
    tutor: [Number],
    student: [Number],
    submission: [String],
    room: Number,
    year: Number,
    quarter: Number
}

let courseSchema = new Schema({
    subject: String,
    grade: Number,
    level: String,
    day: Number,
    tutor: [Number],
    student: [Number],
    room: Number,
    year: Number,
    quarter: Number
});

let CourseModel = mongoose.model<Course>('Course', courseSchema, 'course');

export class CourseManager {

    static getCourseInQuarter(quarterID: string): Observable<CourseObject[]> {
        return QuarterManager.getQuarter(quarterID).flatMap(quarter => {
            return Observable.fromPromise(CourseModel.find({
                year: quarter.getYear(),
                quarter: quarter.getQuarter()
            }));
        }).map(courses => {
            return CourseObject.getCourseArrayObject(courses);
        });
    }

    static findCourseContainStudent(studentID: number): Observable<CourseObject[]>{
        return Observable.fromPromise(CourseModel.find({
            student: studentID
        })).map(courses => CourseObject.getCourseArrayObject(courses));
    }
}

export class CourseObject {
    course: Course;

    constructor(course: Course) {
        this.course = course
    }

    static getCourseArrayObject(courses: Course[]): CourseObject[] {
        return courses.map(course => new CourseObject(course));
    }

    getQuarterID(): string {
        let year = this.course.year + '';
        let quarter = this.course.quarter + ''
        if(quarter.length === 1) quarter = '0' + quarter;
        return year + quarter;
    }
}