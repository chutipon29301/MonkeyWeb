import { Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { AttendanceDocumentInstance, attendanceDocumentModel, IAttendanceDocumentModel } from '../../models/v1/attendanceDocument';

export class AttendanceDocument {

    public static getInstance(): AttendanceDocument {
        if (!this.instance) {
            this.instance = new AttendanceDocument();
        }
        return this.instance;
    }

    private static instance: AttendanceDocument;

    private attendanceModel: Sequelize.Model<AttendanceDocumentInstance, IAttendanceDocumentModel>;

    private constructor() {
        this.attendanceModel = attendanceDocumentModel(Connection.getInstance().getConnection());
    }

    // public add(
    //     file: File,
    // ):Observable<IAttendanceDocumentModel> {

    // }

}
