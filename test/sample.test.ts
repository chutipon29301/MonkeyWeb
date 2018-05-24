import { config } from 'dotenv';
process.env = config({path: '../test.env'}).parsed;

import request from 'supertest';
// import Server from '../src/controllers/Server';
// import {Temp} from '../src/controllers/Hello';

// const server = new Server();
// // const server = new Temp();
// import express = require('express');

describe('Sample test function', () => {
    test('Test jest\n\tExpect to success', () => {
        expect(1 + 1).toBe(2);
    });

    // test('Send post request\n\tExpect to be success', () => {
    //     expect(app).not.toBe(undefined);
    //     // return request(app)
    //     //     .get('/testget')
    //     //     .expect(200)
    //     //     .expect((res) => {
    //     //         expect(res.body).toHaveProperty('gg', 'ez');
    //     //     });
    // });
});
