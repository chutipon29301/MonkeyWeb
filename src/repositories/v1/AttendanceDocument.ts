import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

    private attendanceDocumentModel: Sequelize.Model<AttendanceDocumentInstance, IAttendanceDocumentModel>;

    private constructor() {
        this.attendanceDocumentModel = attendanceDocumentModel(Connection.getInstance().getConnection());
    }

    public add(
        DocumentPath: string,
    ): Observable<IAttendanceDocumentModel> {
        return from(this.attendanceDocumentModel.create({ DocumentPath }));
    }

    public getPath(
        ID: number,
    ): Observable<string> {
        return from(this.attendanceDocumentModel.findOne<string>({
            attributes: {
                include: ['DocumentPath'],
            },
            where: { ID },
        })).pipe(
            map((result) => result.DocumentPath),
        );
    }

    public find(
        ID: number,
    ): Observable<AttendanceDocumentInstance> {
        return from(this.attendanceDocumentModel.findOne<AttendanceDocumentInstance>({
            where: { ID },
        }));
    }

}
