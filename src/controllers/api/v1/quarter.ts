import { Router } from 'express';
import { listQuarter } from '../../../model/v1/quarter';

export const router = Router();

router.post('/list', (req, res) => {
    listQuarter().subscribe((value) => {
        return res.status(200).send({
            rooms: value,
        });
    }, (error) => {
        return res.status(500).send(error);
    });
});
