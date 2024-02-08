import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import { DatabaseRoom, DatabaseUserDevice } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";
import { UserDevicesStatus } from "./UserDevicesTypes";
import dayjs, { Dayjs } from "dayjs";

export default class UserDeviceEntity extends MysqlAbstractEntity<boolean> {
  protected tableName = "user_devices";

  public userKey: string;
  public key: string;
  public clientKey: string;
  public brand: string | null;
  public model: string | null;
  public os: string | null;
  public version: string | null;
  public apnsToken: string | null;
  public status: UserDevicesStatus;
  public creationDate: Dayjs;
  public keyExpirationDate: Dayjs;
  public activationDate: Dayjs | null;
  public hasBeenProcess: boolean;

  constructor(
    id: number | null,
    userKey: string,
    key: string,
    clientKey: string,
    brand: string | null,
    model: string | null,
    os: string | null,
    version: string | null,
    apnsToken: string | null,
    status: UserDevicesStatus,
    creationDate: Dayjs,
    keyExpirationDate: Dayjs,
    activationDate: Dayjs | null,
    hasBeenProcess: boolean
  ) {
    super(id);
    this.userKey = userKey;
    this.key = key;
    this.clientKey = clientKey;
    this.brand = brand;
    this.model = model;
    this.os = os;
    this.version = version;
    this.apnsToken = apnsToken;
    this.status = status;
    this.creationDate = creationDate;
    this.keyExpirationDate = keyExpirationDate;
    this.activationDate = activationDate;
    this.hasBeenProcess = hasBeenProcess;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `user_devices` (`user_key`, `key`, `client_key`, `brand`, `model`, `os`, `version`, `apns_token`, `status`, `creation_date`, `key_expiration_date`, `activation_date`, `has_been_process`) VALUES (:userKey, :key, :clientKey, :brand, :model, :os, :version, :apnsToken, :status, :creationDate, :keyExpirationDate, :activationDate, :hasBeenProcess)",
            {
              userKey: this.userKey,
              key: this.key,
              clientKey: this.clientKey,
              brand: this.brand,
              model: this.model,
              os: this.os,
              version: this.version,
              apnsToken: this.apnsToken,
              status: this.status,
              creationDate: Utils.formatDef(this.creationDate),
              keyExpirationDate: Utils.formatDef(this.keyExpirationDate),
              activationDate: this.activationDate ? Utils.formatDef(this.activationDate) : null,
              hasBeenProcess: this.hasBeenProcess ? 1 : 0,
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `user_devices` SET `user_key`=:userKey, `key`=:key, `client_key`=:clientKey, `brand`=:brand, `model`=:model, `os`=:os, `version`=:version, `apns_token`=:apnsToken, `status`=:status, `creation_date`=:creationDate, `key_expiration_date`=:keyExpirationDate, `activation_date`=:activationDate, `has_been_process`=:hasBeenProcess WHERE `id`= :id",
            {
              userKey: this.userKey,
              key: this.key,
              clientKey: this.clientKey,
              brand: this.brand,
              model: this.model,
              os: this.os,
              version: this.version,
              apnsToken: this.apnsToken,
              status: this.status,
              creationDate: Utils.formatDef(this.creationDate),
              keyExpirationDate: Utils.formatDef(this.keyExpirationDate),
              activationDate: this.activationDate ? Utils.formatDef(this.activationDate) : null,
              hasBeenProcess: this.hasBeenProcess ? 1 : 0,
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
            message: "The user_device has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          userDevice: this
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

  static fromDatabaseObject(databaseObject: DatabaseUserDevice) {
    const device = new UserDeviceEntity(
      databaseObject.id,
      databaseObject.user_key,
      databaseObject.key,
      databaseObject.client_key,
      databaseObject.brand,
      databaseObject.model,
      databaseObject.os,
      databaseObject.version,
      databaseObject.apns_token,
      databaseObject.status,
      dayjs(databaseObject.creation_date),
      dayjs(databaseObject.key_expiration_date),
      databaseObject.activation_date ? dayjs(databaseObject.activation_date) : null,
      databaseObject.has_been_process === 1,
    );
    device.existsInDataBase = true;

    return device;
  }

  toJSON(): Object {
    return {
      id: this.id,
      userKey: this.userKey,
      clientKey: this.clientKey,
      brand: this.brand,
      model: this.model,
      os: this.os,
      version: this.version,
      apnsToken: this.apnsToken,
      status: this.status,
      creationDate: Utils.formatDef(this.creationDate),
      keyExpirationDate: Utils.formatDef(this.keyExpirationDate),
      hasBeenProcess: this.hasBeenProcess,
    };
  }
}
