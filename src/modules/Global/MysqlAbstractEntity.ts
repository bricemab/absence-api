import Utils from "../../utils/Utils";
import { GeneralErrors } from "./BackendErrors";
import AbstractEntity from "./AbstractEntity";
import { ApplicationResponsePromise } from "../../utils/Types";

export default abstract class MysqlAbstractEntity<
  ObjectResult
> extends AbstractEntity {
  protected existsInDataBase: boolean;
  public id: null | number;
  protected abstract tableName: string;

  protected constructor(id?: number | null) {
    super();
    if (id) {
      this.id = id;
    }
    this.existsInDataBase = false;
  }

  public async delete(): ApplicationResponsePromise<any> {
    if (!this.id) {
      return {
        success: false,
        error: {
          code: GeneralErrors.ENTITY_ID_MISSING_ERROR,
          message: "Missing id in the entity"
        }
      };
    }

    const responseData = await Utils.executeMysqlRequest(
      Utils.getMysqlPool().execute(
        "DELETE FROM "+this.tableName+ " WHERE id = :id",
        {
          id: this.id
        }
      )
    );
    if (responseData.affectedRows === 0) {
      return {
        success: false,
        error: {
          code: GeneralErrors.DATABASE_REQUEST_ERROR,
          message: "The worksite has not been persisted in the database"
        }
      };
    }
    return {
      success: true,
      data: {}
    };
  }

  static fromDatabaseObjectSync<ObjectResult>(
    databaseObject: ObjectResult,
    isGlobal?: boolean
  ): any {
    Utils.manageError({
      code: GeneralErrors.METHOD_NOT_IMPLEMENTED,
      message: "This method should be overwritten on child class"
    });
  }

  static fromDatabaseObject<ObjectResult>(databaseObject: any): any {
    Utils.manageError({
      code: GeneralErrors.METHOD_NOT_IMPLEMENTED,
      message: "This method should be overwritten on child class"
    });
  }
}
