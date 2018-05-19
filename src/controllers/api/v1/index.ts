import { Router } from 'express';
import { router as room } from './room';
import { router as user } from './user';

export const router = Router();

router.use('/user', user);
router.use('/room', room);
