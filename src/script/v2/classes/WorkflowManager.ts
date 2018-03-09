import { Schema, Model, Document, Mongoose, connect, connection, Types } from "mongoose";
import * as mongoose from "mongoose";
import { Constant } from "./Constants";

enum Status {
    NONE = 'none',
    NOTE = 'note',
    TODO = 'todo',
    IN_PROGRESS = 'inprogress',
    ASSIGN = 'assign',
    DONE = 'done',
    COMPLETE = 'complete'
}

export interface Node extends Document {
    header: Boolean,
    timestamp: Date
}

export interface HeaderNode extends Node {
    createdBy: Number,
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

export interface UpdateResponse{
    n: number,
    nModified: number,
    ok: number
}

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
})
export let HeaderModel = mongoose.model<HeaderNode>('Header', headerSchema, 'workflow');
export let NodeModel = mongoose.model<BodyNode>('Node', nodeSchema, 'workflow');
export class WorkflowManager {

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
                subtitle: subtitle,
                parent: header._id,
                ancestors: [header._id]
            }).save();
        });
    }

    static editHeader(workflowID: string, title: string): Promise<UpdateResponse>{
        return HeaderModel.updateOne({
            _id: Types.ObjectId(workflowID)
        },{
            $set: {
                title: title
            }
        });
    }

}