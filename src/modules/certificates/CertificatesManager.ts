import Utils from "../../utils/Utils";
import { DatabaseCertificate } from "../Global/DatabaseTypes";
import {GeneralErrors} from "../Global/BackendErrors";
import UserEntity from "../users/UserEntity";
import CertificateEntity from "./CertificateEntity";
import dayjs from "dayjs";

export default class CertificatesManager {
    static async findByKey(key: string) {
        const certificateFromDatabase = Utils.castMysqlRecordToObject<
          DatabaseCertificate
        >(await Utils.getMysqlPool().execute("SELECT * FROM certificates WHERE `key` = :key", {
            key
        }));

        if (!certificateFromDatabase) {
            return {
                success: false,
                error: {
                    code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
                    message: "The certificate couldn't be found in database",
                    details: {}
                }
            };
        }

        return {
            success: true,
            data: {
                certificate: CertificateEntity.fromDatabaseObject(certificateFromDatabase)
            }
        };
    }

    static async findCurrentCertificateByUserKey(key: string) {
        const certificateFromDatabase = Utils.castMysqlRecordToObject<
          DatabaseCertificate
        >(await Utils.getMysqlPool().execute("SELECT * FROM certificates WHERE `user_key` = :key AND `is_active` = 1 AND `from_date` <= :date AND `to_date` >= :date", {
            key,
          date: dayjs().format("YYYY-MM-DD"),
        }));

        if (!certificateFromDatabase) {
            return {
                success: false,
                error: {
                    code: GeneralErrors.OBJECT_NOT_FOUND_IN_DATABASE,
                    message: "The certificate couldn't be found in database",
                    details: {}
                }
            };
        }

        return {
            success: true,
            data: {
                certificate: CertificateEntity.fromDatabaseObject(certificateFromDatabase)
            }
        };
    }
}
