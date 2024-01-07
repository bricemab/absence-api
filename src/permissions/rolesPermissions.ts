import {UserRole} from "../modules/users/UserRole";
import {Permissions} from "./permissions";

export const RolesPermissions = {
  USER_ANONYMOUS: [],
  USER_ADMIN: [
    Permissions.usersManager.list,
    Permissions.usersManager.add,
    Permissions.usersManager.registration,
    Permissions.usersManager.delete,
  ],
  USER_SCANNER: [

  ],
  USER_API_CLIENT: [
    Permissions.usersManager.list,
    Permissions.usersManager.add,
    Permissions.usersManager.registration,
    Permissions.usersManager.delete,
  ]
}
