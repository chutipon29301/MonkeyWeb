import { Router } from 'express';
import { body, oneOf, validationResult } from 'express-validator/check';
import { addCourse } from '../../../model/v1/class';

export const router = Router();

router.post('/list',
    (req, res) => {
        return res.sendStatus(200);
    },
);

router.post('/addCourse',
    body('className').exists(),
    body('quarterID').isInt(),
    body('classDate').isISO8601(),
    body('classSubject').exists(),
    body('grade').isInt(),
    body('tutorID').isInt(),
    body('classTimes').isInt(),
    (req, res) => {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).send(validationResult(req).mapped());
        } else {
            addCourse(req.body.className, req.body.quarterID, req.body.classDate, req.body.classSubject, req.body.grade, req.body.tutorID, req.body.classTimes)
                .subscribe(
                    (result) => { },
                    (error) => res.status(500).send(error),
                    () => res.sendStatus(200),
            );
        }
    });

router.post('/delete', (req, res) => {
    return res.sendStatus(200);
});
