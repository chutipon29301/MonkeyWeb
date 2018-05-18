import { Router } from 'express';
import { body, oneOf, validationResult } from 'express-validator/check';
import { getUserInfo, listActiveTutor } from '../../../model/v1/user';

export const router = Router();

router.post('/listTutor', (req, res) => {
    listActiveTutor().subscribe((value) => {
        return res.status(200).send({
            tutors: value,
        });
    }, (error) => {
        return res.status(500).send(error);
    });
});

router.post('/getUserInfo',
    oneOf([
        [body('userID').isInt()],
    ]), (req, res) => {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).send(validationResult(req).mapped());
        } else {
            getUserInfo(req.body.userID).subscribe(
                (users) => res.status(200).send(users[0]),
                (error) => res.status(500).send(error),
            );
        }
    });
