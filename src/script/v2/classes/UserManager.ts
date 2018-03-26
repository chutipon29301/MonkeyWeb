import { Document, Schema, Mongoose } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";

interface User extends Document {
    _id: number,
    password: string,
    position: string,
    firstname: string,
    lastname: string,
    nickname: string,
    firstnameEn: string,
    lastnameEn: string,
    nicknameEn: string,
    email: string,
    phone: string
}

export interface Tutor extends User {
    tutor: {
        status: string
    },
    subPosition: string
}

export interface Student extends User {
    student: {
        grade: number,
        skillday: any[],
        phoneParent: string,
        status: string,
        quarter: {
            year: number,
            quarter: number,
            registrationState: string,
            subRegistrationState: string
        }[],
        level: string,
        remark: string
    }
}

let studentSchema = new Schema({
    password: String,
    position: String,
    firstname: String,
    lastname: String,
    nickname: String,
    firstnameEn: String,
    lastnameEn: String,
    nicknameEn: String,
    email: String,
    phone: String,
    student: {
        grade: Number,
        skillday: [],
        phoneParent: String,
        status: String,
        quarter: [{
            year: Number,
            quarter: Number,
            registrationState: String,
            subRegistrationState: String
        }],
        level: String,
        remark: String
    }
});

let tutorSchema = new Schema({
    password: String,
    position: String,
    firstname: String,
    lastname: String,
    nickname: String,
    firstnameEn: String,
    lastnameEn: String,
    nicknameEn: String,
    email: String,
    phone: String,
    tutor: {
        status: String
    },
    subPosition: String
});

export let StudentModel = mongoose.model<Student>("Student", studentSchema, "user");
export let TutorModel = mongoose.model<Tutor>("Tutor", tutorSchema, "user");


export class UserManager {

    static getStudentInfo(userID: number): Observable<Student> {
        return Observable.fromPromise(StudentModel.findById(userID));
    }

    static getTutorInfo(userID: number): Observable<Tutor> {
        return Observable.fromPromise(TutorModel.findById(userID));
    }
}