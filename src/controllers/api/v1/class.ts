import { Router } from 'express';
import { body } from 'express-validator/check';
import { Class } from '../../../repositories/v1/Class';
import { validateRequest } from '../../ApiValidator';

export const router = Router();

router.post('/addCourse',
    body('className').isString(),
    body('quarterID').isInt(),
    body('classDate').isISO8601(),
    body('classSubject').isString(),
    body('grade').isString().optional(),
    body('tutorID').isInt().optional(),
    body('classTimes').isInt().optional(),
    validateRequest,
    (req, res) => {
        Class.getInstance().addCourse(
            req.body.className,
            req.body.quarterID,
            req.body.classDate,
            req.body.classSubject,
            req.body.grade,
            req.body.tutorID,
            req.body.classTimes,
        ).subscribe(
            (result) => { },
            (error) => res.status(500).send(error),
            () => res.sendStatus(200),
        );
    },
);

router.post('/addHybrid',
    body('className').isString(),
    body('quarterID').isInt(),
    body('classDate').isISO8601(),
    body('classSubject').isString(),
    validateRequest,
    (req, res) => {
        Class.getInstance().addHybrid(
            req.body.className,
            req.body.quarterID,
            req.body.classDate,
            req.body.classSubject,
        ).subscribe(
            (result) => { },
            (error) => res.status(500).send(error),
            () => res.sendStatus(200),
        );
    },
);

router.post('/addSkill',
    body('className').isString(),
    body('quarterID').isInt(),
    body('classDate').isISO8601(),
    body('classSubject').isString(),
    validateRequest,
    (req, res) => {
        Class.getInstance().addSkill(
            req.body.className,
            req.body.quarterID,
            req.body.classDate,
            req.body.classSubject,
        ).subscribe(
            (result) => { },
            (error) => res.status(500).send(error),
            () => res.sendStatus(200),
        );
    },
);
