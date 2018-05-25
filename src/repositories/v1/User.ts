import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IUserInfo, IUserModel, IUserNicknameEn, UserInstance, userModel } from '../../models/v1/user';

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
                    UserStatus: 'active',
                },
            }),
        );
    }

    public getUserInfo(id: number): Observable<IUserInfo> {
        return from(
            this.userModel.findOne<IUserInfo>({
                attributes: {
                    exclude: ['UserPassword', 'createdAt', 'updatedAt'],
                },
                where: {
                    ID: id,
                },
            }),
        );
    }
}
