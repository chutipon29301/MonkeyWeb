import { Router } from 'express';
import { body, oneOf, validationResult } from 'express-validator/check';
import { getUserInfo, listActiveTutor } from '../../../model/v1/user';

export const router = Router();

router.post('/listTutor',
    (req, res) => {
        listActiveTutor()
            .subscribe(
                (tutors) => res.status(200).send({ tutors }),
                (error) => res.status(500).send(error),
        );
    },
);

router.post('/getUserInfo',
    body('userID').isInt(),
    (req, res) => {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).send(validationResult(req).mapped());
        } else {
            getUserInfo(req.body.userID)
                .subscribe(
                    (user) => res.status(200).send(user),
                    (error) => res.status(500).send(error),
            );
        }
    },
);
