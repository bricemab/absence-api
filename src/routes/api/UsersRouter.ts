import { Router } from "express";
import AclManager from "../../permissions/AclManager";
import { Permissions } from "../../permissions/permissions";
import RequestManager from "../../modules/Global/RequestManager";
import { ApplicationRequest, ClientApiSession, UserSession } from "../../utils/Types";
import { AuthenticationErrors, GeneralErrors } from "../../modules/Global/BackendErrors";
import Utils from "../../utils/Utils";
import UserEntity from "../../modules/users/UserEntity";
import dayjs from "dayjs";
import UserDeviceEntity from "../../modules/userDevices/UserDeviceEntity";
import { UserDevicesStatus } from "../../modules/userDevices/UserDevicesTypes";
import LogEntity from "../../modules/logs/LogEntity";
import { ActionLogTypes } from "../../modules/logs/logsType";
import CertificateEntity from "../../modules/certificates/CertificateEntity";
import CertificateTimeslotEntity from "../../modules/certificateTimeslots/CertificateTimeslotEntity";

const UsersRouter = Router();

UsersRouter.post(
  "/new-user",
  AclManager.hasPermissionRoute(Permissions.usersManager.add),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {};
      }>,
      response: Response
    ) => {
      if (!request.isLogged) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_IN,
            message: "You must be logged on"
          }
        });
      }
      const { client, user: userSession } = request.tokenDecryptedData!;
      const apiClientSession = userSession as ClientApiSession;
      const userKey = Utils.generateRandomToken(50);
      const deviceKey = Utils.generateRandomToken(50);
      const user = new UserEntity(null, userKey, client.key, dayjs(), null, false);
      await user.save();
      const device = new UserDeviceEntity(
        null,
        userKey,
        deviceKey,
        client.key,
        null,
        null,
        null,
        null,
        null,
        UserDevicesStatus.DEVICE_CONFIGURATION,
        dayjs(),
        dayjs().add(14, "days"),
        null,
        false
      );
      await device.save();
      const log = new LogEntity(null, ActionLogTypes.USER_NEW, dayjs(), userKey, deviceKey, client.key, apiClientSession.id);
      await log.save();

      RequestManager.sendResponse(response, {
        success: true,
        data: {
          userKey: userKey,
          emailKey: deviceKey
        }
      });
    })
);

UsersRouter.post(
  "/authentication",
  AclManager.hasPermissionRoute(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          authKey: string;
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

      if (request.body.data && !request.body.data.authKey) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.INVALID_REQUEST,
            message: "Request mal formatted"
          }
        });
      }
      const { authKey } = request.body.data!;
      RequestManager.sendResponse(response, {
        success: true,
        data: {}
      });
    })
);

export default UsersRouter;
