import { Router } from 'express';
import { WorkflowManager } from './classes/WorkflowManager';
import { Constant } from './classes/Constants';

export const router = Router();

router.all('*', (req, res, next) => {
    if (req.user.position === 'student') return res.render('404');
    next();
})

router.get('/', (req, res) => {
    res.status(200).send('Ok');
});

router.post('/add', (req, res) => {
    if (!(req.body.title && req.body.subtitle && req.body.detail)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.addWorkflow(req.user._id, req.body.title, req.body.subtitle, req.body.detail, req.body.tag).then(node => {
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

router.post('/editHeader', (req, res) => {
    if (!(req.body.workflowID && req.body.title)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.editHeader(req.user._id, req.body.workflowID, req.body.title).then(result => {
        if (result.nModified === 0) {
            return res.status(202).send({
                msg: 'Not Modified'
            });
        } else {
            return res.status(200).send({
                msg: 'OK'
            });
        }
    });
});

router.post('/delete', (req, res) => {
    if (!(req.body.workflowID)) {
        return res.status(400).send({
            err: 0,
            msg: 'OK'
        });
    }
    WorkflowManager.deleteWorkflow(req.user._id, req.body.workflowID).then(_ => {
        return res.status(200).send({
            msg: 'OK'
        });
    }).catch(err => {
        return res.status(500).send({
            err: 1,
            msg: err.toString()
        });
    });
});

router.post('/editNode', (req, res) => {
    if (!(req.body.workflowID && req.body.subtitle)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.editNode(req.user._id, req.body.workflowID, req.body.subtitle).then(result => {
        if (result.nModified === 0) {
            return res.status(202).send({
                msg: 'Not Modified'
            });
        } else {
            return res.status(200).send({
                msg: 'OK'
            });
        }
    });
});
