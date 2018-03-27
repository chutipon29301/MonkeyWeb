import { Document, Schema } from "mongoose";
import * as mongoose from "mongoose";
import { Observable } from "rx";

interface Skill extends Document {
    quarterID: String,
    day: Number,
    student: [{
        studentID: Number,
        subject: String
    }]
}

let skillSchema = new Schema({
    quarterID: String,
    day: Number,
    student: [{
        studentID: Number,
        subject: String
    }]
});

let SkillModel = mongoose.model<Skill>('Skill', skillSchema, 'skillStudent');

export class SKillManager {
    static getSkillForQuarter(quarterID: string): Observable<SkillObject> {
        return Observable.fromPromise(SkillModel.findOne({
            quarterID: quarterID
        })).map(skill => new SkillObject(skill));
    }

    static findSkillContainStudent(studentID: number): Observable<SkillObject[]> {
        return  Observable.fromPromise(SkillModel.find({
            "student.studentID": studentID
        })).map(skill => SkillObject.getSkillArrayObject(skill));
    }
}

export class SkillObject {
    skill: Skill

    constructor(skill: Skill) {
        this.skill = skill;
    }

    static getSkillArrayObject(skills: Skill[]): SkillObject[]{
        return skills.map(skill => new SkillObject(skill));
    }

    getQuarterID(): String{
        return this.skill.quarterID.toString();
    }
}