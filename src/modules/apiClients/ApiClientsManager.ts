import Utils from "../../utils/Utils";
import {DataBaseApiClient, DataBaseUser} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import ApiClientEntity from "./ApiClientEntity";

export default class ApiClientsManager {
    static async findByKey(key: string) {
        const clientFromDatabase = Utils.castMysqlRecordToObject<
            DataBaseApiClient
        >(await Utils.getMysqlPool().execute("SELECT * FROM api_clients WHERE `key` = :key", {
            key
        }));

        if (!clientFromDatabase) {
            return {
                success: false,
                error: {
                    code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
                    message: "The api_client couldn't be found in database",
                    details: {}
                }
            };
        }

        return {
            success: true,
            data: {
                apiClient: ApiClientEntity.fromDatabaseObject(clientFromDatabase)
            }
        };
    }
}
