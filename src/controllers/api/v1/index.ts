import { Router } from 'express';
import { body } from 'express-validator/check';
import * as jwt from 'jwt-simple';
import { getUserLogin } from '../../../model/v1/user';
import { router as course } from './class';
import { router as quarter } from './quarter';
import { router as room } from './room';
import { router as user } from './user';

export const router = Router();

router.use('/class', course);
router.use('/quarter', quarter);
router.use('/room', room);
router.use('/user', user);

router.post('/login',
    body('userID').exists(),
    body('password').exists(),
    (req, res) => {
        console.log(req.body)
        getUserLogin(Number(req.body.userID), req.body.password).subscribe(
            (user) => {
                if (user) {
                    let expire = new Date();
                    expire.setDate(expire.getDate() + 7);
                    let token = 'bearer ' + jwt.encode({
                        userID: req.body.userID,
                        expire
                    }, process.env.JWT_SECRET);
                    return res.status(200).send({ token, expire });
                } else {
                    return res.sendStatus(400);
                }
            },
            (err) => {
                return res.status(400).send({ err });
            }
        )
    }
);
