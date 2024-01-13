import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import { DatabaseScannerLog } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";
import dayjs, { Dayjs } from "dayjs";
import { ScannerLogsType } from "./ScannerLogsType";

export default class ScannerLogEntity extends MysqlAbstractEntity<boolean> {
  protected tableName = "scanner_logs";

  public userKey: string;
  public deviceId: number;
  public clientKey: string;
  public roomId: number;
  public date: Dayjs;
  public type: ScannerLogsType;

  constructor(
    id: number | null,
    userKey: string,
    deviceId: number,
    clientKey: string,
    roomId: number,
    date: Dayjs,
    type: ScannerLogsType
  ) {
    super(id);
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `scanner_logs` (`user_key`, `device_id`, `client_key`, `room_id`, `date`, `type`) VALUES (:userKey, :deviceId, :clientKey, :roomId, :date, :type)",
            {
              userKey: this.userKey,
              deviceId: this.deviceId,
              clientKey: this.clientKey,
              roomId: this.roomId,
              date: this.date,
              type: this.type
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `scanner_logs` SET `user_key`=:userKey, `device_id` = :deviceId, `client_key` = :clientKey, `room_id` = :roomId, `date` = :date, `type` = :type WHERE `id`= :id",
            {
              userKey: this.userKey,
              deviceId: this.deviceId,
              clientKey: this.clientKey,
              roomId: this.roomId,
              date: this.date,
              type: this.type,
              id: this.id
            }
          )
        );
      }
      if (responseData.affectedRows === 0) {
        return {
          success: false,
          error: {
            code: GeneralErrors.DATABASE_REQUEST_ERROR,
            message: "The scanner_log has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          scannerLog: this
        }
      };
    } catch (e) {
      // @ts-ignore
      Utils.manageError(e);
      return {
        success: false,
        error: {
          code: GeneralErrors.DATABASE_REQUEST_ERROR,
          message: "An error has occurred while saving data"
        }
      };
    }
  }

  static fromDatabaseObject(databaseObject: DatabaseScannerLog) {
    const scannerLogEntity = new ScannerLogEntity(
      databaseObject.id,
      databaseObject.user_key,
      databaseObject.device_id,
      databaseObject.client_key,
      databaseObject.room_id,
      dayjs(databaseObject.date),
      databaseObject.type
    );
    scannerLogEntity.existsInDataBase = true;

    return scannerLogEntity;
  }

  toJSON(): Object {
    return {
      id: this.id,
      userKey: this.userKey,
      deviceId: this.deviceId,
      clientKey: this.clientKey,
      roomId: this.roomId,
      date: this.date,
      type: this.type,
    };
  }
}
