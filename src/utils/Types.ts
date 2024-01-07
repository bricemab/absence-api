import {UserRole} from "../modules/users/UserRole";
import {AuthenticationErrors, GeneralErrors} from "../modules/Global/BackendErrors";

export interface ApplicationError {
  code: GeneralErrors | AuthenticationErrors;
  message: string;
  details?: any;
}

export interface ApplicationResponse<DataType> {
  success: boolean;
  data?: DataType;
  error?: ApplicationError;
}

export enum UserClientType {
  API_CLIENT = "API_CLIENT",
  USER = "USER"
}

export interface ServiceType {
  key: string;
  name: string;
}

export interface UserApiClientSession {
  type: UserClientType,
  service: ServiceType,
  serviceKey: string,
  key: string,
  validationKey: string,
  creationDate: Date,
  role: UserRole
}

// @ts-ignore
export interface ApplicationRequest<BodyData> extends Request {
  request: UserApiClientSession;
  rawToken: string;
  hasValidToken: boolean;
  isLogged: boolean;
  tokenDecryptedData?: UserApiClientSession;
  body: BodyData;
  headers: {
    "x-access-token": string;
    "x-user-token"?: string;
    "x-api-client-token"?: string;
    "x-validation-token"?: string;
  };
}
