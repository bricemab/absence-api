import {Request, request} from "express";
import {ApplicationRequest, TokenRequestSession} from "../utils/Types";
import {Permissions} from "./permissions";
import RequestManager from "../modules/Global/RequestManager";
import {AuthenticationErrors} from "../modules/Global/BackendErrors";
import {UserRole} from "../modules/users/UserRole";
import {RolesPermissions} from "./rolesPermissions";

export default class AclManager {
  public static hasPermissionRoute(permission: string) {
    return (
      request: ApplicationRequest<any>,
      response: Response,
      next: any
    ) => {
      if (permission === Permissions.specialState.allowAll || permission === Permissions.specialState.userLoggedOff)
        return next();
      if (AclManager.hasUserAccessPermission(permission, request.tokenDecryptedData))
        return next();
      RequestManager.sendResponse(
        response,
        {
          success: false,
          error: {
            code: AuthenticationErrors.ACCESS_NOT_AUTHORIZED,
            message: "You are not allowed to use this function"
          }
        },
        403
      );
    }
  }

  public static hasUserAccessPermission(permission: string, tokenDecryptedData?: TokenRequestSession) {
    let hasPermission = false;
    if (!tokenDecryptedData) return false;
    const userRole = tokenDecryptedData.role ?? UserRole.USER_ANONYMOUS;
    // @ts-ignore
    const rolesPermissions = RolesPermissions[userRole];
    if (permission && permission.includes("specialState.")) {
      switch (permission) {
        case Permissions.specialState.allowAll:
          return true;
        case Permissions.specialState.userLoggedIn:
          return !!tokenDecryptedData;
        case Permissions.specialState.userLoggedOff:
          return !tokenDecryptedData;
        default:
          console.error("Unkwown special permission, please specify it");
          console.error(permission);
      }
    } else {
      if (!rolesPermissions){
        console.error("This role must be declared in permissions");
        console.error(rolesPermissions);
        return false;
      }
      rolesPermissions.map((rolePermission: string | { [s: string]: unknown; } | ArrayLike<unknown>) => {
        if (typeof rolePermission === "object") {
          if (Object.values(rolePermission).includes(permission)) hasPermission = true;
        } else if (rolePermission === permission) hasPermission = true;
      })
    }

    return hasPermission;
  }
}
