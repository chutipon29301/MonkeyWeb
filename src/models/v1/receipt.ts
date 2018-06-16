import * as Sequelize from 'sequelize';
import { quarterModel } from './quarter';
import { userModel } from './user';

export interface IReceiptModel {
    ID?: number;
    UserID: number;
    QuarterID: number;
    ReceiptFileName: string;
}

export type ReceiptInstance = Sequelize.Instance<IReceiptModel> & IReceiptModel;

// tslint:disable:object-literal-sort-keys
export function receiptModel(sequalize: Sequelize.Sequelize) {
    const attributes: SequelizeAttributes<IReceiptModel> = {
        ID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        UserID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: userModel(sequalize),
                key: 'ID',
            },
        },
        QuarterID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: quarterModel(sequalize),
                key: 'ID',
            },
        },
        ReceiptFileName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    };

    return sequalize.define<ReceiptInstance, IReceiptModel>('Receipt', attributes, {
        tableName: 'Receipt',
        timestamps: false,
    });
}
