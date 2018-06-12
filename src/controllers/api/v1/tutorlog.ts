import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { TutorLogDetail } from '../../../models/v1/tutorLog';
import { TutorLog } from '../../../repositories/v1/TutorLog';
import { completionHandler, validateLocal, validateNumberArray, validateRequest, validateTutorLogDetailArray, validateUserPosition } from '../../ApiHandler';

export const router = Router();

router.post(
    '/checkIn',
    validateLocal,
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('userID').isInt(),
    validateRequest,
    (req, res) => {
        TutorLog.getInstance().checkIn(
            req.body.userID,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/checkOut',
    validateLocal,
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('userID').isInt(),
    body('detail').isArray().isLength({ max: 5, min: 5 }),
    body('detail').custom(validateTutorLogDetailArray),
    validateRequest,
    (req, res) => {
        TutorLog.getInstance().checkOut(
            req.body.userID,
            req.body.detail[0],
            req.body.detail[1],
            req.body.detail[2],
            req.body.detail[3],
            req.body.detail[4],
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/edit',
    validateUserPosition('mel'),
    body('tutorLogID').isInt(),
    oneOf([
        body('checkIn').isISO8601(),
        body('checkOut').isISO8601(),
        body('detail0').isIn(Object.keys(TutorLogDetail)),
        body('detail1').isIn(Object.keys(TutorLogDetail)),
        body('detail2').isIn(Object.keys(TutorLogDetail)),
        body('detail3').isIn(Object.keys(TutorLogDetail)),
        body('detail4').isIn(Object.keys(TutorLogDetail)),
        body('tutorLogDate').isISO8601(),
    ]),
    validateRequest,
    (req, res) => {
        TutorLog.getInstance().edit(
            req.body.tutorLogID,
            req.user.ID,
            {
                CheckIn: req.body.checkIn,
                CheckOut: req.body.checkOut,
                Detail0: req.body.detail0,
                Detail1: req.body.detail1,
                Detail2: req.body.detail2,
                Detail3: req.body.detail3,
                Detail4: req.body.detail4,
            },
        ).subscribe(
            completionHandler(res),
        );
    },
);
