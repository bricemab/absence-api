import Utils from "../../utils/Utils";
import {DataBaseClient, DataBaseUser} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import UserEntity from "../users/UserEntity";
import ClientEntity from "./ClientEntity";

export default class ClientsManager {
    static async findByKey(key: string) {
        const serviceFromDatabase = Utils.castMysqlRecordToObject<
          DataBaseClient
        >(await Utils.getMysqlPool().execute("SELECT * FROM clients WHERE `key` = :key", {
            key
        }));

        if (!serviceFromDatabase) {
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
                client: ClientEntity.fromDatabaseObject(serviceFromDatabase)
            }
        };
    }
}
