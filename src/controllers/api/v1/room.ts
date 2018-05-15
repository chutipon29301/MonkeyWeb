import { Router } from 'express';
import { check, oneOf } from 'express-validator/check';
import { Observable } from 'rx';
import { IRoom } from '../../../model/v1/interface/room';
import { listRoom, listRoomWithQuarterID } from '../../../model/v1/room';

export const router = Router();

router.post('/list', oneOf([
    check('quarterID').isInt(),
]), (req, res) => {
    let observable: Observable<IRoom[]>;
    if (req.body.quarterID) {
        observable = listRoomWithQuarterID(req.body.quarterID);
    } else {
        observable = listRoom();
    }
    observable.subscribe((value) => {
        return res.status(200).send({
            rooms: value,
        });
    }, (error) => {
        return res.status(500).send(error);
    });
});
