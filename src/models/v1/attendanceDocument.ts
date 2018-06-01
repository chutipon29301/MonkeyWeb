import * as Sequelize from 'sequelize';

export interface IAttendanceDocumentModel {
    ID?: number;
    DocumentPath: string;
}

export type AttendanceDocumentInstance = Sequelize.Instance<IAttendanceDocumentModel> & IAttendanceDocumentModel;

// tslint:disable:object-literal-sort-keys
export function attendanceDocumentModel(sequalize: Sequelize.Sequelize) {
    const attributes: SequelizeAttributes<IAttendanceDocumentModel> = {
        ID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        DocumentPath: {
            type: Sequelize.STRING(128),
            allowNull: false,
        },
    };

    return sequalize.define<AttendanceDocumentInstance, IAttendanceDocumentModel>('AttendanceDocument', attributes, {
        tableName: 'AttendanceDocument',
        timestamps: false,
    });
}
