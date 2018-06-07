import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { Portfolio } from '../../../repositories/v1/Portfolio';
import { completionHandler, validateRequest } from '../../ApiHandler';

export const router = Router();

router.post('/add',
    body('studentID').isInt(),
    body('hybridSheetID').isInt(),
    validateRequest,
    (req, res) => {
        Portfolio.getInstance().add(
            req.body.studentID,
            req.body.hybridSheetID,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post('/list',
    body('studentID').isInt(),
    validateRequest,
    (req, res) => {
        Portfolio.getInstance().getUserPortfolio(
            req.body.studentID,
        ).subscribe(
            (portfolio) => res.status(200).send({ portfolio }),
            (error) => res.status(500).send(error),
        );
    },
);

router.post('/edit',
    body('portfolioID').isInt(),
    oneOf([
        body('startDate').isISO8601(),
        body('endDate').isISO8601(),
        body('score').isString(),
    ]),
    validateRequest,
    (req, res) => {
        Portfolio.getInstance().edit(
            req.body.portfolioID,
            {
                EndDate: req.body.endDate,
                Score: req.body.score,
                StartDate: req.body.startDate,
            },
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post('/delete',
    body('portfolioID').isInt(),
    validateRequest,
    (req, res) => {
        Portfolio.getInstance().delete(
            req.body.portfolioID,
        ).subscribe(
            completionHandler(res),
        );
    },
);
