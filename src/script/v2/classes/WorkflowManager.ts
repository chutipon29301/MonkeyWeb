import { Schema, Model, Document, Mongoose, connect, connection } from "mongoose";
import * as mongoose from "mongoose";
import { Constant } from "./Constants";
import * as _ from "lodash";
import { Observable } from "rx";


/**
 * Define enum for status available in workflow node
 * 
 * @export
 * @enum {number}
 */
export enum Status {
    NONE = 'none',
    NOTE = 'note',
    TODO = 'todo',
    IN_PROGRESS = 'inprogress',
    ASSIGN = 'assign',
    DONE = 'done',
    COMPLETE = 'complete'
}

/**
 * Decalre interface for node
 * 
 * @export
 * @interface Node
 * @extends {Document}
 */
interface Node extends Document {
    header: Boolean,
    timestamp: Date,
    createdBy: Number
}

/**
 * Decalre interface for header node
 * 
 * @export
 * @interface HeaderNode
 * @extends {Node}
 */
export interface HeaderNode extends Node {
    title: String,
    tag: String
}

/**
 * Decalre interface for body node
 * 
 * @export
 * @interface BodyNode
 * @extends {Node}
 */
export interface BodyNode extends Node {
    duedate: Date,
    status: String,
    owner: Number,
    subtitle: String,
    detail: String,
    parent: Schema.Types.ObjectId,
    ancestors: [Schema.Types.ObjectId]
}

/**
 * Declare response interface
 */
export interface UpdateResponse {
    n: number,
    nModified: number,
    ok: number
}

/**
 * Create mongoose schema
 */
let headerSchema = new Schema({
    header: {
        type: Boolean,
        default: true
    },
    timestamp: {
        type: Date,
        default: new Date()
    },
    createdBy: Number,
    title: String,
    tag: String
});

let nodeSchema = new Schema({
    header: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: new Date()
    },
    createdBy: Number,
    duedate: {
        type: Date,
        default: null
    },
    status: String,
    owner: Number,
    subtitle: String,
    detail: String,
    parent: {
        type: Schema.Types.ObjectId,
        default: null
    },
    ancestors: {
        type: [Schema.Types.ObjectId],
        default: []
    }
});

/**
 * Create model from schema
 */
export let HeaderModel = mongoose.model<HeaderNode>('Header', headerSchema, 'workflow');
export let NodeModel = mongoose.model<BodyNode>('Node', nodeSchema, 'workflow');

/**
 * Class provide method for handle all workflow database operation
 * 
 * @export
 * @class WorkflowManager
 */
export class WorkflowManager {

    /**
     * This method create 2 node, header and body, and saved into database
     * After save the data return promise of data contain the latest node
     * 
     * @static
     * @param {number} userID User id who create workflow
     * @param {string} title Title of the header node
     * @param {string} subtitle Subtitle of the node
     * @param {string} [detail] <Optional> Detail of the node
     * @param {string} [tag] <Optional> Tag of the header node, default Other
     * @param {Date} [duedate] <Optional> Duedate of the node
     * @returns {Observable<BodyNode>} Obserable of event that return the node
     * @memberof WorkflowManager
     */
    static addWorkflow(userID: number,
        title: string,
        subtitle: string,
        detail?: string,
        tag?: string,
        duedate?: Date): Observable<BodyNode> {
        let workflowTag: string;
        let workflowDuedate: Date;

        if (tag) workflowTag = tag;
        else workflowTag = 'Other';

        if (duedate) workflowDuedate = duedate;
        else workflowDuedate = null;

        let header = new HeaderModel({
            createdBy: userID,
            title: title,
            tag: tag
        });
        return Observable.fromPromise(header.save()).flatMap(header => {
            let node = new NodeModel({
                status: Status.NOTE,
                owner: userID,
                createdBy: userID,
                duedate: workflowDuedate,
                subtitle: subtitle,
                detail: detail,
                parent: header._id,
                ancestors: [header._id]
            });
            return Observable.fromPromise(node.save())
        });
    }

    /**
     * Method for edit title of the header node
     * 
     * @static
     * @param {number} userID user id who request to edit 
     * @param {(string | Types.ObjectId)} workflowID 
     * @param {string} title 
     * @returns {Observable<UpdateResponse>} 
     * @memberof WorkflowManager
     */
    static editHeader(userID: number, workflowID: string | mongoose.Types.ObjectId, title: string): Observable<UpdateResponse> {
        if (typeof workflowID === 'string') workflowID = new mongoose.Types.ObjectId(workflowID);
        return Observable.fromPromise(
            HeaderModel.updateOne({
                _id: workflowID
            }, {
                    $set: {
                        title: title
                    }
                }
            )
        );
    }

    /**
     * Method for delete the entire tree of workflow
     * 
     * @static
     * @param {number} userID User id who request delete this workflow
     * @param {(string | Types.ObjectId)} workflowID Object id of the header in tree
     * @returns {Observable<UpdateResponse[]>} Observable of event that return array of response
     * @memberof WorkflowManager
     */
    static deleteWorkflow(userID: number, workflowID: string | mongoose.Types.ObjectId): Observable<UpdateResponse[]> {
        return this.getHeader(workflowID).flatMap(header => {
            if (header === null) throw Observable.throw(new Error('Header not found'));
            return Observable.zip(
                Observable.fromPromise(HeaderModel.deleteOne({
                    _id: header._id
                })),
                Observable.fromPromise(NodeModel.deleteMany({
                    ancestors: header._id
                }))
            );
        });
    }

    /**
     * Method for edit subtitle and duedate of node
     * 
     * @static
     * @param {number} userID User id who request to edit this node
     * @param {(string | Types.ObjectId)} workflowID Object id of the node
     * @param {string} subtitle New subtitle
     * @param {Date} [duedate] <Optional> New duedate
     * @returns {Observable<UpdateResponse>} Obserable of event result UpdateResponse
     * @memberof WorkflowManager
     */
    static editNode(userID: number, workflowID: string | mongoose.Types.ObjectId, subtitle: string, duedate?: Date): Observable<UpdateResponse> {
        let newValue: {
            subtitle: string,
            duedate: Date
        }

        if (subtitle) newValue.subtitle = subtitle;
        if (duedate) newValue.duedate = duedate;
        if (typeof workflowID === 'string') workflowID = new mongoose.Types.ObjectId(workflowID);

        return Observable.fromPromise(
            NodeModel.updateOne({
                _id: workflowID,
                header: false,
                createdBy: userID
            }, {
                    $set: newValue
                }
            )
        );
    }

    /**
     * Create node after parent node
     * 
     * @static
     * @param {number} userID User id who request to add node
     * @param {(string | Types.ObjectId)} parentID Object id of parent node
     * @param {number} owner User id of the node owner
     * @param {string} subtitle Subtitle of the node
     * @param {string} detail Detail of the node
     * @param {string} status Status of the node
     * @param {Date} [duedate] <Optional> Duedate of the node
     * @returns {Observable<BodyNode>} Obserable of event that return node
     * @memberof WorkflowManager
     */
    static addNode(userID: number,
        parentID: string | mongoose.Types.ObjectId,
        owner: number,
        subtitle: string,
        detail: string,
        status: string,
        duedate?: Date): Observable<BodyNode> {
        return this.getNode(parentID).flatMap(parent => {
            parent.ancestors.push(parent._id);
            let nodeDuedate: Date;
            if (duedate) {
                nodeDuedate = duedate;
            } else {
                nodeDuedate = parent.duedate;
            }
            let node = new NodeModel({
                status: status,
                owner: owner,
                createdBy: userID,
                duedate: nodeDuedate,
                subtitle: subtitle,
                detail: detail,
                parent: parent._id,
                ancestors: parent.ancestors
            });
            return Observable.fromPromise(node.save());
        });
    }



    /**
     * Get node info
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object id of the node
     * @returns {Observable<BodyNode>} Observable of event that return node
     * @memberof WorkflowManager
     */
    static getNode(workflowID: string | mongoose.Types.ObjectId, userID?: number): Observable<BodyNode> {
        if (typeof workflowID === 'string') workflowID = new mongoose.Types.ObjectId(workflowID);
        let query: {
            _id: mongoose.Types.ObjectId,
            header: boolean,
            userID?: number
        } = {
            _id: workflowID,
            header: false
        }
        if (userID) query.userID = userID;
        return Observable.fromPromise(NodeModel.findOne(query));
    }

    /**
     * Get header node
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID 
     * @returns {Observable<HeaderNode>} 
     * @memberof WorkflowManager
     */
    static getHeader(workflowID: string | mongoose.Types.ObjectId, userID?: number): Observable<HeaderNode> {
        if (typeof workflowID === 'string') workflowID = new mongoose.Types.ObjectId(workflowID);
        console.log(workflowID);
        let query: {
            _id: mongoose.Types.ObjectId,
            header: boolean,
            userID?: number
        } = {
            _id: workflowID,
            header: true
        }
        if (userID) query.userID;
        return Observable.fromPromise(HeaderModel.findOne(query));
    }

    /**
     * Find all child node
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object id of the node
     * @returns {Observable<BodyNode[]>} Observable of the event return array of node
     * @memberof WorkflowManager
     */
    static getChildNode(workflowID: string | mongoose.Types.ObjectId): Observable<BodyNode[]> {
        if (typeof workflowID === 'string') workflowID = new mongoose.Types.ObjectId(workflowID);
        return Observable.fromPromise(NodeModel.find({
            ancestors: workflowID
        }));
    }

    /**
     * Find the header node
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object ID of the input node
     * @returns {Observable<HeaderNode>} Observable of event that return HeaderNode
     * @memberof WorkflowManager
     */
    static findHeader(workflowID: string | mongoose.Types.ObjectId): Observable<HeaderNode> {
        return this.getNode(workflowID).flatMap(node => {
            return Observable.fromPromise(HeaderModel.findOne({
                _id: node.ancestors[0],
                header: true
            }));
        });
    }

    /**
     * Find tree contain node
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object id or element in tree
     * @returns {Observable<BodyNode[]>} Observable of event that return array of node in the tree
     * @memberof WorkflowManager
     */
    static getTree(workflowID: string | mongoose.Types.ObjectId): Observable<BodyNode[]> {
        return this.findHeader(workflowID).flatMap(header => {
            return this.getChildNode(header._id);
        });
    }

    /**
     * Find workflow node of requested user
     * 
     * @static
     * @param {number} userID User id of user
     * @returns {Observable<BodyNode[]>} Observable of event that return array of node
     * @memberof WorkflowManager
     */
    static getUserWorkflow(userID: number): Observable<BodyNode[]> {
        return Observable.fromPromise(NodeModel.find({
            owner: userID
        })).flatMap(nodes => {
            let groupNode = _.groupBy(nodes, o => {
                return o.ancestors[0];
            });
            let userNode: BodyNode[] = [];
            for (let key in groupNode) {
                userNode.push(_.last(groupNode[key]));
            }
            return userNode;
        }).flatMap(nodes => {
            return this.getTree(nodes._id)
        });
    }
}