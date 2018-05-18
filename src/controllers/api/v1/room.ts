import { Router } from 'express';
import { body, oneOf } from 'express-validator/check';
import { Observable } from 'rx';
import { listRoom, listRoomWithQuarterID } from '../../../model/v1/room';
import { IRoom } from '../../../model/v1/types/room';

export const router = Router();

router.post('/list', oneOf([
    body('quarterID').isInt(),
]), (req, res) => {
    let observable: Observable<IRoom[]>;
    if (req.body.quarterID) {
        observable = listRoomWithQuarterID(req.body.quarterID);
    } else {
        observable = listRoom();
    }
    observable.subscribe(
        (rooms) => res.status(200).send({rooms}),
        (error) => res.status(500).send(error),
    );
});
