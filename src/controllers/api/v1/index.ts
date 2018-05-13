import { Router } from 'express';
import { router as user } from './user';

export const router = Router();

router.use('/user', user);
