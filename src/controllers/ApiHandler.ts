import { Promise } from 'bluebird';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validationResult } from 'express-validator/check';
import * as multer from 'multer';
import { join } from 'path';
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
        (error) => res.status(500).send({error: error.toString()}),
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

export const attendanceDocument = multer({
    storage: multer.diskStorage({
        destination: join(process.env.DOCUMENT_PATH, 'attendance/'),
        filename: (req, file, cb) => {
            cb(null, (new Date()).toISOString());
        },
    }),
}).single('attendanceDocument');

export function validateIntArray(value: any): Promise<string> {
    return new Promise((reslove, reject) => {
        if (value instanceof Array) {
            value.forEach((element) => {
                if (typeof element !== 'number') {
                    reject('element of classID should be a number');
                }
            });
            reslove();
        } else {
            reject('classID should be an array');
        }
    });
}

// export function validateArray<T>(): ((value: any) => Promise<string>) {
//     return (value: any) => new Promise((reslove, reject) => {
//         if (value instanceof Array) {
//             value.forEach((element) => {
//                 if (element instanceof T) {
//                 }
//                 // if (typeof element !== 'number') {
//                 //     reject('element of classID should be a number');
//                 // }
//             });
//             reslove();
//         } else {
//             reject('field should be an array');
//         }
//     });
// }
