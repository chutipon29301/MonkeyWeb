import { config } from 'dotenv';
import { join } from 'path';
process.env = config({ path: join(__dirname, '../test.env') }).parsed;
import * as request from 'supertest';
import app from '../src/controllers/Controller';

describe('POST /api/v1/class/addCourse', () => {

    test('empty body\n\tExpect 200', () => {
        return request(app)
            .post('/api/v1/class/addCourse')
            .expect(400);
    });

    test('empty body\n\tExpect 200', () => {
        return request(app)
            .post('/api/v1/class/addCourse')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(400);
    });

});
