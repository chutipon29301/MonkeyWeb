import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IReceiptModel, ReceiptInstance, receiptModel } from '../../models/v1/receipt';

export class Receipt {

    public static getInstance(): Receipt {
        if (!this.instance) {
            this.instance = new Receipt();
        }
        return this.instance;
    }

    private static instance: Receipt;

    private receiptModel: Sequelize.Model<ReceiptInstance, IReceiptModel>;

    private constructor() {
        this.receiptModel = receiptModel(Connection.getInstance().getConnection());
    }

    public add(
        UserID: number,
        QuarterID: number,
        ReceiptFileName: string,
    ): Observable<IReceiptModel> {
        return from(this.receiptModel.create({ UserID, QuarterID, ReceiptFileName }));
    }

    public delete(
        ID: number,
    ): Observable<number> {
        return from(this.receiptModel.destroy({ where: { ID } }));
    }
}
