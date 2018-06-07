import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { CommentInstance, commentModel, ICommentModel } from '../../models/v1/comment';

export class Comment {

    public static getInstance(): Comment {
        if (!this.instance) {
            this.instance = new Comment();
        }
        return this.instance;
    }

    private static instance: Comment;

    private commentModel: Sequelize.Model<CommentInstance, ICommentModel>;

    private constructor() {
        this.commentModel = commentModel(Connection.getInstance().getConnection());
    }

    // public add(

    // )
}
