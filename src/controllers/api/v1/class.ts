import { Router } from 'express';
import { body } from 'express-validator/check';
import { Class } from '../../../repositories/v1/Class';
import { ClassRegistration } from '../../../repositories/v1/ClassRegistration';
import { completionHandler, validateRequest } from '../../ApiHandler';

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
            completionHandler(res),
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
            completionHandler(res),
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
            completionHandler(res),
        );
    },
);

router.post('/registration',
    body('studentID').isInt(),
    body('classID').isInt(),
    validateRequest,
    (req, res) => {
        ClassRegistration.getInstance().add(
            req.body.studentID,
            req.body.classID,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post('/getClass',
    body('className').isString().optional(),
    body('quarterID').isInt().optional(),
    body('classDate').isISO8601().optional(),
    body('classSubject').isString().optional(),
    body('classType').isString().optional(),
    validateRequest,
    (req, res) => {
        Class.getInstance().getClass(
            req.body.className,
            req.body.quarterID,
            req.body.classDate,
            req.body.classSubject,
            req.body.classType
        ).subscribe(
            (result) => res.status(200).send(result),
            (error) => res.status(500).send(error),
        );
    },
);
