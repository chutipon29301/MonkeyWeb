import { Request } from 'tedious';
import connect from './SQLconnection';
import user from './v1/user';
const model = {
    ...user,
    query: (q: string) => {
        connect((err, connection) => {
            const request = new Request(q, (err, rowCount) => {
                if (err) { throw err; }
            });
            request.on('row', (col) => {
                console.log(col.map((e: any) => e.value));
            });
            connection.execSql(request);
        });
    },
};

export default model;
