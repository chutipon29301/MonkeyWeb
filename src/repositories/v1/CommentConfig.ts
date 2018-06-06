import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { CommentConfigInstance, commentConfigModel, ICommentConfigModel } from '../../models/v1/commentConfig';

export class CommentConfig {

    public static getInstance(): CommentConfig {
        if (!this.instance) {
            this.instance = new CommentConfig();
        }
        return this.instance;
    }

    private static instance: CommentConfig;

    private commentConfigModel: Sequelize.Model<CommentConfigInstance, ICommentConfigModel>;

    private constructor() {
        this.commentConfigModel = commentConfigModel(Connection.getInstance().getConnection());
    }
}
