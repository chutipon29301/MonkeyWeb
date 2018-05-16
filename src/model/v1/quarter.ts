import { Observable } from 'rx';
import { Connection } from '../Connection';
import { IQuarter } from './interface/quarter';

const preparedStatement = {
    list: () => Connection.getInstance().prepareStatement('SELECT QuarterName, Type, StartDate, EndDate FROM Quarter', []),
};

export function listQuarter(): Observable<IQuarter[]> {
    return Connection.getInstance().observableOf<IQuarter>(preparedStatement.list());
}
