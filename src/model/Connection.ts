import * as _ from 'lodash';
import { ConnectionPool, IResult, ISqlType, ISqlTypeFactory, PreparedStatement } from 'mssql';
import { Observable } from 'rx';

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
        // this.pool.connect();
    }

    public connect(): Observable<ConnectionPool> {
        return Observable.fromPromise(this.pool.connect());
    }

    public prepareStatement(statement: string, fields: Array<{ key: string, type: ISqlTypeFactory }>): Observable<PreparedStatement> {
        return this.newStatement().flatMap((prepareStatement) => {
            for (const field of fields) {
                prepareStatement.input(field.key, {type: field.type} as ISqlType);
            }
            return Observable.create((observer) => {
                prepareStatement.prepare(statement, (error) => {
                    if (error) {
                        observer.onError(error);
                    }
                    observer.onNext(prepareStatement);
                    observer.onCompleted();
                });
            });
        });
    }

    public observableOf<T>(observable: Observable<PreparedStatement>, value?: object): Observable<T[]> {
        return observable.flatMap((statement) => {
            return Observable.create((observer) => {
                statement.execute<T>(value || {}).then((value) => {
                    observer.onNext(value.recordset);
                    observer.onCompleted();
                }).catch((error) => {
                    observer.onError(error);
                });
            });
        });
    }

    public close() {
        this.pool.close();
    }

    private newStatement(): Observable<PreparedStatement> {
        if (this.pool.connected) {
            return Observable.of(new PreparedStatement(this.pool));
        } else {
            return this.connect().flatMap((connection) => {
                return Observable.of(new PreparedStatement(this.pool));
            });
        }
    }

}
