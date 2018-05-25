import { from, Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { HybridSheetInstance, IHybridSheetModel, sheetModel } from '../../models/v1/sheet';
import { ITopicModel, TopicInstance, topicModel } from '../../models/v1/topic';

// tslint:disable:object-literal-sort-keys
export class Sheet {

    public static getInstance(): Sheet {
        if (!this.instance) {
            this.instance = new Sheet();
        }
        return this.instance;
    }

    private static instance: Sheet;
    private sheetModel: Sequelize.Model<HybridSheetInstance, IHybridSheetModel>;
    private topicModel: Sequelize.Model<TopicInstance, ITopicModel>;

    private constructor() {
        this.sheetModel = sheetModel(Connection.getInstance().getConnection());
        this.topicModel = topicModel(Connection.getInstance().getConnection());
    }

    public addSheetWithTopic(
        topicSubject: string,
        topicClass: string,
        topic: string,
        sheetLevel: string,
        sheetNumber: number,
        subLevel: string | null,
        rev: number | null,
        topicName: string | null,
        sheetPath: string,
    ): Observable<IHybridSheetModel> {
        return this.ensureTopic(topicSubject, topicClass, topic, topicName)
            .pipe(flatMap((result) => {
                return this.addSheet(result.ID, sheetLevel, sheetNumber, subLevel, rev, sheetPath);
            }));
    }

    public ensureTopic(
        topicSubject: string,
        topicClass: string,
        topic: string,
        topicName: string,
    ): Observable<ITopicModel> {
        return from(this.topicModel.findCreateFind<ITopicModel>({
            where: {
                TopicSubject: topicSubject,
                Class: topicClass,
                Topic: topic,
            },
            defaults: {
                TopicSubject: topicSubject,
                Class: topicClass,
                Topic: topic,
                TopicName: topicName,
            },
        })).pipe(map((result) => result[0]));
    }

    public addSheet(
        topicID: number,
        sheetLevel: string,
        sheetNumber: number,
        subLevel: string | null,
        rev: number | null,
        sheetPath: string,
    ): Observable<IHybridSheetModel> {
        return from(this.sheetModel.create({
            TopicID: topicID,
            SheetLevel: sheetLevel,
            SheetNumber: sheetNumber,
            SubLevel: subLevel,
            Rev: rev,
            SheetPath: sheetPath,
        }));
    }
}
