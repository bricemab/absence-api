import {ScannerLogsType} from "../scannerLogs/ScannerLogsType";
import {UserDevicesStatus} from "../userDevices/UserDevicesTypes";
import {LogsType} from "../logs/logsType";

export interface DataBaseApiClient {
    id: number;
    key: string;
    client_key: string;
    validation_key: string;
    creation_date: string;
}

export interface DataBaseClient {
    id: number;
    key: string;
    name: string;
}

export interface DatabaseLog {
    id: number;
    action: LogsType;
    date: string;
    user_key: string;
    client_key: string;
    api_client_id: number;
}

export interface DatabaseRoom {
    id: number;
    key: string;
    name: string;
    client_id: number;
}

export interface DatabaseScannerLog {
    id: number;
    user_key: string;
    device_id: number;
    client_key: string;
    room_id: number;
    date: string;
    type: ScannerLogsType
}

export interface DatabaseUserDevice {
    id: number;
    user_key: string;
    validation_key: string;
    brand: string | null;
    model: string | null;
    os: string | null;
    version: string | null;
    status: UserDevicesStatus;
    creation_date: string;
    key_expiration_date: string;
    has_been_process: number;
}

export interface DataBaseUser {
    id: number;
    key: string;
    client_key: string;
    creation_date: string;
    activation_date: string;
    is_active: number;
}
