import Utils from "../../utils/Utils";
import { DataBaseApiClient, DataBaseUser } from "../Global/DatabaseTypes";
import { ApiClientErrors, GeneralErrors } from "../Global/BackendErrors";
import ApiClientEntity from "./ApiClientEntity";
import { ApplicationResponse } from "../../utils/Types";

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

  static async validApiConnexion(key: string, validationKey: string): Promise<ApplicationResponse<{
    apiClient: ApiClientEntity
  }>> {
    if (key.trim() === "" || validationKey === "") {
      return {
        success: false,
        error: {
          code: ApiClientErrors.KEYS_NOT_MATCH,
          message: "key or validation_key doesn't works"
        }
      };
    }
    const apiClientResponse = await ApiClientsManager.findByKey(key);
    if (!apiClientResponse.success && !apiClientResponse.data) {
      return {
        success: false,
        error: {
          code: ApiClientErrors.KEYS_NOT_MATCH,
          message: "key doesn't works"
        }
      };
    }
    const { apiClient } = apiClientResponse.data!;
    if (apiClient.validationKey !== validationKey) {
      return {
        success: false,
        error: {
          code: ApiClientErrors.KEYS_NOT_MATCH,
          message: "validation key doesn't works"
        }
      };
    }
    if (!Utils.validateHmacSha256ValidationKey(validationKey, apiClient.key, apiClient.clientKey, apiClient.creationDate.format("YYYY-MM-DD HH:mm:ss"))) {
      return {
        success: false,
        error: {
          code: ApiClientErrors.KEYS_NOT_MATCH,
          message: "validation key doesn't works"
        }
      };
    }
    return {
      success: true,
      data: {
        apiClient
      }
    };
  }
}
