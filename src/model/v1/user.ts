import { Int, VarChar } from 'mssql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Connection } from '../Connection';
import { IUserInfo, IUserNicknameEn } from './types/User';

const prepareStatement = {
    listStudent: () => Connection.getInstance().prepareStatement('', []),
    listTutor: () => Connection.getInstance().prepareStatement('SELECT ID, NicknameEn FROM Users WHERE Position = @position AND UserStatus = @userStatus', [{ key: 'position', type: VarChar(32) }, { key: 'userStatus', type: VarChar(32) }]),
    userInfo: () => Connection.getInstance().prepareStatement('SELECT ID, Firstname, Lastname, Nickname, FirstnameEn, LastnameEn, NicknameEn, Email, Phone FROM Users WHERE ID = @id', [{ key: 'id', type: Int }]),
    userLogin: () => Connection.getInstance().prepareStatement('SELECT COUNT(*) FROM Users WHERE ID = @id AND UserStatus <> \'terminated\' AND UserPassword = @password', [{ key: 'id', type: Int }, { key: 'password', type: VarChar(128) }]),
};

export function listActiveTutor(): Observable<IUserNicknameEn[]> {
    return Connection.getInstance().observableOf<IUserNicknameEn>(prepareStatement.listTutor(), { position: 'tutor', userStatus: 'active' });
}

export function getUserInfo(id: number): Observable<IUserInfo> {
    return Connection.getInstance()
        .observableOf<IUserInfo>(prepareStatement.userInfo(), { id })
        .pipe(map((users) => users[0]));
}

export function getUserLogin(id: number, password: string): Observable<number> {
    return Connection.getInstance()
        .observableOf<{ '': number }>(prepareStatement.userLogin(), { id, password })
        .pipe(map((count) => count[0]['']));
}
