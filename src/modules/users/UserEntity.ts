import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import {DataBaseUser} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import {UserRole} from "./UserRole";
import moment, {Moment} from "moment/moment";

export default class UserEntity extends MysqlAbstractEntity<boolean> {
    protected tableName = "users";

    public key: string;
    public serviceKey: string;
    public creationDate: Moment;

    constructor(
        id: number | null,
        key: string,
        serviceKey: string,
        creationDate: Moment,
    ) {
        super();
        if (id) {
            this.id = id as number;
        }
        this.key = key;
        this.serviceKey = serviceKey;
        this.creationDate = creationDate;
    }

    async save() {
        try {
            let responseData;
            if (!this.existsInDataBase) {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "INSERT INTO `users` (`key`, `service_key`, `creation_date`) VALUES (?, ?, ?)",
                        [
                            this.key,
                            this.serviceKey,
                            this.creationDate.format("YYYY-MM-DD HH:mm:ss"),
                        ]
                    )
                );

                this.id = responseData.insertId;
            } else {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "UPDATE `users` SET `key`= :key, `service_key`= :serviceKey, `creation_date`=:creationDate WHERE `id`= :id",
                        {
                            key: this.key,
                            serviceKey: this.serviceKey,
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
                        message: "The user has not been persisted in the database"
                    }
                };
            }
            return {
                success: true,
                data: {
                    user: this
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

    static fromDatabaseObject(databaseObject: DataBaseUser) {
        const user = new UserEntity(
            databaseObject.id,
            databaseObject.key,
            databaseObject.service_key,
            moment(databaseObject.creation_date),
        );
        user.existsInDataBase = true;

        return user;
    }

    toJSON(): Object {
        return {
            id: this.id,
            key: this.key,
            serviceKey: this.serviceKey,
            creationDate: this.creationDate,
        };
    }
}
