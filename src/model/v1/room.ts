import { Int } from 'mssql';
import { Observable } from 'rx';
import { Connection } from '../Connection';
import { IRoom } from './types/room';

const preparedStatement = {
    listRoom: () => Connection.getInstance().prepareStatement('SELECT RoomName, MaxSeat FROM Room JOIN Quarter ON Room.QuarterID = Quarter.ID WHERE StartDate < CURRENT_TIMESTAMP AND EndDate > CURRENT_TIMESTAMP', []),
    listRoomWithQuarter: () => Connection.getInstance().prepareStatement('SELECT RoomName, MaxSeat FROM Room JOIN Quarter ON Room.QuarterID = Quarter.ID WHERE QuarterID = @quarterID', [{ key: 'quarterID', type: Int }]),
};

export function listRoom(): Observable<IRoom[]> {
    return Connection.getInstance().observableOf<IRoom>(preparedStatement.listRoom());
}

export function listRoomWithQuarterID(quarterID: number): Observable<IRoom[]> {
    return Connection.getInstance().observableOf<IRoom>(preparedStatement.listRoomWithQuarter(), { quarterID });
}
