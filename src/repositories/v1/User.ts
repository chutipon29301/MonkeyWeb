import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IAllStudentState, UserRegistrationStage } from '../../models/v1/studentState';
import { IUserFullNameTh, IUserInfo, IUserModel, IUserNicknameEn, UserInstance, userModel, UserStatus } from '../../models/v1/user';

export type AllStudent = IUserFullNameTh & IAllStudentState;

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
                where: {
                    Position: {
                        [Sequelize.Op.ne]: 'student',
                    },
                    UserStatus: UserStatus.active,
                },
            }),
        );
    }

    public listStudent(QuarterID: number, options?: { Stage?: UserRegistrationStage, UserStatus?: UserStatus, Grade?: number }): Observable<AllStudent[]> {
        let statement = 'SELECT Users.ID, Users.Firstname, Users.Nickname, StudentState.Grade, StudentState.StudentLevel, StudentState.Remark ' +
            'FROM Users JOIN StudentState ON StudentState.StudentID = Users.ID ' +
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
                replacements,
                type: Sequelize.QueryTypes.SELECT,
            },
        );
    }

    public getUserInfo(ID: number): Observable<IUserInfo> {
        return from(
            this.userModel.findOne<IUserInfo>({
                attributes: {
                    exclude: ['UserPassword'],
                },
                where: { ID },
            }),
        );
    }

    public login(ID: number, UserPassword: string): Observable<boolean> {
        return from(this.userModel.count({
            where: { ID, UserPassword },
        })).pipe(map((count) => count !== 0));
    }
}
