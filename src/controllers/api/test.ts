import { Router } from 'express';

export const router = Router();

router.get('/', (req, res) => {
    return res.status(200).send({});
});

router.get('/testReq', (req, res) => {
    return res.status(200).send({ hello: 'world' });
});