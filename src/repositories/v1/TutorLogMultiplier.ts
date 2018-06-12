import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { ITutorLogMulitplierModel, tutorLogMulitplierModel, TutorLogMultiplierInstance } from '../../models/v1/tutorLogMutiplier';

export class TutorLogMultiplier {

    public static getInstance(): TutorLogMultiplier {
        if (!this.instance) {
            this.instance = new TutorLogMultiplier();
        }
        return this.instance;
    }

    private static instance: TutorLogMultiplier;

    private tutorLogMulitplierModel: Sequelize.Model<TutorLogMultiplierInstance, ITutorLogMulitplierModel>;

    private constructor() {
        this.tutorLogMulitplierModel = tutorLogMulitplierModel(Connection.getInstance().getConnection());
    }

    public add(
        UserID: number,
        TutorLogIntervalID: number,
        Multiplier: number,
    ): Observable<ITutorLogMulitplierModel> {
        return from(this.tutorLogMulitplierModel.create(
            { UserID, TutorLogIntervalID, Multiplier },
        ));
    }

    public delete(
        ID: number,
    ): Observable<number> {
        return from(this.tutorLogMulitplierModel.destroy({ where: { ID } }));
    }

    public edit(
        ID: number,
        value: Partial<ITutorLogMulitplierModel>,
    ): Observable<number> {
        let updateValue = {} as Partial<ITutorLogMulitplierModel>;
        if (value.Multiplier) {
            updateValue = { ...updateValue, Multiplier: value.Multiplier };
        }
        if (value.TutorLogIntervalID) {
            updateValue = { ...updateValue, TutorLogIntervalID: value.TutorLogIntervalID };
        }
        if (value.UserID) {
            updateValue = { ...updateValue, UserID: value.UserID };
        }
        return from(this.tutorLogMulitplierModel.update(updateValue, { where: { ID } })).pipe(
            map((result) => result[0]),
        );
    }
}
