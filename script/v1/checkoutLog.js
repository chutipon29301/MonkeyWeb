module.exports = function(app,db,post){
    let checkoutLog = db.collection('checkoutLog')
    let userDB = db.collection('user')
    let hybridStudent = db.collection('hybridStudent')
    let courseDB = db.collection('course')
    let configDB = db.collection('config')
    let attendanceDB = db.collection('attendance')
    /**@param req.body
     *  checkoutDate : Date
     *  studentID : int
     *  subject : string
     *  recheck : bool
     *  recheckDate : Date
     */
    post('/post/v1/addCheckoutLog',async function(req,res){
        if(!(req.body.studentID&&req.body.subject)){
            res.status(400).send({err:400 , msg:'bad request'})
        }
        try {
            let studentID = req.body.studentID
            let subject = req.body.subject
            let obj = {
                studentID : studentID,
                subject : subject,
                checkoutDate : req.body.checkoutDate?new Date(req.body.checkoutDate) : new Date(),
                recheck : (req.body.recheck+'') == 'true'
            }
            if(req.body.recheckDate) obj.recheckDate = new Date(req.body.obj.recheckDate)
            await checkoutLog.insertOne(obj)
            res.status(200).send({msg:'ok'})    
        } catch (error) {
            res.status(500).send({err:500,msg:'insert failed'})
        }
    })

    post('/post/v1/recheck',async function(req,res){
        if(!(req.body.studentID&&req.body.subject)){
            res.status(400).send({err:400 , msg:'bad request'})
        }
        try {
            let studentID = req.body.studentID
            let subject = req.body.subject
            let recheckDate = new Date()
            let log = await checkoutLog.find().sort({timestamp:-1}).limit(1).toArray()[0]
            if(log){
                await checkoutLog.updateOne(log,{$set:{recheck:true , recheckDate:recheckDate}})
                res.status(200).send({msg:'ok'})
            }
            else res.status(200).send({msg:'ไม่พบประวัติการ Checkout'})
        } catch (error) {
            res.status(500).send({err:500,msg:'recheck failed'})
        }
    })

    /**
     * @param date
     * 
     * res {
     *  arr:[[{
     *          studentID:int,
     *          subject:string,
     *          type:string (cr,fhb),
     *          
     *     }]]
     * }
     */
    post('/post/v1/getCheckout',async function(req,res){
        let start = req.body.date?new Date(req.body.date):new Date()
        let end = req.body.date?new Date(req.body.date):new Date()
        start.setHours(0,0,0,0)
        end.setHours(23,59,59,999)
        let config = await configDB.findOne({})
        let year = Number(config.defaultQuarter.quarter.year)
        let quarter = Number(config.defaultQuarter.quarter.quarter)
        let quarterID = config.defaultQuarter.quarter.year+"0"+config.defaultQuarter.quarter.quarter
        let [fhb , course , checkout , attendance] = await Promise.all([
            hybridStudent.find({quarterID:quarterID}).toArray(),
            courseDB.find({year:year , quarter:quarter , tutor:99000}).toArray(),
            checkoutLog.find({checkoutDate:{$gte:start , $lt:end}}).toArray(),
            attendanceDB.find({date:{$lt:end.getTime() , $gte:start.getTime()}}).toArray()
        ])
        console.log(attendance)
        console.log(start.toString())
        console.log(end.toString())
        // for(let i in fhb){
        //     fhb[i].day = new Date(fhb[i].day)
        //     if(fhb[i].day.getDay() == start.getDay()){

        //     }
        // }
        
        res.status(200).send(fhb)
    })
}