import { Router } from 'express';
import { router as course } from './class';
import { router as quarter } from './quarter';
import { router as room } from './room';
import { router as user } from './user';

export const router = Router();

router.use('/class', course);
router.use('/quarter', quarter);
router.use('/room', room);
router.use('/user', user);
