import Utils from "../../utils/Utils";
import { DataBaseUser } from "../Global/DatabaseTypes";
import { GeneralErrors, UserErrors } from "../Global/BackendErrors";
import UserEntity from "./UserEntity";
import { ApplicationResponse } from "../../utils/Types";
import UserDevicesManager from "../userDevices/UserDevicesManager";
import UserDeviceEntity from "../userDevices/UserDeviceEntity";

export default class UsersManager {
  static async findByKey(key: string) {
    const userFromDatabase = Utils.castMysqlRecordToObject<
      DataBaseUser
    >(await Utils.getMysqlPool().execute("SELECT * FROM users WHERE `key` = :key", {
      key
    }));

    if (!userFromDatabase) {
      return {
        success: false,
        error: {
          code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
          message: "The user couldn't be found in database",
          details: {}
        }
      };
    }

    return {
      success: true,
      data: {
        user: UserEntity.fromDatabaseObject(userFromDatabase)
      }
    };
  }

  static async validUserKeyDeviceKey(userKey: string, deviceKey: string): Promise<ApplicationResponse<{
    user: UserEntity;
    device: UserDeviceEntity;
  }>> {
    if (userKey.trim() === "") {
      return {
        success: false,
        error: {
          code: UserErrors.KEY_NO_MATCH,
          message: "key doesn't match"
        }
      }
    }
    const userResponse = await UsersManager.findByKey(userKey);
    if (!userResponse.success && !userResponse.data) {
      return {
        success: false,
        error: {
          code: UserErrors.KEY_NO_MATCH,
          message: "key doesn't match"
        }
      }
    }
    const { user } = userResponse.data!;
    const deviceResponse = await UserDevicesManager.findByKeyAndUser(deviceKey, userKey);
    if (!deviceResponse.success && !deviceResponse.data) {
      return {
        success: false,
        error: {
          code: UserErrors.KEY_NO_MATCH,
          message: "key doesn't match"
        }
      }
    }
    const { userDevice } = deviceResponse.data!;
    return {
      success: true,
      data: {
        user,
        device: userDevice
      }
    }
  }
}
