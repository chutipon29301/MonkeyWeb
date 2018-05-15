import { Router } from 'express';
import { getUserInfo, listActiveTutor } from '../../../model/v1/user';

export const router = Router();

router.post('/list', (req, res) => {
    return res.status(200).send('OK');
});

router.post('/listTutor', (req, res) => {
    listActiveTutor().subscribe(
        (value) => {
            return res.status(200).send({
                tutors: value,
            });
        },
        (error) => {
            return res.status(500).send(error);
        },
    );
});

router.post('/getUserInfo', (req, res) => {
    res.status(200).send('OK');
    getUserInfo(99009).subscribe((value) => {
        console.log(value);
    }, (error) => {
        console.log(error);
    }, () => {
        console.log('Complete');
    });
});
