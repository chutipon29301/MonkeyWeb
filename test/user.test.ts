import { config } from 'dotenv';
import { join } from 'path';
process.env = config({ path: join(__dirname, '../test.env') }).parsed;
import * as request from 'supertest';
import app from '../src/controllers/Controller';

describe('POST /api/v1/user/listTutor', () => {
    test('empty body\n\tExpect 200', () => {
        return request(app)
            .post('/api/v1/user/listTutor')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('tutors');
            });
    });
});

describe('POST /api/v1/user/getUserInfo', () => {
    test('valid body\n\tExpect 200', () => {
        return request(app)
            .post('/api/v1/user/getUserInfo')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({ userID: 99009 })
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('user');
                expect(res.body.user).toHaveProperty('ID');
                expect(res.body.user).toHaveProperty('Firstname');
                expect(res.body.user).toHaveProperty('Lastname');
                expect(res.body.user).toHaveProperty('Nickname');
                expect(res.body.user).toHaveProperty('FirstnameEn');
                expect(res.body.user).toHaveProperty('LastnameEn');
                expect(res.body.user).toHaveProperty('NicknameEn');
                expect(res.body.user).toHaveProperty('Email');
                expect(res.body.user).toHaveProperty('Phone');
                expect(res.body.user).toHaveProperty('UserStatus');
                expect(res.body.user).toHaveProperty('Position');
            });
    });

    test('empty body\n\tExpect 400', () => {
        return request(app)
            .post('/api/v1/user/getUserInfo')
            .expect(400);
    });

    test('non exist user\n\tExpect 400', () => {
        return request(app)
            .post('/api/v1/user/getUserInfo')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({ userID: 12345 })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toBeNull();
            });
    });
});
