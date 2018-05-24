import { ConnectionPool, ISqlType, PreparedStatement } from 'mssql';
import { from, Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';

export class Connection {

    public static getInstance(): Connection {
        if (!Connection.instance) {
            Connection.instance = new Connection();
        }
        return Connection.instance;
    }

    private static instance: Connection;

    /* tslint:disable:object-literal-sort-keys */
    private config = {
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        options: {
            encrypt: true,
        },
    };
    /* tslint:enable:object-literal-sort-keys */

    private pool: ConnectionPool;

    private constructor() {
        this.pool = new ConnectionPool(this.config);
    }

    public isConnected(): boolean {
        return this.pool.connected || false;
    }

    public connect(): Observable<ConnectionPool> {
        return from(this.pool.connect());
    }

    public prepareStatement(statement: string, fields: Array<{ key: string, type: (() => ISqlType) | ISqlType }>): Observable<PreparedStatement> {
        return this.newStatement().pipe(flatMap((prepareStatement) => {
            for (const field of fields) {
                prepareStatement.input(field.key, field.type);
            }
            return new Observable((observer) => {
                prepareStatement.prepare(statement, (error) => {
                    if (error) {
                        console.log(error);
                        observer.error(error);
                    }
                    observer.next(prepareStatement);
                    observer.complete();
                });
            });
        }));
    }

    public observableOf<T>(observable: Observable<PreparedStatement>, value?: object): Observable<T[]> {
        return observable.pipe(flatMap(
            (statement) => new Observable((observer) => {
                statement.execute<T>(value || {}).then((value) => {
                    observer.next(value.recordset);
                    observer.complete();
                }).catch((error) => {
                    observer.error(error);
                });
            }),
        ));
    }

    public close() {
        this.pool.close();
    }

    private newStatement(): Observable<PreparedStatement> {
        if (this.pool.connected) {
            return of(new PreparedStatement(this.pool));
        } else {
            this.connect().pipe(flatMap(
                (connection) => of(new PreparedStatement(this.pool)),
            ));
        }
    }

}
