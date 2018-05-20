import { Application } from 'express';
import { router as api } from './api';
import { router as test } from './api/test';
export default class Controller {

    public static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller();
        }
        return Controller.instance;
    }

    private static instance: Controller;
    private static app: Application;

    private constructor() { }

    public setApp(app: Application) {
        Controller.app = app;
        Controller.app.use('/api', api);
        Controller.app.use('/testRouter', test);
        Controller.app.get('/testget', (req, res) => {
            return res.status(200).send({ gg: 'ez' });
        });
    }

    public getApp(): Application {
        return Controller.app;
    }
}
