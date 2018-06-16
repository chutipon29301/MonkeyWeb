import { Router } from 'express';
import { body } from 'express-validator/check';
import { receiptImage, validateFile, validateRequest } from '../../ApiHandler';

export const router = Router();

router.post(
    '/upload',
    receiptImage,
    body('userID').isInt(),
    body('quarterID').isInt(),
    validateFile,
    validateRequest,
    (req, res) => {

    },
);
