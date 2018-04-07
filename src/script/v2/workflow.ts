import { Router } from "express";
import { Observable } from "rx";
import { Status, WorkflowManager } from "./classes/WorkflowManager";

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

router.post("/todo", (req, res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return WorkflowManager.clone(node).map(child => ({ child, node }));
    }).flatMap(({ child, node }) => {
        return Observable.forkJoin([
            child.setStatus(Status.TODO),
            node.append(child)
        ]);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/inProgress", (req,res) => {
    let { workflowID } = req.body;
    if (!workflowID) {
        return res.status(400).send({
            err: 0,
            msg: "Bad Request"
        });
    }
    WorkflowManager.getBodyNode(workflowID).flatMap(node => {
        return WorkflowManager.clone(node).map(child => ({ child, node }));
    }).flatMap(({ child, node }) => {
        return Observable.forkJoin([
            child.setStatus(Status.IN_PROGRESS),
            node.append(child)
        ]);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});


// router.post("/assign", (req, res) => {
//     if (!(req.body.workflowID && req.body.owner)) {
//         return res.status(200).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }

//     let subtitle: string;
//     let detail: string;
//     let duedate: Date;

//     if (req.body.subtitle) subtitle = req.body.subtitle;
//     if (req.body.detail) detail = req.body.detail;
//     if (req.body.duedate) duedate = new Date(req.body.duedate);

//     WorkflowManager.getNode(req.body.workflowID).flatMap(parent => {
//         return WorkflowManager.addNode(
//             req.user._id,
//             parent._id,
//             req.user._id,
//             subtitle,
//             detail,
//             Status.ASSIGN,
//             duedate
//         );
//     }).flatMap(node => {
//         return WorkflowManager.addNode(
//             req.user._id,
//             node._id,
//             req.body.owner,
//             "",
//             "",
//             Status.TODO
//         )
//     }).flatMap(node => {
//         return UserManager.getTutorInfo(req.user._id);
//     }).flatMap(tutor => {
//         return IOSNotificationManager.getInstance().send(req.body.owner, tutor.getNicknameEn() + " assign you a task");
//     }).subscribe(node => {
//         return res.status(200).send({
//             msg: "OK"
//         });
//     });



// });


// router.post("/inProgress", (req, res) => {
//     if (!req.body.workflowID) {
//         return res.status(400).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }

//     WorkflowManager.getNode(req.body.workflowID).flatMap(parent => {
//         return WorkflowManager.addNode(
//             req.user._id,
//             parent._id,
//             req.user._id,
//             "", "",
//             Status.IN_PROGRESS
//         );
//     }).flatMap(node => {
//         return WorkflowManager.getParentNode(node._id);
//     }).flatMap(node => {
//         return IOSNotificationManager.getInstance().send(node.owner.valueOf(), req.user.nicknameEn + " change task status to in progress.");
//     }).subscribe(node => {
//         // TODO: Test function
//         return res.status(200).send({
//             msg: "OK"
//         });
//     });
// });


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

// router.post("/getChild", (req, res) => {
//     if (!req.body.workflowID) {
//         return res.status(400).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }
//     WorkflowManager.getChildNode(req.body.workflowID).subscribe(nodes => {
//         return res.status(200).send({
//             child: nodes
//         });
//     });
// });

// router.post("/getTree", (req, res) => {
//     if (!req.body.workflowID) {
//         return res.status(400).send({
//             err: 0,
//             msg: "Bad Request"
//         });
//     }
//     WorkflowManager.getTree(req.body.workflowID).subscribe(nodes => {
//         return res.status(200).send({
//             child: nodes
//         });
//     });
// });

// router.post("/getNode", (req, res) => {
//     let allNode: BodyNode[] = [];
//     let headerNode: HeaderNode[] = [];
//     WorkflowManager.getUserWorkflow(req.user._id).subscribe(nodes => {
//         let node = _.last(nodes);
//         for (let i = 0; i < nodes.length - 1; i++) {
//             if (nodes[i].detail === "") continue;
//             node.detail = nodes[i].detail + "\n" + node.detail;
//         }
//         allNode.push(node)
//     }, err => {
//         return res.status(500).send(err)
//     }, () => {
//         Observable.forkJoin(allNode.map(node => {
//             return WorkflowManager.findHeader(node._id)
//         })).subscribe(header => {
//             let nodes: any[] = [];
//             for (let i = 0; i < allNode.length; i++) {
//                 nodes.push({
//                     header: allNode[i].header,
//                     timestamp: allNode[i].timestamp,
//                     duedate: allNode[i].duedate,
//                     parent: allNode[i].parent,
//                     ancestors: allNode[i].ancestors,
//                     _id: allNode[i]._id,
//                     status: allNode[i].status,
//                     owner: allNode[i].owner,
//                     createdBy: allNode[i].createdBy,
//                     subtitle: allNode[i].subtitle,
//                     detail: allNode[i].detail,
//                     title: header[i].title
//                 });
//             }
//             return res.status(200).send({
//                 workflows: nodes
//             });
//         }, err => {
//             return res.status(500).send(err)
//         }, () => {

//         })
//     });
// });

// router.post("/test", (req, res) => {
//     WorkflowManager.getParentNode("5ab529c3f044fa18e6b6526d").subscribe(node => {
//         return res.status(200).send(node);
//     }, err => {
//         return res.status(500).send(err);
//     }, () => {
//     });
// });
