import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import {DataBaseApiClient, DataBaseUser} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import moment, {Moment} from "moment/moment";

export default class ApiClientEntity extends MysqlAbstractEntity<boolean> {
    protected tableName = "api_clients";

    public key: string;
    public validationKey: string;
    public clientKey: string;
    public creationDate: Moment;

    constructor(
        id: number | null,
        key: string,
        validationKey: string,
        clientKey: string,
        creationDate: Moment,
    ) {
        super();
        if (id) {
            this.id = id as number;
        }
        this.key = key;
        this.validationKey = validationKey;
        this.clientKey = clientKey;
        this.creationDate = creationDate;
    }

    async save() {
        try {
            let responseData;
            if (!this.existsInDataBase) {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "INSERT INTO `api_clients` (`key`, `client_key`, `validation_key`, `creation_date`) VALUES (:key, :clientKey, :validationKey, :creationDate)",
                        {
                            key: this.key,
                            clientKey: this.clientKey,
                            validationKey: this.validationKey,
                            creationDate: this.creationDate.format("YYYY-MM-DD HH:mm:ss"),
                        }
                    )
                );

                this.id = responseData.insertId;
            } else {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "UPDATE `api_clients` SET `key`= :key, `client_key`= :clientKey, `validation_key`=:validationKey, `creation_date`=:creationDate WHERE `id`= :id",
                        {
                            key: this.key,
                            clientKey: this.clientKey,
                            validationKey: this.validationKey,
                            creationDate: this.creationDate.format("YYYY-MM-DD HH:mm:ss"),
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
                        message: "The api client has not been persisted in the database"
                    }
                };
            }
            return {
                success: true,
                data: {
                    apiClient: this
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

    static fromDatabaseObject(databaseObject: DataBaseApiClient) {
        const client = new ApiClientEntity(
            databaseObject.id,
            databaseObject.key,
            databaseObject.validation_key,
            databaseObject.client_key,
            moment(databaseObject.creation_date),
        );
        client.existsInDataBase = true;

        return client;
    }

    toJSON(): Object {
        return {
            id: this.id,
            key: this.key,
            validationKey: this.validationKey,
            clientKey: this.clientKey,
            creationDate: this.creationDate,
        };
    }
}
