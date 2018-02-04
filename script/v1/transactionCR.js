let allField = {_id : "ObjectID", studentID : "number", courseID:"string", timestamp : "Date",  value : "number", sender : "number", reason : "string", remark : "string"}
var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db, post){
    let transactionCR = db.collection('transactionCR')
    /**
     * each obj has these parameter
     * {
     *  _id : string
     *  courseName : string
     *  studentID : int (studentID with a subject number at the last index -> total 6 letters)
     *  timestamp : Date
     *  courseID : string
     *  value : int (positive to deposit and negative to withdraw)
     *  sender : int (id ; for admin com will set as Ten's id)
     *  reason : string
     *  remark : string
     * }
     * 
     */

    /**
     * req.body = {
     *  studentID : int
     *  hybridID : string
     *  value : int(negative)
     *  subject : string
     * }
     */
    post('/post/v1/checkoutCR',async function(req,res){
        if(!(req.body.studentID && req.body.value)) {
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        let studentID = parseInt(req.body.studentID)
        let value = parseInt(req.body.value)
        try{
            await transactionCR.insertOne({
                studentID : studentID,
                timestamp : new Date(),
                subject : req.body.subject[0].toUpperCase(),
                value : value,
                sender : studentID,
                reason : "CheckoutCR",
                remark : "",
                hybridID : req.body.hybridID
            })
            return res.status(200).send({msg:"ok"})
        }catch(e){
            return res.status(500).send({err:e})
        }
    })

    /**
     * add new transaction
     * parameter is all key in transaction object
     * req.body = {
     *  studentID : int
     *  timestamp : int (not necessary ; default is current date)
     *  value : int (positive to deposit and negative to withdraw)
     *  courseID : string
     *  sender : int 
     *  reason : string
     *  remark : string (not necessary)
     * }
     */
    post('/post/v1/addTransactionCR',async function(req,res){
        if(!(req.body.studentID&&req.body.value&&req.body.sender&&req.body.reason&&req.body.courseID)){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        try{
            let insObj = {
                studentID : parseInt(req.body.studentID),
                timestamp : req.body.timestamp?new Date(parseInt(req.body.timestamp)):new Date(),
                value : parseInt(req.body.value),
                subject : req.body.courseID,
                sender : parseInt(req.body.sender),
                reason : req.body.reason,
                remark : req.body.remark?req.body.remark:""
            }
            // console.log(insObj)
            await transactionCR.insertOne(insObj)
            return res.status(200).send({msg:"ok"})
        }catch(e){
            // console.log(e)
            return res.status(500).send({err:e})
        }
    })

    /**
     * get all transaction of request id
     * req.body = {
     *  studentID : int,
     *  courseID : string,
     *  startDate : int (not necessary),
     *  endDate : int (not necessary)
     * }
     */
    post('/post/v1/getTransactionCR',async function(req,res){
        if(!req.body.studentID ||!req.body.courseID){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        let findObj = {studentID : parseInt(req.body.studentID) , courseID : req.body.courseID}
        let time = {}
        if(req.body.startDate) time.$gte = new Date(parseInt(req.body.startDate));
        if(req.body.endDate) time.$lte = new Date(parseInt(req.body.endDate));
        if(time.$gte || time.$lte) findObj.timestamp = time;
        try{
            let arr = await transactionCR.find(findObj).sort({timestamp:1}).toArray()
            return res.status(200).send( arr )
        }catch(e){
            return res.status(500).send({err:e})
        }
    })

    /**
     * return sum of transaction value and last update
     * req.body = {
     *  studentID : int 
     *  subject : string
     * } -> return an object
     * 
     * req.body = {
     *  studentArr : [{
     *      studentID:int
     *      subject:string
     *  }]
     * } -> return arr
     * 
     * if studentID is int -> return an object
     * if studentArr -> return an array of objects
     * if no studentID -> return an array of all objects
     */
    post('/post/v1/getTotalTransactionCR',async function(req,res){
        if(req.body.studentID && req.body.courseID){
            try {
                let total = await transactionCR.aggregate([
                    {$match : {studentID : parseInt(req.body.studentID) , courseID : req.body.courseID}},
                    {$group : { _id : {studentID:"$studentID",courseID:"$courseID"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                    {$project : {_id:0 , studentID:"$_id.studentID" , courseID:"$_id.courseID" , total:"$total" , lastUpdate:"$lastUpdate"}},
                ]).toArray()
                if(total.length == 0) return res.status(200).send({studentID:Number(req.body.studentID.slice(0,5)),courseID:courseID,total:0,lastUpdate: new Date(0)})
                else return res.status(200).send(total[0])
            } catch (error) {
                console.log(error)
                return res.status(500).send({err : error})
            }
        }else if(req.body.studentID){
            try {
                let total = await transactionCR.aggregate([
                    {$match : {studentID : parseInt(req.body.studentID)}},
                    {$group : { _id : {studentID:"$studentID",courseID:"$courseID"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                    {$project : {_id:0 , studentID:"$_id.studentID" , courseID:"$_id.courseID" , total:"$total" , lastUpdate:"$lastUpdate"}},
                ]).toArray()
                if(total.length == 0) return res.status(200).send({studentID:Number(req.body.studentID.slice(0,5)),courseID:'',total:0,lastUpdate: new Date(0)})
                else return res.status(200).send(total[0])
            } catch (error) {
                console.log(error)
                return res.status(500).send({err : error})
            }
        }else if(req.body.studentArr){
            try {
                let total = []
                for(i in req.body.studentArr){
                    let match  = {studentID : parseInt(req.body.studentArr[i].studentID)}
                    if(req.body.studentArr[i].courseID) match.courseID = req.body.studentArr[i].courseID
                    let temp = (await transactionCR.aggregate([
                        {$match : match},
                        {$group : { _id : {studentID:"$studentID",courseID:"$courseID"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                        {$project : { _id:0 , studentID:"$_id.studentID" , subject:"$_id.courseID" , total:"$total" , lastUpdate:"$lastUpdate"}}
                    ]).toArray())[0]
                    if(!temp)total.push({studentID:Number(req.body.studentID.slice(0,5)),subject:req.body.subject[0].toUpperCase(),total:0,lastUpdate: new Date(0)})
                    else total.push(temp)
                }
                return res.status(200).send(total)
            } catch (error) {
                return res.status(500).send({err : error})
            }
        }else if(!(req.body.studentID&&req.body.subject&&req.body.studentArr)){
            try {
                let total = await transactionCR.aggregate([
                    {$group : { _id : {studentID:"$studentID",courseID:"$courseID"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                    {$project : {_id:0 , studentID:"$_id.studentID" , courseID:"$_id.courseID" , total:"$total" , lastUpdate:"$lastUpdate"}}
                ]).toArray()
                return res.status(200).send(total)
            } catch (error) {
                return res.status(500).send({err : error})
            }
        }else{
            return res.status(400).send({err:400 , msg : "bad request"})
        }
    })

    /**
     * req.body = {
     *  _id : string
     * }
     * 
     */
    post('/post/v1/editTransactionCR',async function(req,res){
        if(!(req.body._id && checkBody(req.body))){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        try {
            let id = ObjectID(req.body._id)
            delete req.body._id
            for(i in req.body) req.body[i] = parseTransactionCR(i,req.body[i]);
            await transactionCR.updateOne({_id : id},{$set : req.body})
            return res.status(200).send({msg : "ok"})
        } catch (error) {
            return res.status(500).send({msg : error})
        }
    })

    /**
     *  req.body = {
     *  _id : string
     * }
     * 
     */
    post('/post/v1/deleteTransactionCR',async function(req,res){
        if(!req.body._id){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        try {
            await transactionCR.remove({_id : ObjectID(req.body._id)})
            return res.status(200).send({msg:"ok"})
        } catch (error) {
            return res.status(500).send({msg:error})
        }
    })
}
function checkBody(bd){
    for(i in bd) if(!allField[i]) return false;
    return true;
}
function parseTransactionCR(key,value){
    if(allField[key] == "number") return Number(value);
    if(allField[key] == "Date") return new Date(value);
    if(allField[key] == "ObjectID") return ObjectID(value);
    return value;
}