import { Router } from 'express';
import { body } from 'express-validator/check';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { IAttendanceModel } from '../../../models/v1/attendance';
import { Attendance } from '../../../repositories/v1/Attendance';
import { AttendanceDocument } from '../../../repositories/v1/AttendanceDocument';
import { attendanceDocument, completionHandler, validateRequest } from '../../ApiHandler';

export const router = Router();

router.post('/add',
    attendanceDocument,
    body('studentID').isInt(),
    body('classID').isInt(),
    body('attendanceDate').isISO8601(),
    body('attendanceType').isString(),
    body('reason').isString(),
    body('sender').isString(),
    validateRequest,
    (req, res) => {
        let observable: Observable<IAttendanceModel>;
        if (req.file) {
            observable = AttendanceDocument.getInstance().add(
                req.file.path,
            ).pipe(
                flatMap((attendanceDocument) =>
                    Attendance.getInstance().add(
                        req.body.studentID,
                        req.body.classID,
                        req.body.attendanceDate,
                        req.body.attendanceType,
                        req.body.reason,
                        req.body.sender,
                        attendanceDocument.ID,
                    ),
                ),
            );
        } else {
            observable = Attendance.getInstance().add(
                req.body.studentID,
                req.body.classID,
                req.body.attendanceDate,
                req.body.attendanceType,
                req.body.reason,
                req.body.sender,
            );
        }
        observable.subscribe(
            completionHandler(res),
        );
    },
);
