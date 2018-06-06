import { Promise } from 'bluebird';
import { Router } from 'express';
import { body, oneOf, param } from 'express-validator/check';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { IAttendanceModel } from '../../../models/v1/attendance';
import { Attendance } from '../../../repositories/v1/Attendance';
import { attendanceDocument, completionHandler, validateIntArray, validateRequest } from '../../ApiHandler';

export const router = Router();

router.post('/add',
    attendanceDocument,
    body('studentID').isInt(),
    oneOf([
        body('classID').isInt(),
        body('classID').custom(validateIntArray),
    ]),
    body('attendanceDate').isISO8601(),
    body('attendanceType').isString(),
    body('reason').isString(),
    body('sender').isString(),
    validateRequest,
    (req, res) => {
        let observable: Observable<any>;
        if (req.body.classID instanceof Array) {
            observable = Attendance.getInstance().bulkAdd(
                req.body.studentID,
                req.body.classID,
                req.body.attendanceDate,
                req.body.attendanceType,
                req.body.reason,
                req.body.sender,
                req.file === undefined ? undefined : req.file.path,
            );
        } else {
            observable = Attendance.getInstance().add(
                req.body.studentID,
                req.body.classID,
                req.body.attendanceDate,
                req.body.attendanceType,
                req.body.reason,
                req.body.sender,
                req.file === undefined ? undefined : req.file.path,
            );
        }
        observable.subscribe(
            completionHandler(res),
        );
    },
);

router.get('/image/:id',
    param('id').isInt(),
    validateRequest,
    (req, res) => {
        Attendance.getInstance().getPath(
            req.params.id,
        ).subscribe(
            (path) => res.status(200).sendFile(path),
            (error) => res.status(500).send(error),
        );
    },
);

router.post('/delete',
    body('attendanceID').isInt(),
    validateRequest,
    (req, res) => {
        Attendance.getInstance().delete(
            req.body.attendanceID,
        ).subscribe(
            completionHandler(res),
        );
    },
);
