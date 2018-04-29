import { readdirSync, statSync } from "fs";
import { join } from "path";
import { Application } from "express";
import { router as test } from "./api/test";

export default class View {
    public app: Application;
    constructor(app: Application) {
        this.app = app;
        this.app.use("/testRouter", test);
        this.app.get('/testget', function (req, res) {
            return res.status(200).send({ gg: 'ez' });
        })
    }
};

