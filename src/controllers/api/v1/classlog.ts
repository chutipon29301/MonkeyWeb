import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { Observable } from 'rxjs';
import { IClassLogModel } from '../../../models/v1/classlog';
import { ClassLog } from '../../../repositories/v1/ClassLog';
import { validateRequest } from '../../ApiValidator';

export const router = Router();

router.post('/add',
    body('studentID').isInt(),
    body('classID').isInt(),
    body('studyDate').isISO8601(),
    body('hybridSheetID').isInt(),
    body('tutorID').isInt(),
    validateRequest,
    (req, res) => {
        ClassLog.getInstance().add(
            req.body.studentID,
            req.body.classID,
            req.body.studyDate,
            req.body.hybridSheetID,
            req.body.tutorID,
        ).subscribe(
            () => { },
            (error) => res.status(500).send(error),
            () => res.sendStatus(200),
        );
    },
);

router.post('/list',
    oneOf([
        body('studentID').isInt(),
        body('studyDate').isISO8601(),
    ]),
    validateRequest,
    (req, res) => {
        let observable: Observable<IClassLogModel[]>;
        if (req.body.studentID) {
            observable = ClassLog.getInstance().listByStudentID(req.body.studentID);
        } else {
            observable = ClassLog.getInstance().listInDate(req.body.studyDate);
        }
        observable.subscribe(
            (logs) => res.status(200).send({ logs }),
            (error) => res.status(500).send(error),
        );
    },
);
