import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import {DataBaseService, DataBaseUser, DataBaseUserAuth} from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import moment, {Moment} from "moment/moment";

export default class UserAuthEntity extends MysqlAbstractEntity<boolean> {
    protected tableName = "user_auths";

    public userKey: string;
    public authKey: string;
    public creationDate: Moment;
    public expirationDate: Moment;
    public hasBeenProcess: boolean;

    constructor(
        id: number | null,
        userKey: string,
        authKey: string,
        creationDate: Moment,
        expirationDate: Moment,
        hasBeenProcess: boolean
    ) {
        super();
        if (id) this.id = id;
        this.userKey = userKey;
        this.authKey = authKey;
        this.creationDate = creationDate;
        this.expirationDate = expirationDate;
        this.hasBeenProcess = hasBeenProcess;
    }

    async save() {
        try {
            let responseData;
            if (!this.existsInDataBase) {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "INSERT INTO `user_auths` (`user_key`, `auth_key`, `creation_date`, `expiration_date`, `has_been_process`) VALUES (:userKey, :authKey, :creationDate, :expirationDate, :hasBeenProcess)",
                        {
                            userKey: this.userKey,
                            authKey: this.authKey,
                            creationDate: this.creationDate.format("YYYY-MM-DD HH:mm:ss"),
                            expirationDate: this.expirationDate.format("YYYY-MM-DD HH:mm:ss"),
                            hasBeenProcess: this.hasBeenProcess ? "1" : "0"
                        }
                    )
                );

                this.id = responseData.insertId;
            } else {
                responseData = await Utils.executeMysqlRequest(
                    Utils.getMysqlPool().execute(
                        "UPDATE `user_auths` SET `user_key`= :userKey, `auth_key`= :authKey, `creation_date`= :creationDate, `expiration_date`= :expirationDate, `has_been_process`=:hasBeenProcess WHERE `id`= :id",
                        {
                            userKey: this.userKey,
                            authKey: this.authKey,
                            creationDate: this.creationDate.format("YYYY-MM-DD HH:mm:ss"),
                            expirationDate: this.expirationDate.format("YYYY-MM-DD HH:mm:ss"),
                            hasBeenProcess: this.hasBeenProcess ? "1" : "0",
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
                        message: "The user_auths has not been persisted in the database"
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

    static fromDatabaseObject(databaseObject: DataBaseUserAuth) {
        const user = new UserAuthEntity(
            databaseObject.id,
            databaseObject.user_key,
            databaseObject.auth_key,
            moment(databaseObject.creation_date),
            moment(databaseObject.expiration_date),
            databaseObject.has_been_process === 1
        );
        user.existsInDataBase = true;
        return user;
    }

    toJSON(): Object {
        return {
            id: this.id,
            userKey: this.userKey,
            authKey: this.authKey,
            creationDate: this.creationDate,
            expirationDate: this.expirationDate,
        };
    }
}
