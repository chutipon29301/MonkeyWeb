import { Router } from 'express';
import { listQuarter } from '../../../model/v1/quarter';

export const router = Router();

router.post('/list', (req, res) => {
    listQuarter().subscribe(
        (quarters) => res.status(200).send({ quarters }),
        (error) => res.status(500).send(error));
});
