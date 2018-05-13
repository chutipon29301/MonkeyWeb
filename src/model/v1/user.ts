import connect from '../SQLconnection'
import { Connection, Request, ConnectionError } from "tedious";
import { Observer, Observable } from 'rx';

let user = {
    getUser: (id: number): Observable<object> => {
        return Observable.create((observer) => {
            connect((err, connection) => {
                let output: any[] = [];
                let request = new Request('SELECT * FROM USERS WHERE ID=' + id, (err) => {
                    if (err) throw err;
                });
                request.on('row', (col) => {
                    output.push(col);
                })
                request.on('requestCompleted', () => {
                    observer.onNext(output);
                    observer.onCompleted();
                })
                connection.execSql(request);
            })
        })
    }
}

export default user;