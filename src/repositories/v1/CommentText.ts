import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { CommentTextInstance, commentTextModel, ICommentTextModel } from '../../models/v1/commentText';

export class CommentText {

    public static getInstance(): CommentText {
        if (!this.instance) {
            this.instance = new CommentText();
        }
        return this.instance;
    }

    private static instance: CommentText;

    private commentTextModel: Sequelize.Model<CommentTextInstance, ICommentTextModel>;

    private constructor() {
        this.commentTextModel = commentTextModel(Connection.getInstance().getConnection());
    }
}
