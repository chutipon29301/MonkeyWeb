import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { CommentConfig } from '../../../repositories/v1/CommentConfig';
import { CommentText } from '../../../repositories/v1/CommentText';
import { completionHandler, validateUserPosition } from '../../ApiHandler';

export const router = Router();

router.post(
    '/listText',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    (req, res) => {
        CommentText.getInstance().list().subscribe(
            (comments) => res.status(200).send({ comments }),
            (error) => res.status(500).send(error),
        );
    },
);

router.post(
    '/addText',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('text').isString(),
    (req, res) => {
        CommentText.getInstance().add(
            req.body.text,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/deletText',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('commentTextID').isInt(),
    (req, res) => {
        CommentText.getInstance().delete(
            req.body.commentTextID,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/editText',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('commentTextID').isInt(),
    body('text').isString(),
    (req, res) => {
        CommentText.getInstance().edit(
            req.body.commentTextID,
            req.body.text,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/listConfig',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('userID').isInt(),
    (req, res) => {
        CommentConfig.getInstance().list(
            req.body.userID,
        ).subscribe(
            (configs) => res.status(200).send({ configs }),
            (error) => res.status(500).send(error),
        );
    },
);

router.post(
    '/addConfig',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('userID').isInt(),
    body('commentTextID').isInt(),
    (req, res) => {
        CommentConfig.getInstance().add(
            req.body.userID,
            req.body.commentTextID,
        ).subscribe(
            completionHandler(res),
        );
    },
);

router.post(
    '/deleteConfig',
    validateUserPosition('tutor', 'admin', 'dev', 'mel'),
    body('userID').isInt(),
    body('commentTextID').isInt(),
    (req, res) => {
        CommentConfig.getInstance().delete(
            req.body.userID,
            req.body.commentTextID,
        ).subscribe(
            completionHandler(res),
        );
    },
);
