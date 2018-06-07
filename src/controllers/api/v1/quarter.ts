import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { Quarter } from '../../../repositories/v1/Quarter';
import { completionHandler, validateRequest } from '../../ApiHandler';

export const router = Router();

router.post(
    '/list',
    (req, res) => {
        Quarter.getInstance().listQuarter()
            .subscribe(
                (quarters) => res.status(200).send({ quarters }),
                (error) => res.status(500).send(error),
        );
    },
);

router.post(
    '/add',
    body('quarterName').isString(),
    body('type').isString(),
    validateRequest,
    (req, res) => {
        Quarter.getInstance().add(
            req.body.quarterName,
            req.body.type,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/edit',
    body('quarterID').isInt(),
    oneOf([
        body('quarterName').isString(),
        body('startDate').isISO8601(),
        body('endDate').isISO8601(),
    ]),
    validateRequest,
    (req, res) => {
        Quarter.getInstance().edit(
            req.body.quarterID,
            {
                EndDate: req.body.endDate,
                QuarterName: req.body.quarterName,
                StartDate: req.body.startDate,
            },
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/delete',
    body('quarterID').isInt(),
    validateRequest,
    (req, res) => {
        Quarter.getInstance().delete(
            req.body.quarterID,
        ).subscribe(
            completionHandler(res),
        );
    },
);
