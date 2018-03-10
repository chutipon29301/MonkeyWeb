import { Schema, Model, Document, Mongoose, connect, connection, Types } from "mongoose";
import * as mongoose from "mongoose";
import { Constant } from "./Constants";

/** 
 * Define enum for status in workflow
 */
enum Status {
    NONE = 'none',
    NOTE = 'note',
    TODO = 'todo',
    IN_PROGRESS = 'inprogress',
    ASSIGN = 'assign',
    DONE = 'done',
    COMPLETE = 'complete'
}

/** 
 * Declare all mongoose model interfase
 */
export interface Node extends Document {
    header: Boolean,
    timestamp: Date,
    createdBy: Number
}

export interface HeaderNode extends Node {
    title: String,
    tag: String
}

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
 * Create Manager class
 */
export class WorkflowManager {

    /**
     * This method create 2 node, header and body, and saved into database
     * After save the data return promise of data contain the latest node
     * @param userID user id identify who create the new work flow
     * @param title title of the new workflow
     * @param subtitle subtitle of the new workflow
     * @param detail detail of the workflow
     * @param tag <Optional> tag of the workflow
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
     * @param workflowID object id of the header node
     * @param title new title of the header node
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
     * Method for delete the entire tree of the header 
     * @param workflowID object id of the header node
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
     * @param workflowID object id of the body node
     * @param subtitle new subtitle to be set in the body node
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

    
}