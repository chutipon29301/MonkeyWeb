import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { Observable } from 'rxjs';
import { Room } from '../../../repositories/v1/Room';

export const router = Router();

router.post('/list',
    body('quarterID').isInt(),
    (req, res) => {
        Room.getInstance().list(
            req.body.quarterID,
        ).subscribe(
            (rooms) => res.status(200).send({ rooms }),
            (error) => res.status(500).send(error),
        );
    },
);
