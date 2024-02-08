import {Router} from "express";
import jwt from "jsonwebtoken";
import AclManager from "../../permissions/AclManager";
import {Permissions} from "../../permissions/permissions";
import RequestManager from "../../modules/Global/RequestManager";
import { ApplicationRequest, UserSession } from "../../utils/Types";
import { AuthenticationErrors, GeneralErrors, UserErrors } from "../../modules/Global/BackendErrors";
import Utils from "../../utils/Utils";
import UserDevicesManager from "../../modules/userDevices/UserDevicesManager";
import dayjs from "dayjs";
import { UserDevicesStatus } from "../../modules/userDevices/UserDevicesTypes";
import UsersManager from "../../modules/users/UsersManager";
import ClientsManager from "../../modules/clients/ClientsManager";
import { UserRole } from "../../modules/users/UserRole";
import config from "../../config/config";

const UsersRouter = Router();

// Route pour configurer l'application du user
UsersRouter.post(
  "/register",
  AclManager.hasPermissionRoute(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
        request: ApplicationRequest<{
          token: string;
          data: {
            key: string;
            brand: string;
            model: string;
            version: string;
            apnsToken: string;
            os: string;
          };
        }>,
        response: Response
    ) => {
      if (request.isLogged) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You must be logged off"
          }
        });
      }
      if (!request.body.data ||
        !request.body.data.key ||
        !request.body.data.apnsToken
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.INVALID_REQUEST,
            message: "This request is malformated or invalid"
          }
        });
      }
      const { apnsToken, version, os, key: deviceKey, model , brand } = request.body.data!;
      const deviceUserResponse = await UserDevicesManager.findByKey(deviceKey);
      if (!deviceUserResponse.success && !deviceUserResponse.data) {
        await Utils.awaitTimeout(3000);
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.KEY_NO_MATCH,
            message: "The key provided doesn't match in database"
          }
        })
      }
      const { userDevice } = deviceUserResponse.data!;
      if (Utils.formatDef(userDevice.keyExpirationDate) < Utils.formatDef(dayjs()) || userDevice.hasBeenProcess) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.KEY_HAS_EXPIRED,
            message: "The key provided has expired"
          }
        })
      }
      const userResponse = await UsersManager.findByKey(userDevice.userKey);
      const { user } = userResponse.data!;
      userDevice.status = UserDevicesStatus.DEVICE_ENABLED;
      userDevice.brand = brand;
      userDevice.model = model;
      userDevice.os = os;
      userDevice.version = version;
      userDevice.apnsToken = apnsToken;
      userDevice.activationDate = dayjs();
      // userDevice.hasBeenProcess = true;
      await userDevice.save();
      user.activationDate = dayjs();
      user.isActive = true;
      await user.save();
      const clientResponse = await ClientsManager.findByKey(user.clientKey);
      const { client } = clientResponse.data!;
      const userSession = {
        client: client.name,
        userKey: user.key,
        deviceKey: userDevice.key,
        status: userDevice.status,
        role: UserRole.USER_APP
      };
      const token = jwt.sign(
        {
          currentUser: userSession
        },
        config.server.security.jwtTokenSecretKey,
        {
          expiresIn: `${config.server.security.sessionDurationInMinutes}m`
        }
      );
      RequestManager.sendResponse(response, {
        success: true,
        data: {
          token,
          userSession
        }
      });
    }
  )
)

UsersRouter.post(
  "/refresh-token",
  AclManager.hasPermissionRoute(Permissions.specialState.userLoggedIn),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          newToken: string;
        };
      }>,
      response: Response
    ) => {
      if (request.isLogged) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You must be logged off"
          }
        });
      }
      if (!request.body.data ||
        !request.body.data.newToken
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.INVALID_REQUEST,
            message: "This request is malformated or invalid"
          }
        });
      }
      const { newToken } = request.body.data!;
      const user = request.tokenDecryptedData!.user as UserSession;
      const deviceUserResponse = await UserDevicesManager.findByKey(user.deviceKey);
      if (!deviceUserResponse.success && !deviceUserResponse.data) {
        await Utils.awaitTimeout(2000);
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.DEVICE_NOT_FOUND,
            message: "The device key doesn't match in database"
          }
        })
      }
      const { userDevice } = deviceUserResponse.data!;
      userDevice.apnsToken = newToken;
      await userDevice.save();
      RequestManager.sendResponse(response, {
        success: true,
        data: {}
      });
    }
  )
)
export default UsersRouter;
