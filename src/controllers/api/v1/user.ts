import { Router } from 'express';

export const router = Router();

router.post('/list', (req, res) => {
    return res.status(200).send('OK');
});
