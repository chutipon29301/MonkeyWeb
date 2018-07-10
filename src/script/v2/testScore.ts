import { Router } from "express";
import { TestScoreManager, TestScoreInterface } from "./classes/TestScoreManager";

export const router = Router();

router.post("/addTest", (req, res) => {
    const { testName, testDate, maxScore } = req.body;
    if (!(testName && testDate && maxScore)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    TestScoreManager.addTest(testName, new Date(testDate), parseInt(maxScore)).subscribe(
        testScore => res.status(200).send({ testID: testScore.getID() }),
        error => res.status(500).send({ error }),
    )
});

router.post("/addStudent", (req, res) => {
    let { testID, students } = req.body;
    if (!(testID && students)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    if (!(students instanceof Array)) {
        students = [students];
    }
    TestScoreManager.find(testID).flatMap(
        test => test.addStudentScore(students),
    ).subscribe(
        result => res.status(200).send({
            msg: "OK"
        }),
        error => res.status(500).send({ error }),
    );
});

router.post("/deleteTest", (req, res) => {
    const { testID } = req.body;
    if (!testID) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    TestScoreManager.delete(testID).subscribe(
        result => res.status(200).send({
            msg: "OK"
        }),
        error => res.status(500).send({ error }),
    )
});

router.post("/list", (req, res) => {
    TestScoreManager.list().subscribe(
        tests => res.status(200).send({ tests }),
        error => res.status(500).send({ error }),
    )
});

router.post("/removeStudent", (req, res) => {
    const { testID, students } = req.body;
    if (!(testID && students)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    TestScoreManager.find(testID).flatMap(
        result => result.removeStudentScore(students)
    ).subscribe(
        result => res.status(200).send({
            msg: "OK",
        }),
        error => res.status(500).send({ error: error.toString() }),
    )
});

router.post("/editTest", (req, res) => {
    const { testID, testDate, testName, maxScore } = req.body;
    if (!(testID && (testDate || testName || maxScore))) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    let editValue = {} as Partial<TestScoreInterface>;
    if (testDate) {
        editValue.testDate = new Date(testDate);
    }
    if (testName) {
        editValue.testName = testName;
    }
    if (maxScore) {
        editValue.maxScore = parseInt(maxScore);
    }
    TestScoreManager.find(testID).flatMap(test => {
        return test.edit(editValue);
    }).subscribe(
        result => res.status(200).send({
            msg: "OK",
        }),
        error => res.status(500).send({ error: error.toString() }),
    );
});
