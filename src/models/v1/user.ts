import * as Sequelize from 'sequelize';

export interface IUserID {
    ID: number;
}

export interface IUserNicknameEn extends IUserID {
    NicknameEn?: string;
}

export interface IUserEnglishName extends IUserNicknameEn {
    FirstnameEn?: string;
    LastnameEn?: string;
}

export interface IUserThaiName extends IUserID {
    Firstname?: string;
    Lastname?: string;
    Nickname?: string;
}

export interface IUserName extends IUserEnglishName, IUserThaiName { }

export interface IUserInfo extends IUserName {
    Email?: string;
    Phone?: string;
}

export interface IUserModel extends IUserInfo {
    UserStatus: string;
    Position: string;
    SubPosition?: string;
    UserPassword?: string;
}

export type UserInstance = Sequelize.Instance<IUserModel> & IUserModel;

// tslint:disable:object-literal-sort-keys
export function userModel(sequalize: Sequelize.Sequelize) {
    const attributes: SequelizeAttributes<IUserModel> = {
        ID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        Firstname: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        Lastname: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        Nickname: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        FirstnameEn: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        LastnameEn: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        NicknameEn: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        Email: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        Phone: {
            type: Sequelize.STRING(16),
            allowNull: true,
        },
        UserStatus: {
            type: Sequelize.STRING(32),
            allowNull: false,
        },
        Position: {
            type: Sequelize.STRING(32),
            allowNull: false,
        },
        UserPassword: {
            type: Sequelize.STRING(128),
            allowNull: true,
        },
    };
    return sequalize.define<UserInstance, IUserModel>('Users', attributes);
}
