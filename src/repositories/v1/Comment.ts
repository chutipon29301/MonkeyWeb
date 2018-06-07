import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

    public add(
        StudentID: number,
        QuarterID: number,
        SenderID: number,
        CommentType: string,
        commentValue: {
            CommentImagePath?: string,
            CommentTextID?: number,
        },
    ): Observable<ICommentModel> {
        if (commentValue.CommentImagePath && commentValue.CommentTextID) {
            return from(this.commentModel.create({
                CommentImagePath: commentValue.CommentImagePath,
                CommentTextID: commentValue.CommentTextID,
                CommentType,
                QuarterID,
                SenderID,
                StudentID,
            }));
        }
    }

    public edit(
        ID: number,
        value: Partial<ICommentModel>,
    ): Observable<number> {
        let updateValue = {} as Partial<ICommentModel>;
        if (value.CommentType) {
            updateValue = { ...updateValue, CommentType: value.CommentType };
        }
        if (value.CommentTextID) {
            updateValue = { ...updateValue, CommentTextID: value.CommentTextID };
        }
        if (value.CommentImagePath) {
            updateValue = { ...updateValue, CommentImagePath: value.CommentImagePath };
        }
        if (value.QuarterID) {
            updateValue = { ...updateValue, QuarterID: value.QuarterID };
        }
        if (value.StudentID) {
            updateValue = { ...updateValue, StudentID: value.StudentID };
        }
        if (value.Remark) {
            updateValue = { ...updateValue, Remark: value.Remark };
        }
        if (value.SenderID) {
            updateValue = { ...updateValue, SenderID: value.SenderID };
        }
        return from(this.commentModel.update(updateValue, { where: { ID } }))
            .pipe(
                map((result) => result[0]),
        );
    }

    public delete(
        ID: number,
    ): Observable<number> {
        return from(this.commentModel.destroy({ where: { ID } }));
    }
}
