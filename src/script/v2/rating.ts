import { Router } from "express";
import { RatingManager } from "./classes/RatingManager";
import { Observable } from "rx";

export const router = Router();

router.post("/add", (req, res) => {
    let { type, studentID, score } = req.body;
    if (!(type && studentID && score)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request',
        });
    }
    RatingManager.add(score, studentID, type, req.user._id, req.body.courseID).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        return res.status(500).send(error);
    });
});

router.post("/addMany", (req, res) => {
    let { type, scores } = req.body;
    if (!(type && scores)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request',
        });
    }
    Observable.forkJoin((scores as Array<{ score: number, studentID: number }>).map(score => {
        return RatingManager.add(score.score, score.studentID, type, req.user._id, req.body.courseID);
    })).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        return res.status(500).send(error);
    });
});

router.post("/delete", (req, res) => {
    let { id } = req.body;
    if (!id) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    RatingManager.find(id).flatMap(rating => {
        return rating.delete();
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    }, error => {
        res.status(500).send(error);
    });
});

router.post("/list", (req, res) => {
    let { studentID } = req.body;
    if (!studentID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    RatingManager.list(parseInt(studentID)).subscribe(rating => {
        return res.status(200).send({ rating });
    }, error => {
        return res.status(500).send({ error });
    });
});

router.post("/listDetail", (req, res) => {
    let { studentID } = req.body.studentID;
    if (!studentID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    RatingManager.listDetail(parseInt(studentID)).subscribe(rating => {
        return res.status(200).send({ rating });
    }, error => {
        return res.status(500).send({ error });
    });
});