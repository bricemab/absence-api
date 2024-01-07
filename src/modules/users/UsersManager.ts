import Utils from "../../utils/Utils";
import {DataBaseUser} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import UserEntity from "./UserEntity";

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
}
