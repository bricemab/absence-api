import Utils from "../../utils/Utils";
import { DatabaseUserDevice } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";
import UserDeviceEntity from "./UserDeviceEntity";

export default class UserDevicesManager {
  static async findByKeyAndUser(key: string, userKey: string) {
    const deviceFromDatabase = Utils.castMysqlRecordToObject<
      DatabaseUserDevice
    >(await Utils.getMysqlPool().execute("SELECT * FROM user_devices WHERE `key` = :key AND `user_key` = :userKey", {
      key, userKey
    }));

    if (!deviceFromDatabase) {
      return {
        success: false,
        error: {
          code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
          message: "The user device couldn't be found in database",
          details: {}
        }
      };
    }

    return {
      success: true,
      data: {
        userDevice: UserDeviceEntity.fromDatabaseObject(deviceFromDatabase)
      }
    };
  }

  static async findByKey(key: string) {
    const deviceFromDatabase = Utils.castMysqlRecordToObject<
      DatabaseUserDevice
    >(await Utils.getMysqlPool().execute("SELECT * FROM user_devices WHERE `key` = :key", {
      key
    }));

    if (!deviceFromDatabase) {
      return {
        success: false,
        error: {
          code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
          message: "The user device couldn't be found in database",
          details: {}
        }
      };
    }

    return {
      success: true,
      data: {
        userDevice: UserDeviceEntity.fromDatabaseObject(deviceFromDatabase)
      }
    };
  }
}
