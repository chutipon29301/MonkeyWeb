import { Router } from 'express';
import { body, validationResult } from 'express-validator/check';
import { flatMap } from 'rxjs/operators';
import { addSheet, addTopic, checkExistTopic } from '../../../model/v1/sheet';
import { Sheet } from '../../../repositories/v1/Sheet';
import { validateRequest } from '../../ApiValidator';

export const router = Router();

router.post('/addSheet',
    body('subject').isString().isLength({ min: 1, max: 1 }),
    body('class').isString().isLength({ min: 1, max: 1 }),
    body('topic').isString().isLength({ min: 1, max: 3 }),
    body('level').isString().isLength({ min: 1, max: 1 }),
    body('number').isInt().isLength({ min: 1, max: 2 }),
    body('subLevel').isString().isLength({ min: 1, max: 2 }).optional(),
    body('rev').isNumeric().isLength({ min: 3, max: 3 }).optional(),
    body('topicName').isString().optional(),
    body('path').isString(),
    validateRequest,
    (req, res) => {
        Sheet.getInstance().addSheetWithTopic(
            req.body.subject,
            req.body.class,
            req.body.topic,
            req.body.level,
            req.body.number,
            req.body.subLevel || null,
            req.body.rev || null,
            req.body.topicName || null,
            req.body.path)
            .subscribe(
                (sheet) => res.sendStatus(200),
                (error) => res.status(500).send(error),
        );
    },
);
