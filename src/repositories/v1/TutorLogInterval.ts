import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { ITutorLogIntervalModel, TutorLogIntervalInstance, tutorLogIntervalModel } from '../../models/v1/tutorLogInterval';

export class TutorLogInterval {

    public static getInstance(): TutorLogInterval {
        if (!this.instance) {
            this.instance = new TutorLogInterval();
        }
        return this.instance;
    }

    private static instance: TutorLogInterval;

    private tutorLogIntervalModel: Sequelize.Model<TutorLogIntervalInstance, ITutorLogIntervalModel>;

    private constructor() {
        this.tutorLogIntervalModel = tutorLogIntervalModel(Connection.getInstance().getConnection());
    }

    public add(
        StartDate: Date,
        EndDate: Date,
        EditedBy: number,
        IntervalName?: string,
    ): Observable<ITutorLogIntervalModel> {
        return from(this.tutorLogIntervalModel.create({
            EditedBy, EndDate, LastEdit: new Date(), StartDate,
        }));
    }

    public edit(
        ID: number,
        EditedBy: number,
        value: Partial<ITutorLogIntervalModel>,
    ): Observable<number> {
        let updateValue = { EditedBy } as ITutorLogIntervalModel;
        if (value.StartDate) {
            updateValue = { ...updateValue, StartDate: value.StartDate };
        }
        if (value.EndDate) {
            updateValue = { ...updateValue, EndDate: value.EndDate };
        }
        if (value.IntervalName) {
            updateValue = { ...updateValue, IntervalName: value.IntervalName };
        }
        return from(this.tutorLogIntervalModel.update(updateValue, { where: { ID } })).pipe(
            map((result) => result[0]),
        );
    }

    public delete(
        ID: number,
    ): Observable<number> {
        return from(this.tutorLogIntervalModel.destroy({ where: { ID } }));
    }
}
