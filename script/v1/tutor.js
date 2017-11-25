module.exports = function (app, db, post) {
    var ObjectID = require('mongodb').ObjectID;
    var tutorCheckHistoryDB = db.collection('tutorCheckHistory');
    var tutorCheckPendingDB = db.collection('tutorCheckPending');
    var tutorCheckIntervalDB = db.collection('tutorCheckInterval');
    var userDB = db.collection('user');
    var schedule = require('node-schedule');

    var timeRangeStart = [8, 10, 13, 15, 17, 19];
    var timeRangeEnd = [8, 10, 12, 15, 17, 19];
    var description = [{
        name: '-',
        point: 0
    }, {
        name: 'Hybrid',
        point: 2
    }, {
        name: 'Admin',
        point: 1.5
    }, {
        name: 'Sheet',
        point: 1
    }, {
        name: 'Com',
        point: 2
    }, {
        name: 'Reading',
        point: 0
    }, {
        name: 'Course',
        point: 0
    }];

    /**
     * Function to clear pending check in which will be execute at midnight
     */
    var clearTutorCheckPendingOnMidNight = schedule.scheduleJob('0 0 * * *', function () {
        console.log('[TUTOR] Check pending watcher execute');
        tutorCheckPendingDB.find({}).toArray().then(pendingList => {
            for (let i = 0; i < pendingList.length; i++) {
                tutorCheckHistoryDB.insertOne({
                    tutorID: pendingList[i]._id,
                    checkIn: pendingList[i].checkIn,
                    checkOut: new Date(),
                    detail: [-1, -1, -1, -1, -1, -1]
                });
                tutorCheckPendingDB.remove({
                    _id: pendingList[i]._id
                });
                console.log('[TUTOR] User ' + pendingList[i]._id + 'was removed from pending list');
            }
        });
    });

    /**
     * Method for checking request ip address if the request send from local network
     * @param {request} req request information containing ip address
     */
    function isLocal(req) {
        var index = req.ip.match(/\d/);
        var ipAddress = req.ip.substring(index.index, req.ip.length);
        if (ipAddress.substring(0, 7) === '192.168' || ipAddress === '125.25.54.23') {
            return false;
        }
        return true;
    }

    /**
     * Method for tutor to check in
     * req.body = {
     *      tutorID: 99000
     * }
     * 
     * status 401:
     *  If not request in local network
     * res.body = {
     *      err: 0,
     *      msg: 'Unauthorize network'
     * }
     * 
     * status 200:
     *  If check in successfully execute
     * res.body = {
     *      msg: 'OK',
     *      timestamp: new Date()
     * }
     * 
     * status 201:
     *  If already check in
     * res.body = {
     *      msg: 'OK',
     *      timestamp: new Date()
     * }
     */
    post('/post/v1/tutorCheckIn', function (req, res) {
        if (!req.body.tutorID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (isLocal(req)) {
            return res.status(401).send({
                err: 0,
                msg: 'Unauthorize network'
            });
        }
        var checkInDate = new Date();
        tutorCheckPendingDB.insertOne({
            _id: parseInt(req.body.tutorID),
            checkIn: checkInDate
        }, function (err, result) {
            if (err) {
                return res.status(202).send({
                    err: err
                });
            }
            res.status(201).send({
                msg: 'OK',
                timestamp: checkInDate
            });
        });
    });

    /**
     * Method for get pending check in of specific tutor
     * req.body = {
     *      tutorID: 99000
     * }
     * 
     * status 401:
     *  If not request in local network
     * res.body = {
     *      err: 0,
     *      msg: 'Unauthorize network'
     * }
     * 
     * status 404:
     *  If not request in local network
     * res.body = {
     *      err: 404,
     *      msg: 'Not Found'
     * }
     * 
     * status 200:
     *   If check in history found
     * res.body = {
     *      checkIn: 2017-11-11T03:41:36.261Z
     * }
     */
    post('/post/v1/getPendingTutorCheckIn', function (req, res) {
        if (!req.body.tutorID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (isLocal(req)) {
            return res.status(401).send({
                err: 0,
                msg: 'Unauthorize network'
            });
        }

        tutorCheckPendingDB.findOne({
            _id: parseInt(req.body.tutorID)
        }).then(data => {
            if (!data) {
                return res.status(404).send({
                    err: 404,
                    msg: 'Not Found'
                });
            }
            delete data._id;
            res.status(200).send(data);
        });
    });

    /**
     * Method for get all pending check in of tutor
     * req.body = {
     * }
     * 
     * status 401:
     *  If not request in local network
     * res.body = {
     *      err: 0,
     *      msg: 'Unauthorize network'
     * }
     * 
     * status 404:
     *  If not request in local network
     * res.body = {
     *      err: 404,
     *      msg: 'Not Found'
     * }
     * 
     * status 200:
     * res.body = [
     *      tutorID: 99000
     *      checkIn: 2017-11-11T03:41:36.261Z
     * ]
     */
    post('/post/v1/listPendingTutorCheckIn', function (req, res) {
        tutorCheckPendingDB.find({}).toArray().then(result => {
            for (let i = 0; i < result.length; i++) {
                result[i].tutorID = result[i]._id;
                delete result[i]._id
            }
            res.status(200).send(result);
        });
    });

    /**
     * Method for tutor to check in
     * req.body = {
     *      tutorID: 99000,
     *      slot0: 0,
     *      slot1: 0,
     *      slot2: 0,
     *      slot3: 0,
     *      slot4: 0,
     *      slot5: 0
     * }
     * 
     * status 401:
     *  If not request in local network
     * res.body = {
     *      err: 0,
     *      msg: 'Unauthorize network'
     * }
     * 
     * status 404:
     *   If no check in history found
     * res.body = {
     *      err: 404,
     *      msg: 'No check in history found'
     * }
     * 
     * status 200:
     * res.body = {
     *      msg: 'OK'
     * }
     */
    post('/post/v1/tutorCheckOut', function (req, res) {
        if (!req.body.tutorID || !req.body.slot0 || !req.body.slot1 || !req.body.slot2 || !req.body.slot3 || !req.body.slot4 || !req.body.slot5) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (isLocal(req)) {
            return res.status(401).send({
                err: 0,
                msg: 'Unauthorize network'
            });
        }

        var slot = [parseInt(req.body.slot0),
            parseInt(req.body.slot1),
            parseInt(req.body.slot2),
            parseInt(req.body.slot3),
            parseInt(req.body.slot4),
            parseInt(req.body.slot5)
        ];

        tutorCheckPendingDB.findOne({
            _id: parseInt(req.body.tutorID)
        }).then(data => {
            if (data == null) {
                return res.status(404).send({
                    err: 404,
                    msg: 'No check in history found'
                });
            }
            tutorCheckHistoryDB.insertOne({
                tutorID: data._id,
                checkIn: data.checkIn,
                checkOut: new Date(),
                detail: slot
            }, function (err, result) {
                if (err) {
                    return res.status(202).send(err);
                }
                res.status(200).send({
                    msg: 'OK'
                });
            });
            tutorCheckPendingDB.remove({
                _id: parseInt(req.body.tutorID)
            })
        });
    });

    /**
     * Method for edit checkout history
     * 
     * req.body = {
     *      historyID: 3j9w8tghq4n394tfunvt49h,
     *      checkIn: 37413400000,
     *      checkOut: 32642340000,
     *      slot: [
     *          1,2,1,4,2,3
     *      ]
     * }
     * 
     * res.body = 'OK'
     */
    post('/post/v1/editCheckOutHistory', function (req, res) {
        if (!(req.body.historyID && (req.body.checkIn || req.body.checkOut || req.body.slot))) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var newValue = {
            $set: {}
        };

        if (req.body.checkIn) {
            newValue.$set.checkIn = new Date(parseInt(req.body.checkIn));
        }
        if (req.body.checkOut) {
            newValue.$set.checkOut = new Date(parseInt(req.body.checkOut));
        }
        if (req.body.slot) {
            newValue.$set.detail = slot;
        }

        tutorCheckHistoryDB.updateOne({
            _id: ObjectID(req.body.historyID)
        }, newValue, (err, db) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(200).send('OK');
        });
    });

    /**
     * Method for delete checkout history
     * 
     * req.body = {
     *      historyID: 3j9w8tghq4n394tfunvt49h
     * }
     * 
     * res.body = 'OK'
     */
    post('/post/v1/deleteCheckOutHistory', function (req, res) {
        if (!req.body.historyID) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }

        tutorCheckHistoryDB.deleteOne({
            _id: ObjectID(req.body.historyID)
        }, (err, result) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(200).send('OK');
        });
    });

    /**
     * Method for add checkout history
     * 
     * req.body = {
     *      tutorID: 99000,
     *      checkIn: 37413400000,
     *      checkOut: 32642340000,
     *      slot: [
     *          1,2,1,4,2,3
     *      ]
     * }
     * 
     * res.body = 'OK'
     */
    post('/post/v1/addCheckOutHistory', function (req, res) {
        if (!(req.body.tutorID && req.body.checkIn && req.body.checkOut && req.body.slot)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        tutorCheckHistoryDB.insertOne({
            tutorID: parseInt(req.body.tutorID),
            checkIn: new Date(parseInt(req.body.checkIn)),
            checkOut: new Date(parseInt(req.body.checkOut)),
            detail: req.body.slot
        }, (err, db) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(200).send('OK');
        });
    });

    /**
     * Method for listing check in history
     * 
     * case 1:
     *  List by person
     * req.body = {
     *      tutorID: 99000,
     *      startDate: 13020100000,
     *      endDate: 142003000000,
     * }
     * 
     * res.body = {
     *      detail: [
     *          {
     *              checkIn: 1510976682728,
     *              checkOut: 1510986065378,
     *              detail: [
     *                  '-', 'Admin', 'Com', '-', '-', '-'
     *              ],
     *              historyID: 5a0fd1516885947e13a34d72
     *              sum: 3.4234235143
     *          },
     *          ...
     *      ],
     *      totalSum: 231.425452343
     * }
     * 
     * case 2:
     *  List persent person in day
     * req.body = {
     *      date: 13743000000
     * }
     * 
     * res.body = [
     *      {
     *          checkIn: 1510976682728,
     *          checkOut: 1510986065378,
     *          detail: [
     *              '-', 'Admin', 'Com', '-', '-', '-'
     *          ],
     *          historyID: 5a0fd1516885947e13a34d72
     *          sum: 3.4234235143
     *      },
     *      ...
     *  ]
     */
    post('/post/v1/listCheckInHistory', function (req, res) {
        if (!((req.body.tutorID && req.body.startDate && req.body.endDate) || (req.body.date))) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        if (req.body.tutorID && req.body.startDate && req.body.endDate) {
            tutorCheckHistoryDB.find({
                tutorID: parseInt(req.body.tutorID),
                checkIn: {
                    $gte: new Date(parseInt(req.body.startDate)),
                    $lte: new Date(parseInt(req.body.endDate))
                }
            }, {
                sort: {
                    checkIn: -1
                }
            }).toArray().then(result => {
                result.reverse();
                var totalSum = 0;
                var response = {};
                response.summary = [0, 0, 0, 0, 0, 0, 0];
                response.hour = [0, 0, 0, 0, 0, 0, 0];
                for (let i = 0; i < result.length; i++) {
                    result[i].historyID = result[i]._id;
                    result[i].checkIn = new Date(result[i].checkIn).valueOf();
                    result[i].checkOut = new Date(result[i].checkOut).valueOf();
                    var startIndex = -1,
                        endIndex = -1;
                    for (let j = 0; j < result[i].detail.length; j++) {
                        if (startIndex == -1 && result[i].detail[j] != -1) startIndex = j;
                        if (endIndex == -1 && result[i].detail[result[i].detail.length - j - 1] != -1) endIndex = result[i].detail.length - j - 1;
                    }
                    var sum = 0;
                    for (let j = 0; j < result[i].detail.length; j++) {
                        if (j === startIndex && j === endIndex) {
                            var date1 = new Date(result[i].checkIn);
                            var date2 = new Date(result[i].checkOut);
                            if (date1.getHours() < 8) {
                                date1.setHours(8);
                                date1.setMinutes(0);
                                date1.setSeconds(0);
                                date1.setMilliseconds(0);
                            }
                            if (date1.getHours() < 13 && date1.getHours() > 12) {
                                date1.setHours(13);
                                date1.setMinutes(0);
                                date1.setSeconds(0);
                                date1.setMilliseconds(0);
                            }
                            if (date2.getHours() < 13 && date2.getHours() > 12) {
                                date2.setHours(12);
                                date2.setMinutes(0);
                                date2.setSeconds(0);
                                date2.setMilliseconds(0);
                            }
                            if (date2.getHours() > 19) {
                                date2.setHours(19);
                                date2.setMinutes(0);
                                date2.setSeconds(0);
                                date2.setMilliseconds(0);
                            }
                            var diff = date2 - date1;
                            response.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point * (diff / 7200000);
                            response.hour[result[i].detail[j] + 1] += diff;
                            sum += description[result[i].detail[j] + 1].point * (diff / 7200000);
                        } else if (j === startIndex) {
                            var date1 = new Date(result[i].checkIn);
                            var date2 = new Date(result[i].checkIn);
                            if (date1.getHours() < 8) {
                                date1.setHours(8);
                                date1.setMinutes(0);
                                date1.setSeconds(0);
                                date1.setMilliseconds(0);
                            }
                            if (date1.getHours() < 13 && date1.getHours() > 12) {
                                date1.setHours(13);
                                date1.setMinutes(0);
                                date1.setSeconds(0);
                                date1.setMilliseconds(0);
                            }
                            date2.setHours(timeRangeEnd[startIndex + 1]);
                            date2.setMinutes(0);
                            date2.setSeconds(0);
                            date2.setMilliseconds(0);
                            var diff = date2 - date1;
                            response.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point * (diff / 7200000);
                            response.hour[result[i].detail[j] + 1] += diff;
                            sum += description[result[i].detail[j] + 1].point * (diff / 7200000);
                        } else if (j === endIndex) {
                            var date1 = new Date(result[i].checkOut);
                            var date2 = new Date(result[i].checkOut);
                            if (date2.getHours() > 19) {
                                date2.setHours(19);
                                date2.setMinutes(0);
                                date2.setSeconds(0);
                                date2.setMilliseconds(0);
                            }
                            if (date2.getHours() < 13 && date2.getHours() > 12) {
                                date2.setHours(12);
                                date2.setMinutes(0);
                                date2.setSeconds(0);
                                date2.setMilliseconds(0);
                            }
                            date1.setHours(timeRangeStart[endIndex]);
                            date1.setMinutes(0);
                            date1.setSeconds(0);
                            date1.setMilliseconds(0);
                            var diff = date2 - date1;
                            response.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point * (diff / 7200000);
                            response.hour[result[i].detail[j] + 1] += diff;
                            sum += description[result[i].detail[j] + 1].point * (diff / 7200000);
                        } else {
                            response.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point;
                            sum += description[result[i].detail[j] + 1].point;
                        }
                        result[i].detail[j] = description[result[i].detail[j] + 1].name;
                    }
                    result[i].sum = sum;
                    totalSum += sum
                    delete result[i].tutorID;
                    delete result[i]._id;
                }
                response.detail = result;
                response.totalSum = totalSum
                return res.status(200).send(response);
            });
        } else if (req.body.date) {
            var requestDate = new Date(parseInt(req.body.date));
            var startQueryDate = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
            var endQueryDate = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate() + 1);
            var querySlot = 'detail.' + timeRangeStart.indexOf(requestDate.getHours());
            var queryObject = {
                checkIn: {
                    $gte: startQueryDate,
                    $lt: endQueryDate
                }
            }
            queryObject[querySlot] = {
                $ne: -1
            };
            tutorCheckHistoryDB.find(queryObject, {
                sort: {
                    checkIn: -1
                }
            }).toArray().then(result => {
                result.reverse();
                for (let i = 0; i < result.length; i++) {
                    result[i].historyID = result[i]._id;
                    result[i].checkIn = new Date(result[i].checkIn).valueOf();
                    result[i].checkOut = new Date(result[i].checkOut).valueOf();
                    for (let j = 0; j < result[i].detail.length; j++) {
                        result[i].detail[j] = description[result[i].detail[j] + 1].name;
                    }
                    delete result[i]._id;
                }
                return res.status(200).send(result);
            });
        }
    });

    post('/post/v1/listAllCheckInHistory', function (req, res) {
        if (!(req.body.startDate && req.body.endDate)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        tutorCheckHistoryDB.find({
            checkIn: {
                $gte: new Date(parseInt(req.body.startDate)),
                $lte: new Date(parseInt(req.body.endDate))
            }
        }, {
            sort: {
                checkIn: -1
            }
        }).toArray().then(result => {
            result.reverse();
            var totalSum = 0;
            var response = {};
            for (let i = 0; i < result.length; i++) {
                if (response[result[i].tutorID] === undefined) {
                    response[result[i].tutorID] = {};
                    response[result[i].tutorID].detail = {};
                    response[result[i].tutorID].detail.summary = [0, 0, 0, 0, 0, 0, 0];
                    response[result[i].tutorID].detail.hour = [0, 0, 0, 0, 0, 0, 0];
                }
                result[i].historyID = result[i]._id;
                result[i].checkIn = new Date(result[i].checkIn).valueOf();
                result[i].checkOut = new Date(result[i].checkOut).valueOf();
                var startIndex = -1,
                    endIndex = -1;
                for (let j = 0; j < result[i].detail.length; j++) {
                    if (startIndex == -1 && result[i].detail[j] != -1) startIndex = j;
                    if (endIndex == -1 && result[i].detail[result[i].detail.length - j - 1] != -1) endIndex = result[i].detail.length - j - 1;
                }
                var sum = 0;
                for (let j = 0; j < result[i].detail.length; j++) {
                    if (j === startIndex && j === endIndex) {
                        var date1 = new Date(result[i].checkIn);
                        var date2 = new Date(result[i].checkOut);
                        if (date1.getHours() < 8) {
                            date1.setHours(8);
                            date1.setMinutes(0);
                            date1.setSeconds(0);
                            date1.setMilliseconds(0);
                        }
                        if (date1.getHours() < 13 && date1.getHours() > 12) {
                            date1.setHours(13);
                            date1.setMinutes(0);
                            date1.setSeconds(0);
                            date1.setMilliseconds(0);
                        }
                        if (date2.getHours() < 13 && date2.getHours() > 12) {
                            date2.setHours(13);
                            date2.setMinutes(0);
                            date2.setSeconds(0);
                            date2.setMilliseconds(0);
                        }
                        if (date2.getHours() > 19) {
                            date2.setHours(19);
                            date2.setMinutes(0);
                            date2.setSeconds(0);
                            date2.setMilliseconds(0);
                        }
                        var diff = date2 - date1;
                        response[result[i].tutorID].detail.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point * (diff / 7200000);
                        response[result[i].tutorID].detail.hour[result[i].detail[j] + 1] += diff;
                        sum += description[result[i].detail[j] + 1].point * (diff / 7200000);
                    } else if (j === startIndex) {
                        var date1 = new Date(result[i].checkIn);
                        var date2 = new Date(result[i].checkIn);
                        if (date1.getHours() < 8) {
                            date1.setHours(8);
                            date1.setMinutes(0);
                            date1.setSeconds(0);
                            date1.setMilliseconds(0);
                        }
                        if (date1.getHours() < 13 && date1.getHours() > 12) {
                            date1.setHours(13);
                            date1.setMinutes(0);
                            date1.setSeconds(0);
                            date1.setMilliseconds(0);
                        }
                        date2.setHours(timeRangeEnd[startIndex + 1]);
                        date2.setMinutes(0);
                        date2.setSeconds(0);
                        date2.setMilliseconds(0);
                        var diff = date2 - date1;
                        response[result[i].tutorID].detail.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point * (diff / 7200000);
                        response[result[i].tutorID].detail.hour[result[i].detail[j] + 1] += diff;
                        sum += description[result[i].detail[j] + 1].point * (diff / 7200000);
                    } else if (j === endIndex) {
                        var date1 = new Date(result[i].checkOut);
                        var date2 = new Date(result[i].checkOut);
                        if (date2.getHours() > 19) {
                            date2.setHours(19);
                            date2.setMinutes(0);
                            date2.setSeconds(0);
                            date2.setMilliseconds(0);
                        }
                        if (date2.getHours() < 13 && date2.getHours() > 12) {
                            date2.setHours(12);
                            date2.setMinutes(0);
                            date2.setSeconds(0);
                            date2.setMilliseconds(0);
                        }
                        date1.setHours(timeRangeStart[endIndex]);
                        date1.setMinutes(0);
                        date1.setSeconds(0);
                        date1.setMilliseconds(0);
                        var diff = date2 - date1;
                        response[result[i].tutorID].detail.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point * (diff / 7200000);
                        response[result[i].tutorID].detail.hour[result[i].detail[j] + 1] += diff;
                        sum += description[result[i].detail[j] + 1].point * (diff / 7200000);
                    } else {
                        response[result[i].tutorID].detail.summary[result[i].detail[j] + 1] += description[result[i].detail[j] + 1].point;
                        sum += description[result[i].detail[j] + 1].point;
                    }
                    result[i].detail[j] = description[result[i].detail[j] + 1].name;
                }
                result[i].sum = sum;
                totalSum += sum
                response[result[i].tutorID].detail.body = result;
                response[result[i].tutorID].detail.totalSum = totalSum
                delete result[i].tutorID;
                delete result[i]._id;
            }
            return res.status(200).send(response);
        });
    });

    /**
     * Method for create interval to save range of time
     * 
     * req.body = {
     *      startDate: 1434000000,
     *      endDate: 41300040000,
     * }
     * 
     * res.body = 'OK'
     */
    post('/post/v1/addCheckInterval', function (req, res) {
        if (!(req.body.startDate && req.body.endDate)) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        tutorCheckIntervalDB.insertOne({
            startDate: new Date(parseInt(req.body.startDate)),
            endDate: new Date(parseInt(req.body.endDate))
        }, result => {
            res.status(200).send('OK');
        });
    });

    /**
     * Method for list all interval
     * 
     * req.body = {
     * }
     * 
     * res.body = {
     *      [
     *          intervalID: n7934ygh329uhf32f32fefewf,
     *          startDate: 423450000000,
     *          endDate: 524535000000
     *      ], ...
     * }
     */
    post('/post/v1/listInterval', function (req, res) {
        tutorCheckIntervalDB.find({}, {
            sort: {
                startDate: -1
            }
        }).toArray().then(result => {
            for (let i = 0; i < result.length; i++) {
                result[i].intervalID = result[i]._id;
                result[i].startDate = new Date(result[i].startDate).valueOf()
                result[i].endDate = new Date(result[i].endDate).valueOf()
                delete result[i]._id;
            }
            res.status(200).send(result);
        });
    });

    /**
     * Method for edit interval object
     * req.body = {
     *      intervalID: ma3894thgna3u4pg4t3,
     *      startDate: 45324300000,
     *      endDate: 235724200000
     * }
     * 
     * res.body = 'OK'
     */
    post('/post/v1/editInterval', function (req, res) {
        if (!(req.body.intervalID && (req.body.startDate || req.body.endDate))) {
            return res.status(400).send({
                err: -1,
                msg: 'Bad Request'
            });
        }
        var newValue = {
            $set: {}
        };
        if (req.body.startDate) {
            newValue.$set.startDate = new Date(parseInt(req.body.startDate));
        }
        if (req.body.endDate) {
            newValue.$set.endDate = new Date(parseInt(req.body.endDate));
        }
        tutorCheckIntervalDB.updateOne({
            _id: ObjectID(req.body.intervalID)
        }, newValue, (err, db) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(200).send('OK');
        });
    });
}