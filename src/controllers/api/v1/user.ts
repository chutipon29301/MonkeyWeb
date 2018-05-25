import { Router } from 'express';
import { body, oneOf, validationResult } from 'express-validator/check';
import { User } from '../../../repositories/v1/User';
import { validateRequest } from '../../ApiValidator';

export const router = Router();

router.post('/listTutor',
    (req, res) => {
        User.getInstance().listTutors()
            .subscribe(
                (tutors) => res.status(200).send({ tutors }),
                (error) => res.status(500).send(error),
        );
    },
);

router.post('/getUserInfo',
    body('userID').isInt(),
    validateRequest,
    (req, res) => {
        User.getInstance().getUserInfo(req.body.userID)
            .subscribe(
                (user) => res.status(200).send({ user }),
                (error) => res.status(500).send(error),
        );
    },
);
