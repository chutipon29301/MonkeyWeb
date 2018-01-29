let allField = {_id : "ObjectID",subject : "string", studentID : "number", timestamp : "Date", hybridID : "string", value : "number", sender : "number", reason : "string", remark : "string"}
var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db, post){
    let transactionFHB = db.collection('transactionFHB')
    /**
     * each obj has these parameter
     * {
     *  _id : string
     *  subject : string (1 uppercase-letter)
     *  studentID : int (studentID with a subject number at the last index -> total 6 letters)
     *  timestamp : Date
     *  hybridID : string
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
    post('/post/v1/checkoutFHB',async function(req,res){
        if(!(req.body.studentID && req.body.value && req.body.subject && req.body.hybridID)) {
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        let studentID = parseInt(req.body.studentID)
        let value = parseInt(req.body.value)
        try{
            await transactionFHB.insertOne({
                studentID : studentID,
                timestamp : new Date(),
                subject : req.body.subject[0].toUpperCase(),
                value : value,
                sender : studentID,
                reason : "CheckoutFHB",
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
     *  subject : string
     *  sender : int 
     *  reason : string
     *  remark : string (not necessary)
     * }
     */
    post('/post/v1/addTransactionFHB',async function(req,res){
        if(!(req.body.studentID&&req.body.value&&req.body.sender&&req.body.reason&&req.body.subject)){
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
                subject : req.body.subject[0].toUpperCase(),
                sender : parseInt(req.body.sender),
                reason : req.body.reason,
                remark : req.body.remark?req.body.remark:""
            }
            // console.log(insObj)
            await transactionFHB.insertOne(insObj)
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
     *  subject : string,
     *  startDate : int (not necessary),
     *  endDate : int (not necessary)
     * }
     */
    post('/post/v1/getTransactionFHB',async function(req,res){
        if(!req.body.studentID ||!req.body.subject){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        let findObj = {studentID : parseInt(req.body.studentID) , subject : req.body.subject[0].toUpperCase()}
        let time = {}
        if(req.body.startDate) time.$gte = new Date(parseInt(req.body.startDate));
        if(req.body.endDate) time.$lte = new Date(parseInt(req.body.endDate));
        if(time.$gte || time.$lte) findObj.timestamp = time;
        try{
            let arr = await transactionFHB.find(findObj).toArray()
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
    post('/post/v1/getTotalTransactionFHB',async function(req,res){
        if(req.body.studentID && req.body.subject){
            try {
                let total = await transactionFHB.aggregate([
                    {$match : {studentID : parseInt(req.body.studentID) , subject : req.body.subject[0].toUpperCase()}},
                    {$group : { _id : {studentID:"$studentID",subject:"$subject"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                    {$project : {_id:0 , studentID:"$_id.studentID" , subject:"$_id.subject" , total:"$total" , lastUpdate:"$lastUpdate"}}
                ]).toArray()
                return res.status(200).send(total[0])
            } catch (error) {
                console.log(error)
                return res.status(500).send({err : error})
            }
        }else if(req.body.studentArr){
            try {
                let total = []
                for(i in req.body.studentArr){
                    total.push((await transactionFHB.aggregate([
                        {$match : {studentID : parseInt(req.body.studentArr[i].studentID) , subject : req.body.studentArr[i].subject[0].toUpperCase()} },
                        {$group : { _id : {studentID:"$studentID",subject:"$subject"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                        {$project : { _id:0 , studentID:"$_id.studentID" , subject:"$_id.subject" , total:"$total" , lastUpdate:"$lastUpdate"}}
                    ]).toArray())[0] )
                }
                return res.status(200).send(total)
            } catch (error) {
                return res.status(500).send({err : error})
            }
        }else if(!(req.body.studentID&&req.body.subject&&req.body.studentArr)){
            try {
                let total = await transactionFHB.aggregate([
                    {$group : { _id : {studentID:"$studentID",subject:"$subject"} , total : { $sum : "$value" } , lastUpdate : {$max : "$timestamp"} }},
                    {$project : {_id:0 , studentID:"$_id.studentID" , subject:"$_id.subject" , total:"$total" , lastUpdate:"$lastUpdate"}}
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
     * return an array of under2500
     * req.body is not necessary
     */
    post('/post/v1/getUnder2500',async function(req,res){
        try {
            let under2500 = await transactionFHB.aggregate([
                {$group : {_id:{studentID:"$studentID",subject:"$subject"} , total:{$sum:"$value"} , lastUpdate:{$max:"$timestamp"}}},
                {$match : {total:{$lte:2500}}},
                {$project : {studentID:"$_id.studentID",subject:"$_id.subject",total:"$total",lastUpdate:"$lastUpdate"}}
            ]).toArray()
            return res.status(200).send(under2500)
        } catch (error) {
            return res.status(500).send({err:error})
        }
    })

    /**
     * req.body = {
     *  _id : string
     * }
     * 
     */
    post('/post/v1/editTransactionFHB',async function(req,res){
        if(!(req.body._id && checkBody(req.body))){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        try {
            let id = ObjectID(req.body._id)
            delete req.body._id
            for(i in req.body) req.body[i] = parseTransactionFHB(i,req.body[i]);
            await transactionFHB.updateOne({_id : id},{$set : req.body})
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
    post('/post/v1/deleteTransactionFHB',async function(req,res){
        if(!req.body._id){
            return res.status(400).send({
                err: 400,
                msg: 'Bad Reqeust'
            });
        }
        try {
            await transactionFHB.remove({_id : ObjectID(req.body._id)})
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
function parseTransactionFHB(key,value){
    if(allField[key] == "number") return Number(value);
    if(allField[key] == "Date") return new Date(value);
    if(allField[key] == "ObjectID") return ObjectID(value);
    return value;
}