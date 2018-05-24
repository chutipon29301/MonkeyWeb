import { Observable } from 'rxjs';
import { Connection } from '../Connection';
import { IQuarter } from './types/quarter';

const preparedStatement = {
    list: () => Connection.getInstance().prepareStatement('SELECT ID, QuarterName, Type, StartDate, EndDate FROM Quarter', []),
};

export function listQuarter(): Observable<IQuarter[]> {
    return Connection.getInstance().observableOf<IQuarter>(preparedStatement.list());
}
