import { Router } from "express";
import { HybridZoneManager } from "./classes/HybridZoneManager";

export const router = Router();

router.post("/addZone", (req, res) => {
    let { date, zone } = req.body;
    if (!(date && zone)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    HybridZoneManager.add(new Date(date), zone).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        return res.status(500).send({ error });
    });
});

router.post("/addStudent", (req, res) => {
    let { date, zone, studentID } = req.body;
    if (!(date && zone && studentID)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    HybridZoneManager.addStudent(new Date(date), zone, parseInt(studentID)).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        return res.status(500).send({ error });
    });
});

router.post("/removeStudent", (req,res) => {
    let { date, zone, studentID } = req.body;
    if (!(date && zone && studentID)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    HybridZoneManager.removeStudent(new Date(date), zone, parseInt(studentID)).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        return res.status(500).send({ error });
    });
});

router.post("/checkout", (req,res) => {
    let { date, zone, studentID } = req.body;
    if (!(date && zone && studentID)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    HybridZoneManager.checkOut(new Date(date), zone, parseInt(studentID)).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        return res.status(500).send({ error });
    });
});
