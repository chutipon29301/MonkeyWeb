import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IStudentStateModel, StudentStateInstance, studentStateModel, UserRegistrationStage } from '../../models/v1/studentState';

export class StudentState {

    public static getInstance(): StudentState {
        if (!this.instance) {
            this.instance = new StudentState();
        }
        return this.instance;
    }

    private static instance: StudentState;

    private studentStateModel: Sequelize.Model<StudentStateInstance, IStudentStateModel>;

    private constructor() {
        this.studentStateModel = studentStateModel(Connection.getInstance().getConnection());
    }

    public add(
        StudentID: number,
        QuarterID: number,
        Grade: number,
        Stage: UserRegistrationStage,
    ): Observable<IStudentStateModel> {
        return from(this.studentStateModel.create({
            // tslint:disable-next-line:object-literal-sort-keys
            StudentID, QuarterID, Grade, Stage,
        }));
    }
}
