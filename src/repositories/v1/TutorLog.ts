import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { ITutorLogModel, TutorLogDetail, TutorLogInstance, tutorLogModel, TutorLogStatus } from '../../models/v1/tutorLog';

export class TutorLog {

    public static getInstance(): TutorLog {
        if (!this.instance) {
            this.instance = new TutorLog();
        }
        return this.instance;
    }

    private static instance: TutorLog;

    private tutorLogModel: Sequelize.Model<TutorLogInstance, ITutorLogModel>;

    private constructor() {
        this.tutorLogModel = tutorLogModel(Connection.getInstance().getConnection());
    }

    public checkIn(
        UserID: number,
    ): Observable<ITutorLogModel> {
        return from(this.tutorLogModel.create({
            CheckIn: new Date(),
            LastEdited: new Date(),
            TutorLogDate: new Date(),
            TutorLogStatus: TutorLogStatus.pending,
            UserID,
        }));
    }

    public checkOut(
        UserID: number,
        Detail0: TutorLogDetail,
        Detail1: TutorLogDetail,
        Detail2: TutorLogDetail,
        Detail3: TutorLogDetail,
        Detail4: TutorLogDetail,
    ): Observable<number> {
        return from(this.tutorLogModel.update({
            CheckOut: new Date(),
            Detail0, Detail1, Detail2, Detail3, Detail4,
            LastEdited: new Date(),
            TutorLogStatus: TutorLogStatus.complete,
        })).pipe(
            map((result) => result[0]),
        );
    }

    public edit(
        ID: number,
        EditedBy: number,
        value: Partial<ITutorLogModel>,
    ): Observable<number> {
        let updateValue = { EditedBy, LastEdited: new Date() } as Partial<ITutorLogModel>;
        if (value.CheckIn) {
            updateValue = { ...updateValue, CheckIn: value.CheckIn };
        }
        if (value.CheckOut) {
            updateValue = { ...updateValue, CheckOut: value.CheckOut };
        }
        if (value.Detail0) {
            updateValue = { ...updateValue, Detail0: value.Detail0 };
        }
        if (value.Detail1) {
            updateValue = { ...updateValue, Detail1: value.Detail1 };
        }
        if (value.Detail2) {
            updateValue = { ...updateValue, Detail2: value.Detail2 };
        }
        if (value.Detail3) {
            updateValue = { ...updateValue, Detail3: value.Detail3 };
        }
        if (value.Detail4) {
            updateValue = { ...updateValue, Detail4: value.Detail4 };
        }
        if (value.TutorLogDate) {
            updateValue = { ...updateValue, TutorLogDate: value.TutorLogDate };
        }
        return from(this.tutorLogModel.update(updateValue, {
            where: { ID },
        })).pipe(
            map((result) => result[0]),
        );
    }

    public isCheckIn(
        UserID: number,
    ): Observable<boolean> {
        return from(this.tutorLogModel.count({
            where: {
                TutorLogStatus: TutorLogStatus.pending, UserID,
            },
        })).pipe(
            map((result) => result !== 0),
        );
    }

    public delete(
        ID: number,
    ): Observable<number> {
        return from(this.tutorLogModel.destroy({ where: { ID } }));
    }
}
