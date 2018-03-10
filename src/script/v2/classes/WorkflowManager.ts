import { Schema, Model, Document, Mongoose, connect, connection, Types } from "mongoose";
import * as mongoose from "mongoose";
import { Constant } from "./Constants";
import * as _ from "lodash";

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
export interface Node extends Document {
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
    status: String,
    owner: Number,
    subtitle: String,
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
    status: String,
    owner: Number,
    subtitle: String,
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
     * @param {number} userID user id identify who create the new workflow 
     * @param {string} title title of the new workflow 
     * @param {string} subtitle subtitle of the new workflow 
     * @param {string} detail detail of the workflow 
     * @param {string} [tag] <Optional> tag of the workflow, default Other 
     * @returns {Promise<BodyNode>} New node which have been create
     * @memberof WorkflowManager
     */
    static addWorkflow(userID: number, title: string, subtitle: string, detail: string, tag?: string): Promise<BodyNode> {
        var workflowTag = '';
        if (tag) {
            workflowTag = tag;
        } else {
            workflowTag = 'Other';
        }

        var header = new HeaderModel({
            createdBy: userID,
            title: title,
            tag: tag
        });

        return header.save().then(header => {
            return new NodeModel({
                status: Status.NOTE,
                owner: userID,
                createdBy: userID,
                subtitle: subtitle,
                parent: header._id,
                ancestors: [header._id]
            }).save();
        });
    }

    /**
     * Method for edit title of the header node 
     * 
     * @static
     * @param {number} userID user id who is the owner of the workflow
     * @param {string} workflowID workflow id of the header node
     * @param {string} title new title
     * @returns {Promise<UpdateResponse>} Promise that return result of updating node
     * @memberof WorkflowManager
     */
    static editHeader(userID: number, workflowID: string, title: string): Promise<UpdateResponse> {
        return HeaderModel.updateOne({
            _id: Types.ObjectId(workflowID),
            header: true,
            createdBy: userID
        }, {
                $set: {
                    title: title
                }
            }
        );
    }

    /**
     * Method for delete the entire tree of workflow
     * 
     * @static
     * @param {number} userID user id who want to delete the tree
     * @param {string} workflowID workflow id of the header node
     * @returns {Promise<[UpdateResponse]>} Promise that return the result of deleting nodes
     * @memberof WorkflowManager
     */
    static deleteWorkflow(userID: number, workflowID: string): Promise<[UpdateResponse]> {
        return HeaderModel.findOne({
            _id: Types.ObjectId(workflowID),
            createdBy: userID
        }).then(header => {
            if (header == null) throw new Error('Header not found');
            return mongoose.Promise.all([
                HeaderModel.deleteOne({
                    _id: Types.ObjectId(workflowID)
                }),
                NodeModel.deleteMany({
                    ancestors: Types.ObjectId(workflowID)
                })
            ]);
        }).catch(err => {
            throw err;
        });
    }

    /**
     * Method for edit subtitle of the bodhy node
     * 
     * @static
     * @param {number} userID user id who is the owner of the workflow 
     * @param {string} workflowID workflow id of the header node 
     * @param {string} subtitle new subtitle
     * @returns {Promise<UpdateResponse>} Promise that return result of updating node 
     * @memberof WorkflowManager
     */
    static editNode(userID: number, workflowID: string, subtitle: string): Promise<UpdateResponse> {
        return NodeModel.updateOne({
            _id: Types.ObjectId(workflowID),
            header: false,
            createdBy: userID
        }, {
                $set: {
                    subtitle: subtitle
                }
            }
        );
    }

    /**
     * Create new node after the parent node
     * 
     * @static
     * @param {number} userID id of user who create this node
     * @param {string} parentID object id string of the parent node
     * @param {number} owner user id of the one who has been assigned this node to
     * @param {string} subtitle title filed of the new node
     * @param {string} status status of the new node
     * @returns {Promise<BodyNode>} Promise that return the new node
     * @memberof WorkflowManager
     */
    static addNode(userID: number, parentID: string, owner: number, subtitle: string, status: string): Promise<BodyNode> {
        return NodeModel.findOne({
            _id: Types.ObjectId(parentID)
        }).then(parentNode => {
            parentNode.ancestors.push(parentNode._id);
            let node = new NodeModel({
                status: status,
                owner: owner,
                createdBy: userID,
                subtitle: subtitle,
                parent: parentNode._id,
                ancestors: parentNode.ancestors
            });
            return node.save();
        });
    }

    /**
     * Find all child node of the input node
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object ID of the input node
     * @returns {Promise<BodyNode[]>} Promise that return array of the node
     * @memberof WorkflowManager
     */
    static getChildNode(workflowID: string | Types.ObjectId): Promise<BodyNode[]> {
        return NodeModel.find({
            ancestors: workflowID as Types.ObjectId
        });
    }

    /**
     * Find the header node of input node
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object ID of the input node
     * @returns {Promise<HeaderNode>} Promise that return header node
     * @memberof WorkflowManager
     */
    static findHeader(workflowID: string | Types.ObjectId): Promise<HeaderNode> {
        return NodeModel.findOne({
            _id: workflowID as Types.ObjectId
        }).then(node => {
            return HeaderModel.findOne({
                _id: node.ancestors[0]
            });
        });
    }

    /**
     * Find all node in the tree
     * 
     * @static
     * @param {(string | Types.ObjectId)} workflowID Object ID of the element in tree
     * @returns {Promise<BodyNode[]>} Promise that return all node in the tree
     * @memberof WorkflowManager
     */
    static getTree(workflowID: string | Types.ObjectId): Promise<BodyNode[]> {
        return this.findHeader(workflowID).then(header => {
            return this.getChildNode(header._id);
        });
    }

    /**
     * Find node responsible by that user
     * 
     * @static
     * @param {number} userID user id of the interest user
     * @returns {Promise<BodyNode[]>} Promise that return array of node
     * @memberof WorkflowManager
     */
    static getUserWorkflow(userID: number): Promise<BodyNode[]> {
        return NodeModel.find({
            owner: userID
        }).then(nodes => {
            let groupNode = _.groupBy(nodes, o => {
                return o.ancestors[0];
            });
            let userNode: BodyNode[] = [];
            for(let key in groupNode){
                userNode.push(_.last(groupNode[key]));
            }
            return userNode;
        });
    }
}