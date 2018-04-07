import { Schema, Model, Document, Mongoose, connect, connection } from "mongoose";
import * as mongoose from "mongoose";
import { Constant, UpdateResponse } from "./Constants";
import * as _ from "lodash";
import { Observable } from "rx";
import { Tutor, UserManager } from "./UserManager";


/**
 * Define enum for status available in workflow node
 * 
 * @export
 * @enum {number}
 */
export enum Status {
    NONE = "none",
    NOTE = "note",
    TODO = "todo",
    IN_PROGRESS = "inprogress",
    ASSIGN = "assign",
    DONE = "done",
    COMPLETE = "complete"
}

/**
 * Decalre interface for node
 * 
 * @export
 * @interface NodeInterface
 * @extends {Document}
 */
interface NodeInterface extends Document {
    header: Boolean,
    timestamp: Date,
    createdBy: Number
}

/**
 * Decalre interface for header node
 * 
 * @export
 * @interface HeaderInterface
 * @extends {Node}
 */
export interface HeaderInterface extends NodeInterface {
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
export interface BodyInterface extends NodeInterface {
    duedate?: Date,
    status: String,
    owner: Number,
    subtitle: String,
    detail: String,
    parent?: mongoose.Types.ObjectId,
    ancestors?: [mongoose.Types.ObjectId]
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
let HeaderModel = mongoose.model<HeaderInterface>("Header", headerSchema, "workflow");
let NodeModel = mongoose.model<BodyInterface>("Node", nodeSchema, "workflow");

abstract class Node<T extends NodeInterface> {

    protected node: T

    constructor(node: T) {
        this.node = node;
    }

    getID(): mongoose.Types.ObjectId {
        return this.node._id;
    }

    getCreatedUser(): Observable<Tutor> {
        return UserManager.getTutorInfo(this.node.createdBy.valueOf());
    }

    getChild(): Observable<BodyNode[]> {
        return Observable.fromPromise(NodeModel.find({
            ancestors: this.getID
        })).map(nodes => nodes.map(node => new BodyNode(node)));
    }
}

export class HeaderNode extends Node<HeaderInterface> {

    constructor(header: HeaderInterface) {
        super(header);
    }

    getInterface(): HeaderInterface {
        return this.node
    }

    setTitle(title: string): Observable<HeaderNode> {
        return Observable.fromPromise(HeaderModel.findByIdAndUpdate(this.getID(), {
            $set: {
                title: title
            }
        })).map(header => new HeaderNode(header));
    }
}

export class BodyNode extends Node<BodyInterface> {

    constructor(body: BodyInterface) {
        super(body);
    }

    getInterface(): BodyInterface {
        return this.node
    }

    getParentID(): mongoose.Types.ObjectId {
        return this.node.parent;
    }

    getAncestors(): mongoose.Types.ObjectId[] {
        return this.node.ancestors;
    }

    getHeaderID(): mongoose.Types.ObjectId {
        return this.getAncestors()[0];
    }

    getStatus(): string {
        return this.node.status.valueOf();
    }

    getOwner(): number {
        return this.node.owner.valueOf();
    }

    getCreatedBy(): number {
        return this.node.createdBy.valueOf();
    }

    getDuedate(): Date {
        return this.node.duedate;
    }

    getSubtitle(): string {
        return this.node.subtitle.valueOf();
    }

    getDetail(): string {
        return this.node.detail.valueOf();
    }

    append(childNode: BodyNode): Observable<BodyNode> {
        return childNode.setParent(new BodyNode(this.node));
    }

    setParent(parentNode: BodyNode): Observable<BodyNode> {
        let ancestors = parentNode.getAncestors();
        ancestors.push(parentNode.getID());
        return this.edit({
            parent: parentNode.getID(),
                ancestors: ancestors
        });
    }

    getParent(): Observable<BodyNode> | Observable<null> {
        return this.hasParent().flatMap(hasParent => {
            if (hasParent) {
                return null;
            } else {
                return Observable.fromPromise(NodeModel.findById(this.getParentID())).map(parent => new BodyNode(parent));
            }
        });
    }

    getHeader(): Observable<HeaderNode> {
        return Observable.fromPromise(HeaderModel.findById(this.getHeaderID())).map(header => new HeaderNode(header));
    }

    hasParent(): Observable<boolean> {
        return Observable.fromPromise(NodeModel.findById(this.getID())).map(parent => {
            return parent.header.valueOf()
        });
    }

    setSubtitle(subtitle: string): Observable<BodyNode> {
        return this.edit({
            subtitle: subtitle
        });
    }

    setDuedate(duedate: Date): Observable<BodyNode> {
        return this.edit({
            duedate: duedate
        });
    }

    setStatus(status: string): Observable<BodyNode> {
        return this.edit({
            status: status
        });
    }

    private edit(value: any): Observable<BodyNode> {
        return Observable.fromPromise(NodeModel.findByIdAndUpdate(this.getID(), {
            $set: value
        })).map(node => new BodyNode(node));
    }
}

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
    static create(userID: number,
        title: string,
        subtitle: string,
        detail?: string,
        tag?: string,
        duedate?: Date): Observable<BodyNode> {
        let workflowTag: string;
        let workflowDuedate: Date;

        if (tag) workflowTag = tag;
        else workflowTag = "Other";

        if (duedate) workflowDuedate = duedate;
        else workflowDuedate = null;

        let header = new HeaderModel({
            createdBy: userID,
            title: title,
            tag: tag
        });
        return Observable.fromPromise(header.save()).flatMap(header => {
            return this.createBodyNode(Status.NOTE, userID, userID, workflowDuedate, subtitle, detail, header._id, [header._id]);
        });
    }


    /**
     * Method for delete entire workflow
     * 
     * @static
     * @param {HeaderNode} header Header node of the workflow
     * @returns {Observable<UpdateResponse[]>} responses of deleting sequence
     * @memberof WorkflowManager
     */
    static delete(header: HeaderNode): Observable<UpdateResponse[]> {
        return Observable.zip(
            Observable.fromPromise(HeaderModel.deleteOne({
                _id: header.getID()
            })),
            Observable.fromPromise(NodeModel.deleteMany({
                ancestors: header.getID()
            }))
        );
    }

    static getHeaderNode(nodeID: mongoose.Types.ObjectId | string): Observable<HeaderNode> {
        if (typeof nodeID === "string") nodeID = new mongoose.Types.ObjectId(nodeID);
        return Observable.fromPromise(HeaderModel.findById(nodeID)).map(node => new HeaderNode(node));
    }

    static getBodyNode(nodeID: mongoose.Types.ObjectId | string): Observable<BodyNode> {
        if (typeof nodeID === "string") nodeID = new mongoose.Types.ObjectId(nodeID);
        return Observable.fromPromise(NodeModel.findById(nodeID)).map(node => new BodyNode(node));
    }

    static createBodyNode(status: string, owner: number, createdBy: number, duedate: Date, subtitle: string, detail: string,
        parent: mongoose.Types.ObjectId, ancestors: mongoose.Types.ObjectId[]): Observable<BodyNode> {
        let node = new NodeModel({
            status: status,
            owner: owner,
            createdBy: createdBy,
            duedate: duedate,
            subtitle: subtitle,
            detail: detail,
            parent: parent,
            ancestors: ancestors
        });
        return Observable.fromPromise(node.save()).map(node => new BodyNode(node));
    }

    static clone(node: BodyNode): Observable<BodyNode> {
        return this.createBodyNode(node.getStatus(), node.getOwner(), node.getCreatedBy(), node.getDuedate(), node.getSubtitle(), node.getDetail(), node.getParentID(), node.getAncestors())
    }

    //     /**
    //      * Find workflow node of requested user
    //      * 
    //      * @static
    //      * @param {number} userID User id of user
    //      * @returns {Observable<BodyNode[]>} Observable of event that return array of node
    //      * @memberof WorkflowManager
    //      */
    //     static getUserWorkflow(userID: number): Observable<BodyNode[]> {
    //         return Observable.fromPromise(NodeModel.find({
    //             owner: userID
    //         })).flatMap(nodes => {
    //             let groupNode = _.groupBy(nodes, o => {
    //                 return o.ancestors[0];
    //             });
    //             let userNode: BodyNode[] = [];
    //             for (let key in groupNode) {
    //                 userNode.push(_.last(groupNode[key]));
    //             }
    //             return userNode;
    //         }).flatMap(nodes => {
    //             return this.getTree(nodes._id)
    //         });
    //     }
}