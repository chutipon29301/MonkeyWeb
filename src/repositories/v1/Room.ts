import { from, Observable } from 'rxjs';
import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';
import { IRoom, IRoomModel, RoomInstance, roomModel } from '../../models/v1/room';
import { Quarter } from './Quarter';

export class Room {

    public static getInstance(): Room {
        if (!this.instance) {
            this.instance = new Room();
        }
        return this.instance;
    }

    private static instance: Room;

    private roomModel: Sequelize.Model<RoomInstance, IRoomModel>;

    private constructor() {
        this.roomModel = roomModel(Connection.getInstance().getConnection());
    }

    public list(
        QuarterID?: number,
    ): Observable<IRoom[]> {
        if (QuarterID) {
            return from(this.roomModel.findAll<IRoom>({
                attributes: ['RoomName', 'MaxSeat'],
                raw: true,
                where: { QuarterID },
            }));
        } else {
            return Connection.getInstance().query<IRoom>(
                'SELECT RoomName, MaxSeat ' +
                'FROM Room ' +
                'JOIN Quarter ON Room.QuarterID = Quarter.ID ' +
                'WHERE StartDate < CURRENT_TIMESTAMP AND EndDate > CURRENT_TIMESTAMP', {
                    model: this.roomModel,
                    raw: true,
                });
        }
    }

}
