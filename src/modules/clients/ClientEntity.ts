import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import {DataBaseClient} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import moment, {Moment} from "moment/moment";

export default class ClientEntity extends MysqlAbstractEntity<boolean> {
    protected tableName = "clients";

    public key: string;
    public name: string;

    constructor(
        key: string,
        name: string,
    ) {
        super();
        this.key = key;
        this.name = name;
    }

    async save() {
        try {
            let responseData;
            if (!this.existsInDataBase) {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "INSERT INTO `clients` (`key`, `name`) VALUES (:key, :name)",
                        {
                            key: this.key,
                            name: this.name,
                        }
                    )
                );

                this.id = responseData.insertId;
            } else {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "UPDATE `clients` SET `key`= :key, `name`= :name WHERE `key`= :key",
                        {
                            key: this.key,
                            name: this.name
                        }
                    )
                );
            }
            if (responseData.affectedRows === 0) {
                return {
                    success: false,
                    error: {
                        code: GeneralErrors.DATABASE_REQUEST_ERROR,
                        message: "The service has not been persisted in the database"
                    }
                };
            }
            return {
                success: true,
                data: {
                    service: this
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

    static fromDatabaseObject(databaseObject: DataBaseClient) {
        const user = new ClientEntity(
            databaseObject.key,
            databaseObject.name,
        );
        user.existsInDataBase = true;

        return user;
    }

    toJSON(): Object {
        return {
            key: this.key,
            name: this.name,
        };
    }
}
