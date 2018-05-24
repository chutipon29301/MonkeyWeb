import { DateTime2, Int, NVarChar, VarChar } from 'mssql';
import { Observable } from 'rx';
import { Connection } from '../Connection';

const preparedStatement = {
    addClass: () => Connection.getInstance().prepareStatement(
        'INSERT INTO Class (ClassName, QuarterID, ClassDate, ClassSubject, ClassType) ' +
        'VALUES (@className, @quarterID, @classDate, @classSubject, @classType)',
        [
            { key: 'className', type: NVarChar(64) },
            { key: 'quarterID', type: Int },
            { key: 'classDate', type: DateTime2(7) },
            { key: 'classSubject', type: VarChar(8) },
            { key: 'classType', type: VarChar(16) },
        ]),
    addCourse: () => Connection.getInstance().prepareStatement(
        'INSERT INTO Class (ClassName, QuarterID, ClassDate, ClassSubject, Grade, TutorID, ClassTimes, ClassType) ' +
        'VALUES (@className, @quarterID, @classDate, @classSubject, @grade, @tutorID, @classTimes, \'Course\')',
        [
            { key: 'className', type: NVarChar(64) },
            { key: 'quarterID', type: Int },
            { key: 'classDate', type: DateTime2(7) },
            { key: 'classSubject', type: VarChar(8) },
            { key: 'grade', type: VarChar(64) },
            { key: 'tutorID', type: Int },
            { key: 'classTimes', type: Int },
        ]),
};

export function addCourse(
    className: string,
    quarterID: number,
    classDate: Date,
    classSubject: string,
    grade: string,
    tutorID: number,
    classTimes: number,
): Observable<void[]> {
    return Connection.getInstance().observableOf<void>(preparedStatement.addCourse(),
        { className, quarterID, classDate, classSubject, grade, tutorID, classTimes },
    );
}

export function addHybrid(
    className: string,
    quarterID: number,
    classDate: Date,
    classSubject: string,
): Observable<void[]> {
    return Connection.getInstance().observableOf<void>(preparedStatement.addClass(),
        { className, quarterID, classDate, classSubject, classType: 'hybrid' });
}

export function addSkill(
    className: string,
    quarterID: number,
    classDate: Date,
    classSubject: string,
): Observable<void[]> {
    return Connection.getInstance().observableOf<void>(preparedStatement.addClass(),
        { className, quarterID, classDate, classSubject, classType: 'skill' });
}
