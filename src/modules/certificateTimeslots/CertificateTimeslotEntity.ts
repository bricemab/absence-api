import Utils from "../../utils/Utils";
import MysqlAbstractEntity from "../Global/MysqlAbstractEntity";
import { DatabaseCertificate, DatabaseCertificateTimeslot, DataBaseClient } from "../Global/DatabaseTypes";
import { GeneralErrors } from "../Global/BackendErrors";

export default class CertificateTimeslotEntity extends MysqlAbstractEntity<boolean> {
  protected tableName = "certificate_timeslots";

  public certificateId: number;
  public weekDay: number;
  public startHours: string;
  public endHours: string;

  constructor(
    id: number | null,
    certificateId: number,
    weekDay: number,
    startHours: string,
    endHours: string
  ) {
    super(id);
    this.certificateId = certificateId;
    this.weekDay = weekDay;
    this.startHours = startHours;
    this.endHours = endHours;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `certificate_timeslots` (`certificate_id`, `week_day`, `start_hours`, `end_hours`) VALUES (:certificateId, :weekDay, :startHours, :endHours)",
            {
              certificateId: this.certificateId,
              weekDay: this.weekDay,
              startHours: this.startHours,
              endHours: this.endHours,
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `certificate_timeslots` SET `certificate_id`= :certificateId, `week_end`= :weekDay, `start_hours`=:startHours, `end_hours`=:endHours WHERE `id`= :id",
            {
              certificateId: this.certificateId,
              weekDay: this.weekDay,
              startHours: this.startHours,
              endHours: this.endHours,
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
            message: "The certificate timeslot has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          certificateTimeslot: this
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

  static fromDatabaseObject(databaseObject: DatabaseCertificateTimeslot) {
    const user = new CertificateTimeslotEntity(
      databaseObject.id,
      databaseObject.certificate_id,
      databaseObject.week_day,
      databaseObject.start_hours,
      databaseObject.end_hours
    );
    user.existsInDataBase = true;

    return user;
  }

  toJSON(): Object {
    return {
      id: this.id,
      certificateId: this.certificateId,
      weekDay: this.weekDay,
      startHours: this.startHours,
      endHours: this.endHours,
    };
  }
}
