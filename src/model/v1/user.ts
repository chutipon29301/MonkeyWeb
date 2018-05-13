import { Observable } from 'rx';
import { Request } from 'tedious';
import connect from '../SQLconnection';

const user = {
    getUser: (id: number): Observable<object> => {
        return Observable.create((observer) => {
            connect((err, connection) => {
                const output: any[] = [];
                const request = new Request('SELECT * FROM USERS WHERE ID=' + id, (err) => {
                    if (err) { throw err; }
                });
                request.on('row', (col) => {
                    output.push(col);
                });
                request.on('requestCompleted', () => {
                    observer.onNext(output);
                    observer.onCompleted();
                });
                connection.execSql(request);
            });
        });
    },
};

export default user;
