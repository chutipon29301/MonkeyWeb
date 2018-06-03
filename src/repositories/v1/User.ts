import { AES, enc } from 'crypto-js';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IChatMessage } from '../../models/v1/chat';
import { IAllStudentState, UserRegistrationStage } from '../../models/v1/studentState';
import { IUserFullNameTh, IUserInfo, IUserModel, IUserNicknameEn, UserInstance, userModel, UserStatus } from '../../models/v1/user';

export type AllStudent = IUserFullNameTh & IAllStudentState & IChatMessage;

export class User {

    public static getInstance(): User {
        if (!this.instance) {
            this.instance = new User();
        }
        return this.instance;
    }

    private static instance: User;

    private userModel: Sequelize.Model<UserInstance, IUserModel>;

    private constructor() {
        this.userModel = userModel(Connection.getInstance().getConnection());
    }

    public listTutors(): Observable<IUserNicknameEn[]> {
        return from(
            this.userModel.findAll<IUserNicknameEn>({
                attributes: ['ID', 'NicknameEn'],
                raw: true,
                where: {
                    Position: {
                        [Sequelize.Op.ne]: 'student',
                    },
                    UserStatus: UserStatus.active,
                },
            }),
        );
    }

    public listStudent(
        QuarterID: number,
        options?: {
            Stage?: UserRegistrationStage,
            UserStatus?: UserStatus,
            Grade?: number,
        },
    ): Observable<AllStudent[]> {
        let statement = 'SELECT Users.ID, Users.Firstname, Users.Nickname, StudentState.Grade, StudentState.StudentLevel, StudentState.Remark, Chat.ChatMessage ' +
            'FROM Users ' +
            '   JOIN StudentState ON StudentState.StudentID = Users.ID ' +
            '   LEFT JOIN Chat ON Chat.StudentID = Users.ID AND Chat.ID = ( ' +
            '       SELECT TOP(1) ID ' +
            '       FROM Chat ' +
            '       WHERE Chat.StudentID = Users.ID ' +
            '       ORDER BY Chat.ChatTimestamp DESC ' +
            '   ) ' +
            'WHERE Users.Position = \'student\' AND StudentState.QuarterID = :QuarterID';
        let replacements: any = { QuarterID };
        if (options && options.Stage) {
            statement += ' AND StudentState.Stage = :Stage';
            replacements = {
                ...replacements,
                Stage: options.Stage,
            };
        }
        if (options && options.UserStatus) {
            statement += ' AND Users.UserStatus = :UserStatus';
            replacements = {
                ...replacements,
                UserStatus: options.UserStatus,
            };
        }
        if (options && options.Grade) {
            statement += ' AND StudentState.Grade = :Grade';
            replacements = {
                ...replacements,
                Grade: options.Grade,
            };
        }
        return Connection.getInstance().query<AllStudent>(statement,
            {
                raw: true,
                replacements,
                type: Sequelize.QueryTypes.SELECT,
            },
        );
    }

    public getUserInfo(
        ID: number,
    ): Observable<IUserInfo> {
        return from(
            this.userModel.findOne<IUserInfo>({
                attributes: {
                    exclude: ['UserPassword'],
                },
                where: { ID },
            }),
        );
    }

    public login(
        ID: number,
        UserPassword: string,
    ): Observable<boolean> {
        return from(this.userModel.findOne<IUserModel>({
            attributes: {
                include: ['UserPassword'],
            },
            where: { ID },
        })).pipe(
            map((user) => {
                return AES.decrypt(user.UserPassword, process.env.PASSWORD_SECRET).toString(enc.Utf8) === UserPassword;
            }),
        );
    }

    // public addUser(ID: number)

    public updatePassword(ID: number, password: string): Observable<IUserModel[]> {
        return from(this.userModel.update({
            UserPassword: AES.encrypt(password, process.env.PASSWORD_SECRET).toString(),
        }, { where: { ID } }),
        ).pipe(
            map((result) => result[1]),
        );
    }
}
