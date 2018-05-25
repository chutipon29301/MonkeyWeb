import { Int, VarChar } from 'mssql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Connection } from '../Connection';
import { IUserInfo, IUserNicknameEn } from './types/User';

const prepareStatement = {
    userLogin: () => Connection.getInstance().prepareStatement('SELECT COUNT(*) FROM Users WHERE ID = @id AND UserStatus <> \'terminated\' AND UserPassword = @password', [{ key: 'id', type: Int }, { key: 'password', type: VarChar(128) }]),
};

export function getUserLogin(id: number, password: string): Observable<number> {
    return Connection.getInstance()
        .observableOf<{ '': number }>(prepareStatement.userLogin(), { id, password })
        .pipe(map((count) => count[0]['']));
}
