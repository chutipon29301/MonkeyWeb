import { Router } from 'express';
import { router as room } from './room';
import { router as user } from './user';
import { body } from 'express-validator/check';
import { getUserInfo } from '../../../model/v1/user';
import * as jwt from 'jwt-simple';

export const router = Router();

router.use('/user', user);
router.use('/room', room);


router.post('/login',
    body('userID').isNumeric(),
    body('password').exists(),
    (req, res) => {
        getUserInfo(req.body.userID).subscribe(
            (user)=>{
                //TODO: wait for user.password to check


                let expire = new Date();
                expire.setDate(expire.getDate()+7);
                let token = 'bearer '+jwt.encode({
                    userID : user[0].ID,
                    expire
                },process.env.JWT_SECRET);
                return res.status(200).send({ token , expire })
            },
            (err)=>{
                return res.status(400).send({ err });
            }
        )
    }
);