import { Connection, Request, ConnectionError } from "tedious";

let config = {
    userName : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    server : 'monkeymonkey.database.windows.net',
    options : {
        encrypt : true,
        database :'MonkeyDB'
    },
};

let connect = function(callback:(err:ConnectionError,connection:Connection)=>any){
    let connection = new Connection(config);
    connection.on('connect',(err)=>{
        callback(err,connection);
    })
}

export {connect};