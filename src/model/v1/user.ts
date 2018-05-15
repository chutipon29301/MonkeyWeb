import { Dictionary } from 'lodash';
import { Int, PreparedStatement } from 'mssql';
import { Observable } from 'rx';
import { Connection } from '../Connection';
import { IUserInfo, IUserNicknameEn } from './interface/User';

const user = {
    // getUser: (id: number): Observable<object> => {
    //     return Observable.create((observer) => {
    //         connect((err, connection) => {
    //             const output: any[] = [];
    //             const request = new Request('SELECT * FROM USERS WHERE ID=' + id, (err) => {
    //                 if (err) { throw err; }
    //             });
    //             request.on('row', (col) => {
    //                 output.push(col);
    //             });
    //             request.on('requestCompleted', () => {
    //                 observer.onNext(output);
    //                 observer.onCompleted();
    //             });
    //             connection.execSql(request);
    //         });
    //     });
    // },
    // getUserInfo: () => {
    //     return Connection.getInstance()
    //         .query<IUserInfo>('SELECT ID, Firstname, Lastname, Nickname FROM Users')
    //         .flatMap((value) => {
    //             console.log(value);
    //             console.log('---------------------');
    //             return value;
    //         });
    // },
    // getAllUser: (): Observable<Array<Dictionary<IUserInfo>>> => {
    //     return Connection.getInstance().query('SELECT ID,  FROM Users');
    // },
    listActiveTutor: (): Observable<Array<Dictionary<IUserNicknameEn>>> => {
        return Connection.getInstance().query('SELECT * FROM Users WHERE Position = "tutor" AND UserStatus = "active"');
    },
};

const prepareStatement = {
    userInfo: () => Connection.getInstance().prepareStatement('SELECT ID, Firstname, Lastname, Nickname, FirstnameEn, LastnameEn, NicknameEn, Email, Phone FROM Users WHERE ID = @id', [{ key: 'id', type: Int }]),
};

export function listActiveTutor(): Observable<Array<Dictionary<IUserNicknameEn>>> {
    return Connection.getInstance().query('SELECT * FROM Users WHERE Position = \'tutor\' AND UserStatus = \'active\'');
}

export function getUserInfo(id: number): Observable<IUserInfo[]> {
    return Connection.getInstance().observableOf(prepareStatement.userInfo(), {id});
}

export default user;
