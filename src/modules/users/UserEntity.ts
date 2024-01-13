import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import {DataBaseUser} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import dayjs, { Dayjs } from "dayjs";

export default class UserEntity extends MysqlAbstractEntity<boolean> {
    protected tableName = "users";

    public key: string;
    public clientKey: string;
    public creationDate: Dayjs;
    public activationDate: Dayjs | null;
    public isActive: boolean

    constructor(
        id: number | null,
        key: string,
        clientKey: string,
        creationDate: Dayjs,
        activationDate: Dayjs | null,
        isActive: boolean
    ) {
        super(id);
        this.key = key;
        this.clientKey = clientKey;
        this.creationDate = creationDate;
        this.activationDate = activationDate;
        this.isActive = isActive;
    }

    async save() {
        try {
            let responseData;
            if (!this.existsInDataBase) {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "INSERT INTO `users` (`key`, `client_key`, `creation_date`, `activation_date`, `is_active`) VALUES (:key, :clientKey, :creationDate, :activationDate, :isActive)",
                      {
                        key: this.key,
                        clientKey: this.clientKey,
                        creationDate: Utils.formatDef(this.creationDate),
                        activationDate: this.activationDate ? Utils.formatDef(this.activationDate) : null,
                        isActive: this.isActive ? "1" : "0",
                      }
                    )
                );

                this.id = responseData.insertId;
            } else {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "UPDATE `users` SET `key`= :key, `client_key`= :clientKey, `creation_date`=:creationDate, `activation_date`=: WHERE `id`= :id",
                        {
                          key: this.key,
                          clientKey: this.clientKey,
                          creationDate: Utils.formatDef(this.creationDate),
                          activationDate: this.activationDate ? Utils.formatDef(this.activationDate) : null,
                          isActive: this.isActive ? "1" : "0",
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
            databaseObject.client_key,
            dayjs(databaseObject.creation_date),
            databaseObject.activation_date ? dayjs(databaseObject.activation_date) : null,
          databaseObject.is_active === 1
        );
        user.existsInDataBase = true;

        return user;
    }

    toJSON(): Object {
        return {
            id: this.id,
          key: this.key,
          clientKey: this.clientKey,
          creationDate: Utils.formatDef(this.creationDate),
          activationDate: this.activationDate ? Utils.formatDef(this.activationDate) : null,
          isActive: this.isActive,
        };
    }
}
