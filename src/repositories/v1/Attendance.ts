import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { AttendanceInstance, attendanceModel, IAttendanceModel } from '../../models/v1/attendance';

export class Attendance {

    public static getInstance(): Attendance {
        if (!this.instance) {
            this.instance = new Attendance();
        }
        return this.instance;
    }

    private static instance: Attendance;

    private attendanceModel: Sequelize.Model<AttendanceInstance, IAttendanceModel>;

    private constructor() {
        this.attendanceModel = attendanceModel(Connection.getInstance().getConnection());
    }

    public add(
        StudentID: number,
        ClassID: number,
        AttendanceDate: Date,
        AttendanceType: string,
        Reason: string,
        Sender: string,
        AttendanceDocumentID?: number,
    ): Observable<IAttendanceModel> {
        let value = {
            AttendanceDate, AttendanceType, ClassID, Reason, Sender, StudentID,
        } as IAttendanceModel;
        if (AttendanceDocumentID) {
            value = { ...value, AttendanceDocumentID };
        }
        return from(this.attendanceModel.create(value));
    }
}
