import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IQuarterModel, QuarterInstance, quarterModel } from '../../models/v1/quarter';

export class Quarter {

    public static getInstance(): Quarter {
        if (!this.instance) {
            this.instance = new Quarter();
        }
        return this.instance;
    }

    private static instance: Quarter;

    private quarterModel: Sequelize.Model<QuarterInstance, IQuarterModel>;

    private constructor() {
        this.quarterModel = quarterModel(Connection.getInstance().getConnection());
    }

    public listQuarter(): Observable<IQuarterModel[]> {
        return from(this.quarterModel.findAll());
    }

}
