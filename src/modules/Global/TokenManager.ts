import {NextFunction, Request, request} from "express";
import {ApplicationRequest, ServiceType, UserApiClientSession, UserClientType} from "../../utils/Types";
import {ApplicationReject, AuthenticationErrors} from "./BackendErrors";
import config from "../../config/config";
import RequestManager from "./RequestManager";
import {UserRole} from "../users/UserRole";
import UsersManager from "../users/UsersManager";
import moment from "moment/moment";
import ClientsManager from "../clients/ClientsManager";
import ClientEntity from "../clients/ClientEntity";
import ApiClientEntity from "../apiClients/ApiClientEntity";
import ApiClientsManager from "../apiClients/ApiClientsManager";
import Utils from "../../utils/Utils";

export default class TokenManager {
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
        const {data, token} = request.body;
        if (!Utils.validateHmacSha256Signature(token, data)) {
            return RequestManager.sendResponse(response, {
                success: false,
                error: {
                    code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
                    message: "Packet not authentic"
                }
            });
        }
        const userApiClientSession = {
            type: UserClientType.USER,
            service: null as unknown as ClientEntity,
            serviceKey: "",
            key: "",
            validationKey: "",
            creationDate: moment(),
            role: UserRole.USER_ANONYMOUS
        }
        const userToken = request.headers["x-user-token"] as string;
        const apiClientToken = request.headers["x-api-client-token"] as string;
        const validationToken = request.headers["x-validation-token"] as string;
        if ((!apiClientToken || apiClientToken === "") && (!userToken || userToken === "")) {
            request.rawToken = "";
            request.tokenDecryptedData = userApiClientSession as unknown as UserApiClientSession;
            request.hasValidToken = false;
            request.isLogged = false;
            return next();
        }
        let serviceKey = "";
        if (apiClientToken !== "") {
            const clientResponse = await ApiClientsManager.findByKey(apiClientToken);
            if (!clientResponse.success && !clientResponse.data) {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
                        message: "Token not match"
                    }
                });
            }
            const { apiClient } = clientResponse.data!;
            serviceKey = apiClient.serviceKey;
            userApiClientSession.type = UserClientType.API_CLIENT;
            userApiClientSession.serviceKey = apiClient.serviceKey;
            userApiClientSession.key = apiClient.key;
            userApiClientSession.creationDate = apiClient.creationDate;
            userApiClientSession.validationKey = apiClient.validationKey;
            userApiClientSession.role = UserRole.USER_API_CLIENT;
            if (apiClient.validationKey !== validationToken) {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
                        message: "Validation Token not match DB"
                    }
                });
            }
            if (!Utils.validateHmacSha256ValidationKey(validationToken, apiClient.key, apiClient.serviceKey, apiClient.creationDate.format("YYYY-MM-DD HH:mm:ss")))
            {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
                        message: "Validation Token not match"
                    }
                });
            }
        }
        if (userToken !== "" && !!userToken) {
            const userResponse = await UsersManager.findByKey(userToken);
            if (!userResponse.success && !userResponse.data) {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
                        message: "Token not match"
                    }
                });
            }
            const { user } = userResponse.data!;
            serviceKey = user.serviceKey;
            userApiClientSession.type = UserClientType.USER;
            userApiClientSession.serviceKey = user.serviceKey;
            userApiClientSession.key = user.key;
            userApiClientSession.creationDate = user.creationDate;
            userApiClientSession.role = UserRole.USER_SCANNER;
        }
        const serviceResponse = await ClientsManager.findByKey(serviceKey);
        if (!serviceResponse.data && !serviceResponse.success) {
            return RequestManager.sendResponse(response, {
                success: false,
                error: {
                    code: AuthenticationErrors.AUTH_NO_TOKEN_PROVIDED,
                    message: "Token not match"
                }
            });
        }
        userApiClientSession.service = serviceResponse.data!.service;
        request.tokenDecryptedData = userApiClientSession as unknown as UserApiClientSession;
        request.hasValidToken = true;
        request.isLogged = true;
        next();
    }
}
