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

router.post('/getUserInfo', oneOf([
    [body('userID').isInt()],
]), (req, res) => {
    try {
        validationResult(req).throw();
        getUserInfo(req.body.userID).subscribe((value) => {
            return res.status(200).send(value[0]);
        }, (error) => {
            return res.status(500).send(error);
        });
    } catch (err) {
        return res.status(400).send(err);
    }
});
