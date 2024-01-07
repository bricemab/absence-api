import Utils from "../../utils/Utils";
import {DataBaseUser, DataBaseUserAuth} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import UserEntity from "./UserEntity";
import UserAuthEntity from "./UserAuthEntity";

export default class UserAuthsManager {
    static async findByAuthKey(key: string) {
        const userFromDatabase = Utils.castMysqlRecordToObject<
            DataBaseUserAuth
        >(await Utils.getMysqlPool().execute("SELECT * FROM user_auths WHERE `auth_key` = :key", {
            key
        }));

        if (!userFromDatabase) {
            return {
                success: false,
                error: {
                    code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
                    message: "The user_auth couldn't be found in database",
                    details: {}
                }
            };
        }

        return {
            success: true,
            data: {
                userAuth: UserAuthEntity.fromDatabaseObject(userFromDatabase)
            }
        };
    }
}
