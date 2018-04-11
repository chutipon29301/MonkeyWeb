import { Router } from "express";
import { Observable } from "rx";
import { Status, WorkflowManager } from "./classes/WorkflowManager";
import { IOSNotificationManager } from "./classes/NotificationManager";

export const router = Router();

router.all("*", (req, res, next) => {
    let positionArray = ["tutor", "admin", "dev", "mel"];
    if (positionArray.indexOf(req.user.position) === -1) return res.render("404");
    next();
});

router.post("/createWorkflow", (req, res) => {
    let { title, subtitle, detail, tag, duedate } = req.body;
    if (!(title && subtitle && detail)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    if (duedate) {
        duedate = new Date(duedate);
    }
    WorkflowManager.create(req.user._id, title, subtitle, detail, tag, duedate).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/delete", (req, res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return node.getHeader();
    }).flatMap(node => {
        return WorkflowManager.delete(node);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/editHeader", (req, res) => {
    let { workflowID, title } = req.body;
    if (!(workflowID && title)) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    WorkflowManager.getHeaderNode(workflowID).flatMap(header => {
        return header.setTitle(title)
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/editNode", (req, res) => {
    let { workflowID, subtitle, duedate } = req.body;
    if (!(workflowID && (subtitle || duedate))) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }

    if (duedate) {
        duedate = new Date(duedate);
    }

    if (subtitle && duedate) {
        WorkflowManager.getBodyNode(workflowID).flatMap(node => {
            return node.setSubtitle(subtitle);
        }).flatMap(node => {
            return node.setDuedate(duedate);
        }).subscribe(_ => {
            return res.status(200).send({
                msg: "OK"
            });
        });
    } else if (subtitle) {
        WorkflowManager.getBodyNode(workflowID).flatMap(node => {
            return node.setSubtitle(subtitle);
        }).subscribe(_ => {
            return res.status(200).send({
                msg: "OK"
            });
        });
    } else {
        WorkflowManager.getBodyNode(workflowID).flatMap(node => {
            return node.setDuedate(duedate);
        }).subscribe(_ => {
            return res.status(200).send({
                msg: "OK"
            });
        });
    }
});

router.post("/note", (req, res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }

    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return node.appendWithStatus(Status.NOTE);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/todo", (req, res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }

    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return node.appendWithStatus(Status.TODO);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/inProgress", (req, res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "OK"
        });
    }

    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return node.appendWithStatus(Status.IN_PROGRESS);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/assign", (req, res) => {
    let { workflowID, owner, subtitle, detail, duedate } = req.body;
    if (!(workflowID && owner)) {
        return res.status(400).send({
            err: 0,
            msg: "OK"
        });
    }
    if (duedate) duedate = new Date(duedate);

    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return node.appendWithStatus(Status.ASSIGN);
    }).flatMap(node => {
        return WorkflowManager.getBodyNode(node.getID())
    }).flatMap(node => {
        let ancestors = node.getAncestorsID();
        ancestors.push(node.getID());
        return WorkflowManager.createBodyNode(
            Status.TODO,
            parseInt(owner),
            node.getCreatedBy(),
            duedate,
            subtitle,
            detail,
            node.getID(),
            ancestors
        );
    }).flatMap(_ => {
        return IOSNotificationManager.getInstance().send(parseInt(owner), req.user.nicknameEn + " assign you a task.");
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/done", (req, res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "OK"
        });
    }

    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return node.appendWithStatus(Status.DONE);
    }).flatMap(node => {
        return WorkflowManager.getBodyNode(node.getID());
    }).flatMap(node => {
        return node.getBranchParent().map(parent => ({ node, parent }));
    }).flatMap(({ node, parent }) => {
        let ancestors = node.getAncestorsID();
        ancestors.push(node.getID());
        return WorkflowManager.createBodyNode(
            Status.TODO,
            parent.getOwner(),
            req.user._id,
            parent.getDuedate(),
            undefined,
            undefined,
            node.getID(),
            ancestors
        ).map(child => ({ child, parent }));
    }).flatMap(({ child, parent }) => {
        return IOSNotificationManager.getInstance().send(parent.getOwner(), req.user.nicknameEn);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        })
    })

    // WorkflowManager.getBodyNode(workflowID).flatMap(node => {
    //     return node.appendWithStatus(Status.DONE);
    // }).flatMap(node => {
    //     return WorkflowManager.getBodyNode(node.getID());
    // }).flatMap(node => {
    //     return node.getBranchParent();
    // }).flatMap(node => {
    //     let ancestors = node.getAncestors();
    //     ancestors.push(node.getID());
    //     return WorkflowManager.createBodyNode(
    //         Status.TODO,
    //         node.getOwner(),
    //         node.getCreatedBy(),
    //         node.getDuedate(),
    //         node.getSubtitle(),
    //         node.getDetail(),
    //         node.getID(),
    //         ancestors
    //     );
    // }).subscribe(_ => {
    //     return res.status(200).send({
    //         msg: "OK"
    //     });
    // });
});

// // router.post("/done", (req, res) => {
// //     if (!req.body.workflowID) {
// //         return res.status(400).send({
// //             err: 0,
// //             msg: "Bad Request"
// //         });
// //     }
// //     let userID: Number;
// //     // WorkflowManager.getNode(req.body.workflowID).then(node => {
// //     //     userID = node.createdBy;
// //     //     return WorkflowManager.addNode(
// //     //         req.user._id,
// //     //         node._id,
// //     //         req.user._id,
// //     //         "",
// //     //         Status.DONE
// //     //     );
// //     // }).then(node => {
// //     //     return WorkflowManager.addNode(
// //     //         req.user._id,
// //     //         node._id,
// //     //         userID as number,
// //     //         "",
// //     //         Status.TODO
// //     //     )
// //     // });

// // });