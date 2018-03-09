import * as express from 'express';
import * as morgan from 'morgan';
import { router as workflow } from './workflow';
import * as mongoose from 'mongoose';
import { Constant } from './classes/Constants';

// { _id: 99009,
//     password: '2c8c0c6dbaf5b004d4172bb35440ac345eac73eaf3f7645002edd7319022e37a581ed33ee31c41cdccd95d9d5bbcdf67347f80a064335c3c0c31e0bcaee806a4',
//     position: 'dev',
//     firstname: 'ชุติพนธ์',
//     lastname: 'หิรัณย์กนกกุล',
//     nickname: 'นนท์',
//     firstnameEn: 'Chutipon',
//     lastnameEn: 'Hirankanokkul',
//     nicknameEn: 'Non',
//     email: 'non-chutipon@mkyhybrid.com',
//     phone: '0814953366',
//     tutor: { status: 'active' },
//     subPosition: 'IT HEAD' }


// Add user property to request object
declare global {
    namespace Express {
        interface Request {
            user: {
                _id: number,
                password: string,
                position: string,
                firstname: string,
                lastname: string,
                nickname: string,
                firstnameEn: string,
                lastnameEn: string,
                nicknameEn: string,
                email: string,
                phone: string,
                subPosition: string,
            }
        }
    }
}

export function app(passport: any) {
    var app = express();
    app.use(morgan('tiny'));

    mongoose.connect(Constant.DB_PATH);
    mongoose.connection.on('connected', _ => {
        console.log('[V2] Mongoose default connection open to ' + Constant.DB_PATH);
    });
    mongoose.connection.on('error', err => {
        console.error('Mongoose default connection error: ' + err);
    });
    mongoose.connection.on('disconnected', _ => {
        console.log('Mongoose default connection disconnected');
    });
    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });

    app.use('/workflow', passport.isLoggedIn, workflow);

    return app;
}