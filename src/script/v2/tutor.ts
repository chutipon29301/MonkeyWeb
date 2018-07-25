import { Router } from "express";
import { UserManager } from "./classes/UserManager";

export const router = Router();

router.post("/list", (req, res) => {
    UserManager.listTutor()
        .map(tutors => tutors.map(tutor => tutor.getInterface()))
        .subscribe(tutors => {
            return res.status(200).send({
                tutors: tutors.map(tutor => {
                    let newTutor = tutor;
                    newTutor.password = "";
                    return newTutor;
                })
            });
        });
});

router.post("/getRole", (req, res) => {
    const { userID } = req.body;
    if (!userID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    UserManager.getRole(userID).subscribe(
        role => res.status(200).send({ role })
    );
});

router.post("/setRole", (req, res) => {
    const { userID, role } = req.body;
    if (!(userID && role)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request",
        })
    }
    UserManager.setRole(userID, role).subscribe(
        result => res.status(200).send({
            msg: "OK",
        }),
        error => res.status(500).send({ error }),
    );
});
