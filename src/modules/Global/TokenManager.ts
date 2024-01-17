import { NextFunction } from "express";
import { ApplicationRequest, ClientApiSession, UserClientType, UserSession } from "../../utils/Types";
import { AuthenticationErrors } from "./BackendErrors";
import config from "../../config/config";
import RequestManager from "./RequestManager";
import { UserRole } from "../users/UserRole";
import ClientsManager from "../clients/ClientsManager";
import ApiClientsManager from "../apiClients/ApiClientsManager";
import Utils from "../../utils/Utils";
import { Dayjs } from "dayjs";
import UsersManager from "../users/UsersManager";

export default class TokenManager {
  // static async buildSessionToken(
  //   expressRequest: ApplicationRequest<any>,
  //   response: Response,
  //   next: NextFunction
  // ) {
  //   const request = expressRequest as ApplicationRequest<{
  //     data: {};
  //     token: string;
  //   }>;
  //
  //   const backendToken = request.headers["x-access-token"] as string;
  //   if (backendToken !== config.server.security.backendTokenSecretKey) {
  //     return RequestManager.sendResponse(response, {
  //       success: false,
  //       error: {
  //         code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //         message: "Backendtoken not match"
  //       }
  //     });
  //   }
  //   const { data, token } = request.body;
  //   if (!Utils.validateHmacSha256Signature(token, data)) {
  //     return RequestManager.sendResponse(response, {
  //       success: false,
  //       error: {
  //         code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //         message: "Packet not authentic"
  //       }
  //     });
  //   }
  //   const userApiClientSession: TokenRequestSession = {
  //     type: UserClientType.USER,
  //     client: null as unknown as ClientEntity,
  //     clientKey: "",
  //     apiClientId: 0,
  //     key: "",
  //     validationKey: "",
  //     deviceKey: "",
  //     creationDate: dayjs(),
  //     role: UserRole.USER_ANONYMOUS
  //   };
  //   const userToken = request.headers["x-user-token"] as string;
  //   const deviceKey = request.headers["x-device-token"] as string;
  //   // token pour l'api
  //   const apiClientToken = request.headers["x-api-client-token"] as string;
  //   // token pour l'api
  //   const validationToken = request.headers["x-validation-token"] as string;
  //   if ((!apiClientToken || apiClientToken === "") && (!userToken || userToken === "")) {
  //     request.rawToken = "";
  //     request.tokenDecryptedData = userApiClientSession as unknown as TokenRequestSession;
  //     request.hasValidToken = false;
  //     request.isLogged = false;
  //     return next();
  //   }
  //   let clientKey = "";
  //   if (apiClientToken !== "") {
  //     const clientResponse = await ApiClientsManager.findByKey(apiClientToken);
  //     if (!clientResponse.success && !clientResponse.data) {
  //       return RequestManager.sendResponse(response, {
  //         success: false,
  //         error: {
  //           code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //           message: "Token not match"
  //         }
  //       });
  //     }
  //     const { apiClient } = clientResponse.data!;
  //     clientKey = apiClient.clientKey;
  //     userApiClientSession.type = UserClientType.API_CLIENT;
  //     userApiClientSession.clientKey = apiClient.clientKey;
  //     userApiClientSession.apiClientId = apiClient.id!;
  //     userApiClientSession.key = apiClient.key;
  //     userApiClientSession.creationDate = apiClient.creationDate;
  //     userApiClientSession.validationKey = apiClient.validationKey;
  //     userApiClientSession.role = UserRole.USER_API_CLIENT;
  //     if (apiClient.validationKey !== validationToken) {
  //       return RequestManager.sendResponse(response, {
  //         success: false,
  //         error: {
  //           code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //           message: "Validation Token not match DB"
  //         }
  //       });
  //     }
  //     if (!Utils.validateHmacSha256ValidationKey(validationToken, apiClient.key, apiClient.clientKey, apiClient.creationDate.format("YYYY-MM-DD HH:mm:ss"))) {
  //       return RequestManager.sendResponse(response, {
  //         success: false,
  //         error: {
  //           code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //           message: "Validation Token not match"
  //         }
  //       });
  //     }
  //   }
  //   if ((userToken !== "" && !!userToken) && (deviceKey !== "" && !!deviceKey)) {
  //     const userResponse = await UsersManager.findByKey(userToken);
  //     if (!userResponse.success && !userResponse.data) {
  //       return RequestManager.sendResponse(response, {
  //         success: false,
  //         error: {
  //           code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //           message: "Token not match"
  //         }
  //       });
  //     }
  //     const deviceResponse = await UserDevicesManager.findByKeyAndUser(deviceKey, userToken);
  //     if (!deviceResponse.success && !deviceResponse.data) {
  //       return RequestManager.sendResponse(response, {
  //         success: false,
  //         error: {
  //           code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //           message: "Device Token not match"
  //         }
  //       });
  //     }
  //     const { userDevice } = deviceResponse.data!;
  //     const { user } = userResponse.data!;
  //     if (userDevice.status === UserDevicesStatus.DEVICE_DELETE_BY_USER) {
  //       return RequestManager.sendResponse(response, {
  //         success: false,
  //         error: {
  //           code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //           message: "Device Token has been disabled"
  //         }
  //       });
  //     }
  //     clientKey = user.clientKey;
  //     userApiClientSession.type = UserClientType.USER;
  //     userApiClientSession.clientKey = user.clientKey;
  //     userApiClientSession.key = user.key;
  //     userApiClientSession.deviceKey = deviceKey;
  //     userApiClientSession.creationDate = user.creationDate;
  //     userApiClientSession.apiClientId = null;
  //     userApiClientSession.role = UserRole.USER_SCANNER;
  //   }
  //   const clientResponse = await ClientsManager.findByKey(clientKey);
  //   if (!clientResponse.data && !clientResponse.success) {
  //     return RequestManager.sendResponse(response, {
  //       success: false,
  //       error: {
  //         code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
  //         message: "Token not match"
  //       }
  //     });
  //   }
  //   userApiClientSession.client = clientResponse.data!.client;
  //   request.tokenDecryptedData = userApiClientSession as unknown as TokenRequestSession;
  //   request.hasValidToken = true;
  //   request.isLogged = true;
  //   next();
  // }
  static async buildSessionToken(
    expressRequest: ApplicationRequest<any>,
    response: Response,
    next: NextFunction
  ) {
    const request = expressRequest as ApplicationRequest<{
      data: {};
      token: string;
    }>;
    const backendToken = request.headers["x-access-token"] as string;
    if (backendToken !== config.server.security.backendTokenSecretKey) {
      return RequestManager.sendResponse(response, {
        success: false,
        error: {
          code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
          message: "Backendtoken not match"
        }
      });
    }
    const { data, token } = request.body;
    if (!Utils.validateHmacSha256Signature(token, data)) {
      return RequestManager.sendResponse(response, {
        success: false,
        error: {
          code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
          message: "Packet not authentic"
        }
      });
    }
    // @ts-ignore
    request.tokenDecryptedData = {};
    // token pour le scanner user
    const userKey = request.headers["x-user-token"] as string;
    const deviceKey = request.headers["x-device-token"] as string;
    // token pour l'api
    const apiClientToken = request.headers["x-api-client-token"] as string;
    const validationToken = request.headers["x-validation-token"] as string;
    // scanner token
    const scannerToken = request.headers["x-scanner-token"] as string;
    const roomToken = request.headers["x-room-token"] as string;
    const userType = TokenManager.getUserType(userKey, deviceKey, apiClientToken, validationToken, scannerToken, roomToken);
    request.tokenDecryptedData!.type = userType;
    switch (userType) {
      case UserClientType.ANONYMOUS:
        request.rawToken = "";
        request.hasValidToken = true;
        request.isLogged = false;
        break;
      case UserClientType.SCANNER_USER:
        throw new Error("faut faire le validation des tokens de room + scanner (ceux de la DB)")
        request.hasValidToken = true;
        request.isLogged = true;
        break;
      case UserClientType.APP_USER:
        const isAppUserConnexionValid = await UsersManager.validUserKeyDeviceKey(userKey, deviceKey);
        if (!isAppUserConnexionValid.success) {
          return RequestManager.sendResponse(response, isAppUserConnexionValid);
        }
        const { user, device } = isAppUserConnexionValid.data!;
        const clientUserResponse = await ClientsManager.findByKey(user.clientKey);
        const { client: clientUser } = clientUserResponse.data!;
        const userSession: UserSession = {
          id: user.id!,
          key: user.key,
          clientKey: user.clientKey,
          creationDate: user.creationDate,
          activationDate: user.activationDate,
          isActive: user.isActive
        }
        request.tokenDecryptedData!.client = clientUser;
        request.tokenDecryptedData!.role = UserRole.USER_APP;
        request.tokenDecryptedData!.user = userSession;
        request.hasValidToken = true;
        request.isLogged = true;
        break;
      case UserClientType.API_CLIENT:
        const isConnexionValid = await ApiClientsManager.validApiConnexion(apiClientToken, validationToken);
        if (!isConnexionValid.success) {
          return RequestManager.sendResponse(response, isConnexionValid);
        }
        const { apiClient } = isConnexionValid.data!;
        const clientResponse = await ClientsManager.findByKey(apiClient.clientKey);
        const { client } = clientResponse.data!;
        request.tokenDecryptedData!.client = client;
        request.tokenDecryptedData!.role = UserRole.USER_API_CLIENT;
        const apiClientSession: ClientApiSession = {
          id: apiClient.id!,
          key: apiClient.key,
          validationKey: apiClient.validationKey,
          clientKey: apiClient.clientKey,
          creationDate: apiClient.creationDate
        }
        request.tokenDecryptedData!.user = apiClientSession;
        request.hasValidToken = true;
        request.isLogged = true;
        break;
      default:
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
            message: "Packet not authentic"
          }
        });
        break;
    }
    next();
  }

  static getUserType(userKey: string, deviceKey: string, apiClientToken: string, validationToken: string, scannerToken: string, roomToken: string) {
    userKey = userKey ? userKey.trim() : "";
    deviceKey = deviceKey ? deviceKey.trim() : "";
    apiClientToken = apiClientToken ? apiClientToken.trim() : "";
    validationToken = validationToken ? validationToken.trim() : "";
    scannerToken = scannerToken ? scannerToken.trim() : "";
    roomToken = roomToken ? roomToken.trim() : "";
    if (userKey === "" && deviceKey === "" && apiClientToken === "" && validationToken === "" && scannerToken === "" && roomToken === "")
      return UserClientType.ANONYMOUS;
    if (userKey === "" && deviceKey === "" && apiClientToken !== "" && validationToken !== "" && scannerToken === "" && roomToken === "")
      return UserClientType.API_CLIENT;
    if (userKey !== "" && deviceKey !== "" && apiClientToken === "" && validationToken === "" && scannerToken !== "" && roomToken !== "")
      return UserClientType.APP_USER;
    if (userKey !== "" && deviceKey !== "" && apiClientToken !== "" && validationToken !== "" && scannerToken === "" && roomToken === "")
      return UserClientType.SCANNER_USER;
    return UserClientType.ANONYMOUS;
  }
}
