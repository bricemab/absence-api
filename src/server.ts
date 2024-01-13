import fs from "fs";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import {Request, Response} from "express";
const express = require("express");
import {createPool, QueryError, RowDataPacket} from "mysql2";
import mariadb from "mariadb";

import config from "./config/config";
import Utils from "./utils/Utils";
import GlobalStore from "./utils/GlobalStore";
import Logger from "./utils/Logger";
import UsersRouter from "./routes/UsersRouter";
import TokenManager from "./modules/Global/TokenManager";

const app = express();
const setup = async () => {
  Logger.verbose(`Setup started`);
  // app.use(
  //   morgan("combined", {
  //     stream: fs.createWriteStream(
  //       path.join(
  //         __dirname,
  //         `../scannerLogs/http/access_${Utils.generateCurrentDateFileName()}.log`
  //       ),
  //       {
  //         flags: "a"
  //       }
  //     )
  //   })
  // )
  app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));
  app.use(bodyParser.json({limit: "50mb"}));
  app.use(cors());
  app.set("trust proxy", 1);
  app.use(TokenManager.buildSessionToken);

  const pool = await createPool({
    host: config.database.host,
    user: config.database.user,
    database: config.database.database,
    password: config.database.password,
    namedPlaceholders: true,
    connectionLimit: 20,
  });

  const keepAlive = async () => {
    pool.getConnection((err, connection) => {
      connection.query("SELECT 1", (error: QueryError, rows: RowDataPacket) => {
        connection.end();
        if (error) {
          console.log(`QUERY ERROR: ${error}`);
        }
      });
    });
  }
  setInterval(keepAlive, 1000 * 60 * 60);
  // const promisePool = await pool.getConnection();
  const promisePool = await pool.promise();
  GlobalStore.addItem("dbConnection", promisePool);
}

setup().then(() => {
  Logger.verbose(`Setup end`);
  Logger.verbose(`Binding routes`);

  app.use("/users", UsersRouter);
  app.get("*", (req: Request, res: Response) => {
    res.json({state: "Page dont exist"});
  });
  app.post("*", (req: Request, res: Response) => {
    res.json({state: "Page dont exist"});
  });

  Logger.verbose(`Server starting`);
  app.listen(config.server.port, "0.0.0.0", () => {
    const protocol = config.isDevModeEnabled ? "http" : "http";
    Logger.info(
      `Absence API is now running on ${protocol}://${config.server.hostName}:${config.server.port}`
    );
  });

  app.on("error", (error: any) => {
    Logger.error(`Error occurred in express: ${error}`);
  });
}).catch(error => {
  console.log(error);
})
