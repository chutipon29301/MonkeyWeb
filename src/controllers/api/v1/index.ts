import { Router } from 'express';
import { body } from 'express-validator/check';
import * as jwt from 'jwt-simple';
import { User } from '../../../repositories/v1/User';
import { router as course } from './class';
import { router as classlog } from './classlog';
import { router as quarter } from './quarter';
import { router as room } from './room';
import { router as sheet } from './sheet';
import { router as user } from './user';

export const router = Router();

router.use('/class', course);
router.use('/quarter', quarter);
router.use('/room', room);
router.use('/sheet', sheet);
router.use('/user', user);
router.use('/classlog', classlog);

router.post('/login',
    body('userID').isInt(),
    body('password').isString(),
    (req, res) => {
        User.getInstance().login(
            req.body.userID,
            req.body.password,
        ).subscribe(
            (success) => {
                if (success) {
                    const expire = new Date();
                    expire.setDate(expire.getDate() + 7);
                    // tslint:disable:object-literal-sort-keys
                    const token = 'bearer ' + jwt.encode({
                        userID: req.body.userID,
                        expire,
                    }, process.env.JWT_SECRET);
                    return res.status(200).send({ token, expire });
                } else {
                    res.sendStatus(401);
                }
            },
            (error) => res.status(500).send(error),
        );
        // getUserLogin(Number(req.body.userID), req.body.password).subscribe(
        //     (user) => {
        //         if (user) {
        //         } else {
        //             return res.sendStatus(400);
        //         }
        //     },
        //     (err) => {
        //         return res.status(400).send({ err });
        //     },
        // );
    },
);
