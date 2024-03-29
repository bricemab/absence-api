import GlobalStore from "./GlobalStore";
import {Pool, ResultSetHeader} from "mysql2";
import Logger from "./Logger";
import {ApplicationError} from "./Types";
import util from "util";
import crypto from "crypto";
import qs from "qs";
import config from "../config/config";
import { Dayjs } from "dayjs";

const buildHmacSha256Signature = (parameters: Object | string) => {
  let dataQueryString = parameters;
  if (typeof parameters === "object") {
    dataQueryString = qs.stringify(parameters); // .replace("%20", "+");
  }
  // @ts-ignore
  return crypto
      .createHmac("sha256", config.server.security.hmacSecretPacketKey)
      .update(dataQueryString.toString())
      .digest("hex");
};
const validateHmacSha256Signature = (token: string, data: Object) => {
  const signature = buildHmacSha256Signature(data);
  return signature === token;
};

const validateHmacSha256ValidationKey = (token: string, userKey: string, serviceKey: string, creationDate: string) => {
  const sep = config.server.security.separatorValidationKey;
  const data = `${userKey}${sep}${serviceKey}${sep}${creationDate}`;
  const signature = buildHmacSha256Signature(data);
  return signature === token;
}
const generateCurrentDateFileName = () => {
  const today = new Date();
  return `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
};

export default {
  formatDef(dayjs: Dayjs): string {
    return dayjs.format("YYYY-MM-DD HH:mm:ss")
  },
  validateHmacSha256ValidationKey,
  generateCurrentDateFileName,
  validateHmacSha256Signature,
  generateRandomToken(length: number) {
    // edit the token allowed characters
    const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
        ""
    );
    const b = [];
    for (let i = 0; i < length; i++) {
      const j: number = ((Math.random() * (a.length - 1)).toFixed(
          0
      ) as unknown) as number;
      b[i] = a[j];
    }
    return b.join("");
  },
  castMysqlRecordsToArray<ResultsType>(rows: any): ResultsType[] | undefined {
    if (Array.isArray(rows)) {
      return rows[0];
    }
  },
  validateTimeHHmm(time: string): boolean {
    const regex = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;
    return regex.test(time);
  },
  castMysqlRecordToObject<ResultsType>(rows: any): ResultsType | undefined {
    const [data] = rows;
    if (Array.isArray(data)) {
      return data[0];
    }
    return data;
  },
  getMysqlPool(): Pool {
    return GlobalStore.getItem<Pool>("dbConnection");
  },
  debug(variable: any) {
    console.log(util.inspect(variable, false, null, true /* enable colors */));
  },
  manageError(errorMessage: ApplicationError) {
    Logger.error(errorMessage.toString());
    this.debug(errorMessage);
  },
  async executeMysqlRequest(fn: any) {
    const [results, other]: [ResultSetHeader, any] = await fn;
    return results;
  },
  async awaitTimeout(time: number) {
    return new Promise(resolve => {setTimeout(resolve, time);})
  }
}
