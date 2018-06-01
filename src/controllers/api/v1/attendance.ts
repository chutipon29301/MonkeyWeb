import { Router } from 'express';
import { body } from 'express-validator/check';
import { Attendance } from '../../../repositories/v1/Attendance';
import { attendanceDocument, completionHandler, validateFile, validateRequest } from '../../ApiHandler';

export const router = Router();

router.post('/add',
    body('studentID').isInt(),
    body('classID').isInt(),
    body('attendanceDate').isISO8601(),
    body('attendanceType').isString(),
    body('reason').isString(),
    body('sender').isString(),
    validateRequest,
    attendanceDocument,
    (req, res) => {
        Attendance.getInstance().add(
            req.body.studentID,
            req.body.classID,
            req.body.attendanceDate,
            req.body.attendanceType,
            req.body.reason,
            req.body.sender,
        ).subscribe(
            completionHandler(res),
        );
    },
);
