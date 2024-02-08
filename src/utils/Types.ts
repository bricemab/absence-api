import {UserRole} from "../modules/users/UserRole";
import { ApiClientErrors, AuthenticationErrors, GeneralErrors, UserErrors } from "../modules/Global/BackendErrors";
import dayjs, { Dayjs } from "dayjs";
import { UserDevicesStatus } from "../modules/userDevices/UserDevicesTypes";

export interface ApplicationError {
  code: GeneralErrors | AuthenticationErrors | UserErrors | ApiClientErrors;
  message: string;
  details?: any;
}

export interface ApplicationResponse<DataType> {
  success: boolean;
  data?: DataType;
  error?: ApplicationError;
}

export type ApplicationResponsePromise<DataType> = Promise<
  ApplicationResponse<DataType>
>;

export enum UserClientType {
  API_CLIENT = "API_CLIENT",
  SCANNER_USER = "SCANNER_USER",
  APP_USER = "APP_USER",
  ANONYMOUS = "ANONYMOUS"
}

export interface ClientType {
  key: string;
  name: string;
}

export interface ClientApiSession {
  id: number;
  key: string;
  validationKey: string;
  clientKey: string;
  creationDate: Dayjs;
}

export interface UserDeviceSession {
  id: number;
  userKey: string;
  key: string;
  clientKey: string;
  brand: string | null;
  model: string | null;
  os: string | null;
  version: string | null;
  status: UserDevicesStatus;
  creationDate: Dayjs;
  keyExpirationDate: Dayjs;
  hasBeenProcess: number;
}

export interface UserSession {
  id: number;
  key: string;
  clientKey: string;
  deviceKey: string;
  creationDate: Dayjs;
  activationDate: Dayjs | null;
  isActive: boolean;
}

export interface RoomSession {
  id: number;
  name: string;
  key: string;
  clientId: number;
}

export interface ScannerSession {
  id: number;
  name: string;
  key: string;
  room: RoomSession;
}

export interface TokenRequestSession {
  type: UserClientType;
  client: ClientType;
  role: UserRole;
  user: UserSession | ClientApiSession | ScannerSession;
}

// export interface TokenRequestSession {
//   type: UserClientType,
//   client: ClientType,
//   clientKey: string,
//   key: string,
//   apiClientId: number | null,
//   validationKey: string,
//   deviceKey: string,
//   creationDate: Dayjs,
//   role: UserRole
// }

// @ts-ignore
export interface ApplicationRequest<BodyData> extends Request {
  request: TokenRequestSession;
  rawToken: string;
  hasValidToken: boolean;
  isLogged: boolean;
  tokenDecryptedData?: TokenRequestSession;
  body: BodyData;
  headers: {
    "x-access-token": string;
    "x-user-token"?: string;
    "x-device-token"?: string;
    "x-api-client-token"?: string;
    "x-validation-token"?: string;
    "x-scanner-token"?: string;
    "x-room-token"?: string;
  };
}

export enum FirebaseNotificationCode {
  REMOVE_DEVICE = "REMOVE_DEVICE"
}
