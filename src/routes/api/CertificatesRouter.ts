import { Router } from "express";
import AclManager from "../../permissions/AclManager";
import { Permissions } from "../../permissions/permissions";
import RequestManager from "../../modules/Global/RequestManager";
import { ApplicationRequest, ClientApiSession, UserSession } from "../../utils/Types";
import { AuthenticationErrors, GeneralErrors, UserErrors } from "../../modules/Global/BackendErrors";
import Utils from "../../utils/Utils";
import CertificateEntity from "../../modules/certificates/CertificateEntity";
import dayjs from "dayjs";
import CertificateTimeslotEntity from "../../modules/certificateTimeslots/CertificateTimeslotEntity";

const CertificatesRouter = Router();

CertificatesRouter.post(
  "/new-certificate",
  AclManager.hasPermissionRoute(Permissions.specialState.userLoggedIn),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          userKey: string;
          name: string;
          fromDate: string;
          toDate: string;
          timeslots: {
            weekDay: number; // start with 0 = monday
            startHours: string;
            endHours: string;
          }[]
        };
      }>,
      response: Response
    ) => {
      if (!request.isLogged) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_IN,
            message: "You must be logged in"
          }
        });
      }

      if (request.body.data &&
        !request.body.data.userKey ||
        !request.body.data.name ||
        !request.body.data.fromDate ||
        !request.body.data.toDate ||
        !request.body.data.timeslots ||
        (request.body.data.timeslots && request.body.data.timeslots.length === 0)
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.INVALID_REQUEST,
            message: "Request mal formatted"
          }
        });
      }
      const {
        timeslots,
        userKey,
        name,
        toDate,
        fromDate
      } = request.body.data!;
      const clientInstance = request.tokenDecryptedData!.client;
      const userInstance = request.tokenDecryptedData!.user as ClientApiSession;
      const key = Utils.generateRandomToken(50);
      const certificate = new CertificateEntity(null, name, key, userKey, dayjs(fromDate), dayjs(toDate), clientInstance.key, userInstance.id, false);
      await certificate.save();
      const dataTimeslots: CertificateTimeslotEntity[] = [];
      for (const timeslotObj of timeslots) {
        if (
          !Utils.validateTimeHHmm(timeslotObj.startHours) ||
          !Utils.validateTimeHHmm(timeslotObj.endHours) ||
          timeslotObj.weekDay > 7 ||
          timeslotObj.weekDay < 0) {
          for (const ts of dataTimeslots) {
            await ts.delete();
          }
          await certificate.delete();
          return RequestManager.sendResponse(response, {
            success: false,
            error: {
              code: GeneralErrors.INVALID_REQUEST,
              message: "Request mal formatted (timeslots)"
            }
          });
        }
        const timeslot = new CertificateTimeslotEntity(null, certificate.id!, timeslotObj.weekDay, timeslotObj.startHours, timeslotObj.endHours);
        await timeslot.save();
        dataTimeslots.push(timeslot);
      }
      RequestManager.sendResponse(response, {
        success: true,
        data: {}
      });
    })
);

export default CertificatesRouter;
