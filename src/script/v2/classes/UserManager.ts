import { Document, Schema, Mongoose } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";
import { CourseManager, CourseObject } from "./CourseManager";
import { HybridManager, HybridObject } from "./HybridManager";
import { SKillManager, SkillObject } from "./SkillManager";

interface User extends Document {
    _id: Number,
    password: String,
    position: String,
    firstname: String,
    lastname: String,
    nickname: String,
    firstnameEn: String,
    lastnameEn: String,
    nicknameEn: String,
    email: String,
    phone: String
}

export interface Tutor extends User {
    tutor: {
        status: String
    },
    subPosition: String
}

export interface Student extends User {
    student: {
        grade: Number,
        skillday: any[],
        phoneParent: String,
        status: String,
        quarter: {
            year: Number,
            quarter: Number,
            registrationState: String,
            subRegistrationState: String
        }[],
        level: String,
        remark: String
    }
}

let studentSchema = new Schema({
    _id: Number,
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
    _id: Number,
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

    static getStudentInfo(userID: number): Observable<StudentObject> {
        return Observable.fromPromise(StudentModel.findById(userID as Number)).map(student => new StudentObject(student));
    }

    static getTutorInfo(userID: number): Observable<TutorObject> {
        return Observable.fromPromise(TutorModel.findById(userID as Number)).map(tutor => new TutorObject(tutor));
    }
}

class UserObject {

    user: User

    constructor(user: User) {
        this.user = user
    }

    getID(): number {
        return this.user._id.valueOf();
    }
}

export class StudentObject extends UserObject {

    student: Student

    constructor(student: Student) {
        super(student);
        student = this.user as Student;
    }

    getRegistrationQuarter(): Observable<[CourseObject[], HybridObject[], SkillObject[]]>{
        return Observable.zip(
            CourseManager.findCourseContainStudent(this.getID()),
            HybridManager.findHybridContainStudent(this.getID()),
            SKillManager.findSkillContainStudent(this.getID())
        );
    }
}

export class TutorObject extends UserObject {

    tutor: Tutor

    constructor(tutor: Tutor) {
        super(tutor);
        tutor = this.user as Tutor;
    }

    getNicknameEn(): string{
        return this.tutor.nicknameEn.toString();
    }
}