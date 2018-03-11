import { Router } from 'express';
import { WorkflowManager, Status } from './classes/WorkflowManager';
import { Constant } from './classes/Constants';
import { Observable } from 'rx';

export const router = Router();

router.all('*', (req, res, next) => {
    let positionArray = ['tutor', 'admin', 'dev', 'mel'];
    if (positionArray.indexOf(req.user.position) === -1) return res.render('404');
    next();
});

router.post('/add', (req, res) => {
    if (!(req.body.title && req.body.subtitle && req.body.detail)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    let duedate: Date;
    if (req.body.duedate) {
        duedate = new Date(req.body.duedate)
    } else {
        duedate == null;
    }
    WorkflowManager.addWorkflow(
        req.user._id,
        req.body.title,
        req.body.subtitle,
        req.body.detail,
        req.body.tag,
        duedate
    ).subscribe(node => {
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

router.post('/delete', (req, res) => {
    if (!(req.body.workflowID)) {
        return res.status(400).send({
            err: 0,
            msg: 'OK'
        });
    }
    WorkflowManager.deleteWorkflow(req.user._id, req.body.workflowID).subscribe(
        _ => {
            return res.status(200).send({
                msg: 'OK'
            });
        }, err => {
            return res.status(500).send({
                err: 1,
                msg: err.toString()
            })
        }
    );
});

router.post('/editHeader', (req, res) => {
    if (!(req.body.workflowID && req.body.title)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.editHeader(
        req.user._id,
        req.body.workflowID,
        req.body.title
    ).subscribe(result => {
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

router.post('/editHeader', (req, res) => {
    if (!(req.body.workflowID && req.body.title)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.editHeader(
        req.user._id,
        req.body.workflowID,
        req.body.title
    ).subscribe(node => {
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

router.post('/editNode', (req, res) => {
    if (!(req.body.workflowID && (req.body.subtitle || req.body.duedate))) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    let subtitle: string;
    let duedate: Date;

    if (req.body.subtitle) subtitle = req.body.subtitle;
    else subtitle = '';

    if (req.body.duedate) duedate = new Date(req.body.duedate);
    else duedate = null;

    WorkflowManager.editNode(
        req.user._id,
        req.body.workflowID,
        subtitle,
        duedate
    ).subscribe(result => {
        if (result.nModified === 0) {
            return res.status(202).send({
                msg: 'Not Modified'
            });
        } else {
            return res.status(200).send({
                msg: 'Ok'
            });
        }
    })
});


router.post('/assign', (req, res) => {
    if (!(req.body.workflowID && req.body.owner)) {
        return res.status(200).send({
            err: 0,
            msg: 'Bad Request'
        });
    }

    let subtitle: string;
    let detail: string;
    let duedate: Date;

    if (req.body.subtitle) subtitle = req.body.subtitle;
    if (req.body.detail) detail = req.body.detail;
    if (req.body.duedate) duedate = new Date(req.body.duedate);

    WorkflowManager.getNode(req.body.workflowID).flatMap(parent => {
        return WorkflowManager.addNode(
            req.user._id,
            parent._id,
            req.user._id,
            subtitle,
            detail,
            Status.ASSIGN,
            duedate
        );
    }).flatMap(node => {
        return WorkflowManager.addNode(
            req.user._id,
            node._id,
            req.body.owner,
            '',
            '',
            Status.TODO
        )
    }).subscribe(node => {
        // TODO: Handle notification event
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

router.post('/addChild', (req, res) => {
    if (!(req.body.workflowID && req.body.owner)) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }

    let subtitle: string;
    let detail: string;
    let duedate: Date;

    if (req.body.subtitle) subtitle = req.body.subtitle;
    if (req.body.detail) detail = req.body.detail;
    if (req.body.duedate) duedate = new Date(req.body.duedate);

    WorkflowManager.getNode(req.body.workflowID).flatMap(parent => {
        if (parent.status !== Status.ASSIGN) throw Observable.throw(new Error('annot add child to non-assign status node'));
        return WorkflowManager.addNode(
            req.user._id,
            parent._id,
            req.body.owner,
            subtitle,
            detail,
            Status.TODO,
            duedate
        );
    }).subscribe(node => {
        // TODO: Handle notification event
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

router.post('/inProgress', (req, res) => {
    if (!req.body.workflowID) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }

    WorkflowManager.getNode(req.body.workflowID).flatMap(parent => {
        return WorkflowManager.addNode(
            req.user._id,
            parent._id,
            req.user._id,
            '', '',
            Status.IN_PROGRESS
        );
    }).subscribe(node => {
        // TODO: Handle notification event
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

router.post('/todo', (req, res) => {
    if (!req.body.workflowID) {
        return res.status(400).send({
            err: 0,
            msg: 'Bar Request'
        });
    }

    WorkflowManager.getNode(req.body.WorkflowManager).flatMap(parent => {
        return WorkflowManager.addNode(
            req.user._id,
            parent._id,
            req.user._id,
            '', '',
            Status.TODO
        );
    }).subscribe(node => {
        // TODO: Handle notification event
        return res.status(200).send({
            msg: 'OK'
        });
    });
});

// router.post('/done', (req, res) => {
//     if (!req.body.workflowID) {
//         return res.status(400).send({
//             err: 0,
//             msg: 'Bad Request'
//         });
//     }
//     let userID: Number;
//     // WorkflowManager.getNode(req.body.workflowID).then(node => {
//     //     userID = node.createdBy;
//     //     return WorkflowManager.addNode(
//     //         req.user._id,
//     //         node._id,
//     //         req.user._id,
//     //         '',
//     //         Status.DONE
//     //     );
//     // }).then(node => {
//     //     return WorkflowManager.addNode(
//     //         req.user._id,
//     //         node._id,
//     //         userID as number,
//     //         '',
//     //         Status.TODO
//     //     )
//     // });

// });

router.post('/getChild', (req, res) => {
    if (!req.body.workflowID) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.getChildNode(req.body.workflowID).subscribe(nodes => {
        return res.status(200).send({
            child: nodes
        });
    });
});

router.post('/getTree', (req, res) => {
    if (!req.body.workflowID) {
        return res.status(400).send({
            err: 0,
            msg: 'Bad Request'
        });
    }
    WorkflowManager.getTree(req.body.workflowID).subscribe(nodes => {
        return res.status(200).send({
            child: nodes
        });
    });
});

router.post('/getNode', (req, res) => {
    WorkflowManager.getUserWorkflow(req.user._id).subscribe(nodes => {
        res.status(200).send({
            workflows: nodes
        });
    });
});
