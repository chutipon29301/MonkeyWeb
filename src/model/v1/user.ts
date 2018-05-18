import { Dictionary } from 'lodash';
import { Int, PreparedStatement, VarChar } from 'mssql';
import { Observable } from 'rx';
import { Connection } from '../Connection';
import { IUserInfo, IUserNicknameEn } from './types/User';

const prepareStatement = {
    listStudent: () => Connection.getInstance().prepareStatement('', []),
    listTutor: () => Connection.getInstance().prepareStatement('SELECT ID, NicknameEn FROM USER WHERE Position = @position AND UserStatus = @userStatus', [{ key: 'position', type: VarChar(32) }, { key: 'userStatus', type: VarChar(32) }]),
    userInfo: () => Connection.getInstance().prepareStatement('SELECT ID, Firstname, Lastname, Nickname, FirstnameEn, LastnameEn, NicknameEn, Email, Phone FROM Users WHERE ID = @id', [{ key: 'id', type: Int }]),
};

export function listActiveTutor(): Observable<IUserNicknameEn[]> {
    return Connection.getInstance().observableOf(prepareStatement.listTutor(), { position: 'tutor', userStatus: 'active' });
}

export function getUserInfo(id: number): Observable<IUserInfo[]> {
    return Connection.getInstance().observableOf(prepareStatement.userInfo(), { id });
}
