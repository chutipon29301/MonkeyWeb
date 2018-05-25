import { Router } from 'express';
import { body, oneOf, validationResult } from 'express-validator/check';
import { addCourse } from '../../../model/v1/class';
import { validateRequest } from '../../ApiValidator';

export const router = Router();

// router.post('/list',
//     (req, res) => {
//         return res.sendStatus(200);
//     },
// );

router.post('/addCourse',
    body('className').isString(),
    body('quarterID').isInt(),
    body('classDate').isISO8601(),
    body('classSubject').isString(),
    body('grade').isString(),
    body('tutorID').isInt(),
    body('classTimes').isInt(),
    validateRequest,
    (req, res) => {
        addCourse(req.body.className,
            req.body.quarterID,
            req.body.classDate,
            req.body.classSubject,
            req.body.grade,
            req.body.tutorID,
            req.body.classTimes)
            .subscribe(
                (result) => { },
                (error) => res.status(500).send(error),
                () => res.sendStatus(200),
        );
    });

// router.post('/delete', (req, res) => {
//     return res.sendStatus(200);
// });
