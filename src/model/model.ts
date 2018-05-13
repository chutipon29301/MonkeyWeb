import { Connection, Request, ConnectionError } from "tedious";
import connect from "./SQLconnection";
import user from './v1/user';
import { assignmentExpression } from "babel-types";

let model = {
    ...user,
    query:function(q:string){
        connect((err,connection)=>{
            let request = new Request(q,(err,rowCount)=>{
                if(err) throw err;
            });
            request.on('row',(col)=>{
                console.log(col.map((e:any)=>e.value))
            })
            connection.execSql(request);
        });
    }
}

export default model;