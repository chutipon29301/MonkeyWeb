import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { ITutorExtra, ITutorLogExtraModel, TutorLogExtraInstance, tutorLogExtraModel } from '../../models/v1/tutorLogExtra';

export class TutorLogExtra {

    public static getInstance(): TutorLogExtra {
        if (!this.instance) {
            this.instance = new TutorLogExtra();
        }
        return this.instance;
    }

    private static instance: TutorLogExtra;

    private tutorLogExtraModel: Sequelize.Model<TutorLogExtraInstance, ITutorLogExtraModel>;

    private constructor() {
        this.tutorLogExtraModel = tutorLogExtraModel(Connection.getInstance().getConnection());
    }

    public add(
        UserID: number,
        TutorLogIntervalID: number,
        ExtraValue: number,
        Note?: string,
    ): Observable<ITutorLogExtraModel> {
        let value = {
            ExtraValue, TutorLogIntervalID, UserID,
        } as ITutorLogExtraModel;
        if (Note) {
            value = { ...value, Note };
        }
        return from(this.tutorLogExtraModel.create(value));
    }

    public delete(
        ID: number,
    ): Observable<number> {
        return from(this.tutorLogExtraModel.destroy({ where: { ID } }));
    }

    public edit(
        ID: number,
        value: Partial<ITutorLogExtraModel>,
    ): Observable<number> {
        let updateValue = {} as Partial<ITutorLogExtraModel>;
        if (value.TutorLogIntervalID) {
            updateValue = { ...updateValue, TutorLogIntervalID: value.TutorLogIntervalID };
        }
        if (value.ExtraValue) {
            updateValue = { ...updateValue, ExtraValue: value.ExtraValue };
        }
        if (value.Note) {
            updateValue = { ...updateValue, Note: value.Note };
        }
        return from(this.tutorLogExtraModel.update(updateValue, { where: { ID } })).pipe(
            map((result) => result[0]),
        );
    }

    public list(
        TutorLogIntervalID: number,
    ): Observable<ITutorExtra[]> {
        return from(this.tutorLogExtraModel.findAll<ITutorExtra>({
            attributes: {
                include: ['UserID', 'Note', 'ExtraValue'],
            },
            where: {
                TutorLogIntervalID,
            },
        }));
    }
}
