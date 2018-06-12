import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { ITutorLogStatusModel, TutorLogStatusInstance, tutorLogStatusModel, TutorLogUserStatus } from '../../models/v1/tutorLogStatus';

export class TutorLogStatus {

    public static getInstance(): TutorLogStatus {
        if (!this.instance) {
            this.instance = new TutorLogStatus();
        }
        return this.instance;
    }

    private static instance: TutorLogStatus;

    private tutorLogStatusModel: Sequelize.Model<TutorLogStatusInstance, ITutorLogStatusModel>;

    private constructor() {
        this.tutorLogStatusModel = tutorLogStatusModel(Connection.getInstance().getConnection());
    }

    public add(
        UserID: number,
        TutorLogIntervalID: number,
        TutorLogStatus: TutorLogUserStatus,
    ): Observable<ITutorLogStatusModel> {
        return from(this.tutorLogStatusModel.create({ UserID, TutorLogIntervalID, TutorLogStatus }));
    }

    public edit(
        ID: number,
        value: Partial<ITutorLogStatusModel>,
    ): Observable<number> {
        let updateValue = {} as Partial<ITutorLogStatusModel>;
        if (value.TutorLogStatus) {
            updateValue = { ...updateValue, TutorLogStatus: value.TutorLogStatus };
        }
        return from(this.tutorLogStatusModel.update(updateValue, { where: { ID } })).pipe(
            map((result) => result[0]),
        );
    }
}
