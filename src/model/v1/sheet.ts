import { Char, Int, Numeric, NVarChar, VarChar } from 'mssql';
import { Observable } from 'rx';
import { Connection } from '../Connection';
import { ITopic, ITopicID } from './types/sheet';

const preparedStatement = {
    addSheet: () => Connection.getInstance().prepareStatement(
        'INSERT INTO HybridSheet (TopicID, SheetLevel, SheetNumber, SubLevel, Rev, SheetPath) ' +
        'VALUES (@topicID, @sheetLevel, @sheetNumber, @subLevel, @rev, @sheetPath)',
        [
            { key: 'topicID', type: Int },
            { key: 'sheetLevel', type: Char(1) },
            { key: 'sheetNumber', type: Numeric(2, 0) },
            { key: 'subLevel', type: VarChar(2) },
            { key: 'rev', type: Numeric(2, 1) },
            { key: 'sheetPath', type: VarChar(128) },
        ],
    ),
    addTopic: () => Connection.getInstance().prepareStatement(
        'INSERT INTO Topic (TopicSubject, Class, Topic, TopicName) ' +
        'VALUES (@topicSubject, @class, @topic, @topicName)',
        [
            { key: 'topicSubject', type: Char(1) },
            { key: 'class', type: Char(1) },
            { key: 'topic', type: VarChar(5) },
            { key: 'topicName', type: NVarChar(64) },
        ],
    ),
    checkExistTopic: () => Connection.getInstance().prepareStatement(
        'SELECT ID FROM Topic WHERE TopicSubject = @topicSubject AND Class = @class AND Topic = @topic',
        [
            { key: 'topicSubject', type: Char(1) },
            { key: 'class', type: Char(1) },
            { key: 'topic', type: VarChar(5) },
        ],
    ),
};

export function addTopic(
    topicSubject: string,
    topicClass: string,
    topic: string,
    topicName: string,
): Observable<void> {
    return Connection.getInstance().observableOf(preparedStatement.addTopic(),
        { topicSubject, class: topicClass, topic, topicName },
    ).map((res) => null);
}

export function addSheet(
    topicID: number,
    sheetLevel: string,
    sheetNumber: number,
    subLevel: string,
    rev: number,
    sheetPath: string,
): Observable<void> {
    return Connection.getInstance().observableOf(preparedStatement.addSheet(),
        { topicID, sheetLevel, sheetNumber, subLevel, rev, sheetPath },
    ).map((res) => null);
}

export function checkExistTopic(
    topicSubject: string,
    topicClass: string,
    topic: string,
): Observable<ITopicID | null> {
    return Connection.getInstance().observableOf<ITopicID>(preparedStatement.checkExistTopic(),
        { topicSubject, class: topicClass, topic },
    ).map((res) => {
        if (res.length === 0) {
            return null;
        } else {
            return res[0];
        }
    });
}
