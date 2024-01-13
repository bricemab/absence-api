import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import { DataBaseClient, DatabaseLog } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";
import { ActionLogTypes } from "./logsType";
import dayjs, { Dayjs } from "dayjs";

export default class LogEntity extends MysqlAbstractEntity<boolean> {
  protected tableName = "logs";

  public action: ActionLogTypes;
  public date: Dayjs;
  public userKey: string | null;
  public clientKey: string | null;
  public apiClientId: number | null;

  constructor(
    id: number,
    action: ActionLogTypes,
    date: Dayjs,
    userKey: string | null,
    clientKey: string | null,
    apiClientId: number | null
  ) {
    super(id);
    this.action = action;
    this.date = date;
    this.userKey = userKey;
    this.clientKey = clientKey;
    this.apiClientId = apiClientId;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `logs` (`action`, `date`, `user_key`, `client_key`, `api_client_id`) VALUES (:action, :date, :userKey, :clientKey, :apiClientId)",
            {
              key: this.action,
              date: Utils.formatDef(this.date),
              userKey: this.userKey,
              clientKey: this.clientKey,
              apiClientId: this.apiClientId
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `logs` SET `action`= :action, `date`= :date, `user_key`=:userKey, `client_key`=:clientKey, `api_client_id`=:apiClientId,  WHERE `id`= :id",
            {
              key: this.action,
              date: Utils.formatDef(this.date),
              userKey: this.userKey,
              clientKey: this.clientKey,
              apiClientId: this.apiClientId,
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
            message: "The log has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          log: this
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

  static fromDatabaseObject(databaseObject: DatabaseLog) {
    const user = new LogEntity(
      databaseObject.id,
      databaseObject.action,
      dayjs(databaseObject.date),
      databaseObject.user_key,
      databaseObject.client_key,
      databaseObject.api_client_id
    );
    user.existsInDataBase = true;

    return user;
  }

  toJSON(): Object {
    return {
      key: this.action,
      date: Utils.formatDef(this.date),
      userKey: this.userKey,
      clientKey: this.clientKey,
      apiClientId: this.apiClientId,
      id: this.id
    };
  }
}
