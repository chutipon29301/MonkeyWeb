import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IUserModel, IUserNicknameEn, UserInstance, userModel } from '../../models/v1/user';

export class User {

    public static getInstance(): User {
        if (!this.instance) {
            this.instance = new User();
        }
        return this.instance;
    }

    private static instance: User;

    private model: Sequelize.Model<UserInstance, IUserModel>;

    private constructor() {
        this.model = userModel(Connection.getInstance().getConnection());
    }

    public listTutors(): Observable<IUserNicknameEn[]> {
        return from(
            this.model.findAll<IUserNicknameEn>({
                attributes: ['ID', 'NicknameEn'],
                where: {
                    Position: 'tutor',
                    UserStatus: 'active',
                },
            }),
        );
    }
}
