import { join } from 'path';
import { config } from 'dotenv';
process.env = config({path: join(__dirname,'../test.env')}).parsed;
import app from '../src/controllers/Controller';
import * as request from 'supertest';

describe('Sample test function', () => {
    test('Test jest\n\tExpect to success', () => {
        expect(1 + 1).toBe(2);
    });
    test('Process env',()=>{
        expect(process.env.DB_USERNAME).toBe('Non');
    })
    test('Send post request\n\tExpect to be success', () => {
        expect(app).not.toBe(undefined);
        return request(app)
            .get('/testget')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('gg', 'ez');
            });
    });
});
