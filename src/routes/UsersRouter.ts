import {Router} from "express";
import AclManager from "../permissions/AclManager";
import {Permissions} from "../permissions/permissions";
import RequestManager from "../modules/Global/RequestManager";
import {ApplicationRequest} from "../utils/Types";
import {AuthenticationErrors, GeneralErrors} from "../modules/Global/BackendErrors";
import Utils from "../utils/Utils";
import UserEntity from "../modules/users/UserEntity";
import moment from "moment/moment";
import UserAuthEntity from "../modules/userAuths/UserAuthEntity";
import UserAuthsManager from "../modules/userAuths/UserAuthsManager";

const UsersRouter = Router();

UsersRouter.post(
    "/registration",
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
                        code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_ON,
                        message: "You must be logged on"
                    }
                });
            }
            const { service, } = request.tokenDecryptedData!;
            const key = Utils.generateRandomToken(50);
            const authKey = Utils.generateRandomToken(50);
            const user = new UserEntity(null, key, service.key, moment());
            await user.save();
            const userAuth = new UserAuthEntity(null, key, authKey, moment(), moment().add(7, "days"), false);
            await userAuth.save();
            RequestManager.sendResponse(response, {
                success: true,
                data: {
                    userKey: key,
                    emailKey: authKey
                }
            })
        })
)

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
            if (request.isLogged) {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
                        message: "You must be logged off"
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
            const authUserResponse = await UserAuthsManager.findByAuthKey(authKey);
            if (!authUserResponse.success && !authUserResponse.data) {
                return RequestManager.sendResponse(response, authUserResponse);
            }
            const { userAuth } = authUserResponse.data!;
            if (moment().format("YYYY-MM-DD HH:mm:ss") > userAuth.expirationDate.format("YYYY-MM-DD HH:mm:ss")) {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: GeneralErrors.KEY_EXPIRATION,
                        message: "Key has expire"
                    }
                });
            }
            if (userAuth.authKey !== authKey || userAuth.hasBeenProcess) {
                return RequestManager.sendResponse(response, {
                    success: false,
                    error: {
                        code: GeneralErrors.KEY_EXPIRATION,
                        message: "Key is not valid"
                    }
                });
            }
            userAuth.hasBeenProcess = true;
            await userAuth.save();

            RequestManager.sendResponse(response, {
                success: true,
                data: {
                    userKey: userAuth.userKey
                }
            })
        })
)

export default UsersRouter;
