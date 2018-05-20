import { Application } from 'express';
import { router as api } from './api';
import { router as test } from './api/test';
export default class Controller {
    public app: Application;
    constructor(app: Application) {
        this.app = app;
        this.app.use('/api', api);
        this.app.use('/testRouter', test);
        this.app.get('/testget', (req, res) => {
            return res.status(200).send({ gg: 'ez' });
        });
    }
}
