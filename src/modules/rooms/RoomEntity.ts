import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import { DatabaseRoom } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";

export default class RoomEntity extends MysqlAbstractEntity<boolean> {
  protected tableName = "rooms";

  public key: string;
  public name: string;
  public clientId: number;

  constructor(
    id: number | null,
    key: string,
    name: string,
    clientId: number
  ) {
    super(id);
    this.key = key;
    this.name = name;
    this.clientId = clientId;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `rooms` (`key`, `name`, `client_id`) VALUES (:key, :name, :clientId)",
            {
              key: this.key,
              name: this.name,
              clientId: this.clientId
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `rooms` SET `key`= :key, `name`= :name, `client_id`=:clientId WHERE `id`= :id",
            {
              key: this.key,
              name: this.name,
              clientId: this.clientId,
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
            message: "The client has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          room: this
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

  static fromDatabaseObject(databaseObject: DatabaseRoom) {
    const room = new RoomEntity(
      databaseObject.id,
      databaseObject.key,
      databaseObject.name,
      databaseObject.client_id
    );
    room.existsInDataBase = true;

    return room;
  }

  toJSON(): Object {
    return {
      id: this.id,
      key: this.key,
      name: this.name,
      clientId: this.clientId
    };
  }
}
