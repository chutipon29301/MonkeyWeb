import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validationResult } from 'express-validator/check';
import * as multer from 'multer';
import { Observer, PartialObserver, Subscriber } from 'rxjs';
import { SubjectSubscriber } from 'rxjs/internal/Subject';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
    if (!validationResult(req).isEmpty()) {
        res.status(400).send({ error: validationResult(req).array() });
    } else {
        next();
    }
}

export function completionHandler(res: Response): Subscriber<any> {
    return SubjectSubscriber.create(
        () => { },
        (error) => res.status(500).send(error),
        () => res.sendStatus(200),
    );
}

export function validateFile(req: Request, res: Response, next: NextFunction): void {
    if (req.file || req.files) {
        next();
    } else {
        res.status(400).send({
            error: 'No file or files upload',
        });
    }
}

const upload = multer({
    dest: process.env.DOCUMENT_PATH,
});

export const attendanceDocument = upload.single();
