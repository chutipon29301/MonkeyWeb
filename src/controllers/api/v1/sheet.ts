import { Router } from 'express';
import { body, validationResult } from 'express-validator/check';
import { addSheet, addTopic, checkExistTopic } from '../../../model/v1/sheet';

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
    (req, res) => {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).send(validationResult(req).mapped());
        } else {
            checkExistTopic(req.body.subject, req.body.class, req.body.topic)
                .flatMap((topic) => {
                    if (topic != null) {
                        return addSheet(topic.ID, req.body.level, req.body.number, req.body.subLevel || null, req.body.rev || null, req.body.path);
                    } else {
                        return addTopic(req.body.subject, req.body.class, req.body.topic, req.body.topicName || null)
                            .flatMap((result) => {
                                return checkExistTopic(req.body.subject, req.body.class, req.body.topic);
                            })
                            .flatMap((generateTopic) => {
                                return addSheet(generateTopic.ID, req.body.level, req.body.number, req.body.subLevel || null, req.body.rev || null, req.body.path);
                            });
                    }
                })
                .subscribe(
                    () => res.sendStatus(200),
                    (error) => res.status(500).send({ error: error.toString() }),
            );
        }
    },
);
