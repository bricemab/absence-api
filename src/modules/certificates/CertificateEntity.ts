import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import { DatabaseCertificate, DataBaseClient } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";
import dayjs, { Dayjs } from "dayjs";

export default class CertificateEntity extends MysqlAbstractEntity<boolean> {
  protected tableName = "certificates";

  public name: string;
  public key: string;
  public userKey: string;
  public fromDate: Dayjs;
  public toDate: Dayjs;
  public clientKey: string;
  public creatorApiClientId: number;
  public isActive: boolean;

  constructor(
    id: number | null,
    name: string,
    key: string,
    userKey: string,
    fromDate: Dayjs,
    toDate: Dayjs,
    clientKey: string,
    creatorApiClientId: number,
    isActive: boolean
  ) {
    super(id);
    this.name = name;
    this.key = key;
    this.userKey = userKey;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.clientKey = clientKey;
    this.creatorApiClientId = creatorApiClientId;
    this.isActive = isActive;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `certificates` (`name`, `key`, `user_key`, `from_date`, `to_date`, `client_key`, `creator_api_client_id`, `is_active`) VALUES (:name, :key, :userKey, :fromDate, :toDate, :clientKey, :creatorApiClientId, :isActive)",
            {
              name: this.name,
              key: this.key,
              userKey: this.userKey,
              fromDate: this.fromDate.format("YYYY-MM-DD"),
              toDate: this.toDate.format("YYYY-MM-DD"),
              clientKey: this.clientKey,
              creatorApiClientId: this.creatorApiClientId,
              isActive: this.isActive ? "1" : "0"
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `certificates` SET `name`= :name, `key`= :key, `user_key`= :userKey, `from_date`= :fromDate, `to_date`= :toDate, `client_key`= :clientKey, `creator_api_client_id`= :creatorApiClientId, `is_active`=:isActive WHERE `id`= :id",
            {
              name: this.name,
              key: this.key,
              userKey: this.userKey,
              fromDate: this.fromDate.format("YYYY-MM-DD"),
              toDate: this.toDate.format("YYYY-MM-DD"),
              clientKey: this.clientKey,
              creatorApiClientId: this.creatorApiClientId,
              isActive: this.isActive ? "1" : "0",
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
            message: "The certificate has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          certificate: this
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

  static fromDatabaseObject(databaseObject: DatabaseCertificate) {
    const user = new CertificateEntity(
      databaseObject.id,
      databaseObject.name,
      databaseObject.key,
      databaseObject.user_key,
      dayjs(databaseObject.from_date),
      dayjs(databaseObject.to_date),
      databaseObject.client_key,
      databaseObject.creator_api_client_id,
      databaseObject.is_active === 1
    );
    user.existsInDataBase = true;

    return user;
  }

  toJSON(): Object {
    return {
      name: this.name,
      key: this.key,
      userKey: this.userKey,
      fromDate: Utils.formatDef(this.fromDate),
      toDate: Utils.formatDef(this.toDate),
      clientKey: this.clientKey,
      creatorApiClientId: this.creatorApiClientId,
      isActive: this.isActive
    };
  }
}
