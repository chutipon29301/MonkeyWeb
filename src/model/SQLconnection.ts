import { Connection, ConnectionError } from 'tedious';

/* tslint:disable:object-literal-sort-keys */
const config = {
    userName : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    server : 'monkeymonkey.database.windows.net',
    options : {
        encrypt : true,
        database : 'MonkeyDB',
    },
};

const connect = (callback: (err: ConnectionError, connection: Connection) => any) => {
    const connection = new Connection(config);
    connection.on('connect', (err) => {
        callback(err, connection);
    });
};

export default connect;
