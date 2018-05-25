import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { ClassInstance, classModel, IClassModel } from '../../models/v1/class';

export class Class {

    public static getInstance(): Class {
        if (!this.instance) {
            this.instance = new Class();
        }
        return this.instance;
    }

    private static instance: Class;

    private classModel: Sequelize.Model<ClassInstance, IClassModel>;

    private constructor() {
        this.classModel = classModel(Connection.getInstance().getConnection());
    }

    public getModel(): Sequelize.Model<ClassInstance, IClassModel> {
        return this.classModel;
    }

    public addCourse(
        ClassName: string,
        QuarterID: number,
        ClassDate: Date,
        ClassSubject: string,
        Grade: string,
        TutorID: number,
        ClassTimes: number,
    ): Observable<IClassModel> {
        return from(this.classModel.create({
            // tslint:disable-next-line:object-literal-sort-keys
            ClassName, QuarterID, ClassDate, ClassSubject, Grade, TutorID, ClassTimes, ClassType: 'Course',
        }));
    }

    public addHybrid(
        ClassName: string,
        QuarterID: number,
        ClassDate: Date,
        ClassSubject: string,
    ): Observable<IClassModel> {
        return from(this.classModel.create({
            // tslint:disable-next-line:object-literal-sort-keys
            ClassName, QuarterID, ClassDate, ClassSubject, ClassType: 'Hybrid',
        }));
    }

    public addSkill(
        ClassName: string,
        QuarterID: number,
        ClassDate: Date,
        ClassSubject: string,
    ): Observable<IClassModel> {
        return from(this.classModel.create({
            // tslint:disable-next-line:object-literal-sort-keys
            ClassName, QuarterID, ClassDate, ClassSubject, ClassType: 'Skill',
        }));
    }

}
