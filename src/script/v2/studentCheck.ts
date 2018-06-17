import { Router, Request } from "express";
import { StudentCheckManager } from "./classes/StudentCheckManager";

export const router = Router();

function isLocal(req: Request) {
    var index = req.ip.match(/\d/);
    var ipAddress = req.ip.substring(index.index, req.ip.length);
    if (ipAddress.substring(0, 7) === '192.168' || ipAddress === '125.25.54.23' || ipAddress === '1') {
        return false;
    }
    return true;
}

router.post('/checkin', (req, res) => {
    let { studentID } = req.body;
    if (!studentID) {
        return res.status(500).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    if (isLocal(req)) {
        return res.status(401).send({
            err: 0,
            msg: 'Unauthorize network'
        });
    }
    StudentCheckManager.getPendingCheckIn(parseInt(studentID)).subscribe(result => {
        if (!result.isExist()) {
            StudentCheckManager.add(parseInt(studentID)).subscribe(_ => {
                return res.status(200).send({
                    msg: "OK",
                    timestamp: new Date()
                });
            });
        } else {
            res.sendStatus(202);
        }
    })
});

router.post('/checkout', (req, res) => {
    let { studentID } = req.body;
    if (!studentID) {
        return res.status(500).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    if (isLocal(req)) {
        return res.status(401).send({
            err: 0,
            msg: 'Unauthorize network'
        });
    }
    StudentCheckManager.getPendingCheckIn(parseInt(studentID)).subscribe(result => {
        if (!result.isExist()) {
            return res.status(404).send({
                err: 404,
                msg: 'No check in history found'
            });
        } else {
            result.checkOut().subscribe(_ => {
                return res.status(200).send({
                    msg: "OK",
                    timestamp: new Date()
                });
            })
        }
    });
});