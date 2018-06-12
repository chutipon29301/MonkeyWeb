import { Promise } from 'bluebird';
import { compose } from 'compose-middleware';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validationResult } from 'express-validator/check';
import * as _ from 'lodash';
import * as multer from 'multer';
import { join } from 'path';
import { Subscriber } from 'rxjs';
import { SubjectSubscriber } from 'rxjs/internal/Subject';
import Auth from '../Auth';
import { TutorLogDetail } from '../models/v1/tutorLog';

export function validateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    if (!validationResult(req).isEmpty()) {
        res.status(400).send({ error: validationResult(req).array() });
    } else {
        next();
    }
}

export function completionHandler(
    res: Response,
): Subscriber<any> {
    return SubjectSubscriber.create(
        () => { },
        (error) => res.status(500).send({ error: error.toString() }),
        () => res.sendStatus(200),
    );
}

export function validateFile(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    if (req.file || req.files) {
        next();
    } else {
        res.status(400).send({
            error: 'No file or files upload',
        });
    }
}

export function validateLocal(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const index = req.ip.match(/\d/);
    const ipAddress = req.ip.substring(index.index, req.ip.length);
    if (ipAddress === '125.25.54.23') {
        next();
    } else {
        res.sendStatus(401);
    }
}

export function validateNumberArray(
    value: any,
): Promise<string> {
    return new Promise((reslove, reject) => {
        if (value instanceof Array) {
            if (_.every(value.map((o) => +o), _.isNumber)) {
                reslove();
            } else {
                reject('element of field should be a number');
            }
        } else {
            reject('field should be an array');
        }
    });
}

export function validateTutorLogDetailArray(
    value: any,
): Promise<string> {
    return new Promise((reslove, reject) => {
        if (value instanceof Array) {
            if (_.every(value, (o) => Object.keys(TutorLogDetail).indexOf(o) !== -1)) {
                reslove();
            } else {
                reject('element of field should be one of none, course, hybrid, sheet, com, reading');
            }
        } else {
            reject('field should be an array');
        }
    });
}

export const attendanceDocument = multer({
    storage: multer.diskStorage({}),
}).single('attendanceDocument');

export const commentImage = multer({
    storage: multer.diskStorage({
        destination: join(process.env.DOCUMENT_PATH, 'comment/'),
        filename: (req, file, cb) => {
            cb(null, (new Date()).toISOString());
        },
    }),
}).single('commentImage');

export const profileImage = multer({
    storage: multer.diskStorage({}),
}).single('profileImage');

export function validateUserPosition(
    ...position: Array<'student' | 'tutor' | 'admin' | 'dev' | 'mel'>,
): (req: Request, res: Response, next: NextFunction) => void {
    return compose([
        Auth.authenticate(),
        (req: Request, res: Response, next: NextFunction) => {
            if (position.indexOf(req.user.Position) === -1) {
                res.sendStatus(401);
            } else {
                next();
            }
        },
    ]);
}
