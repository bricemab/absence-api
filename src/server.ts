import bodyParser from "body-parser";
import cors from "cors";
import { Request, Response } from "express";
import { createPool, QueryError, RowDataPacket } from "mysql2";

import config from "./config/config";
import GlobalStore from "./utils/GlobalStore";
import Logger from "./utils/Logger";
import AppUsersRouter from "./routes/app/UsersRouter";
import ApiUsersRouter from "./routes/api/UsersRouter";
import TokenManager from "./modules/Global/TokenManager";
import { GeneralErrors } from "./modules/Global/BackendErrors";
import { FirebaseSendMessage, FirebaseSendMessageType } from "./services/Firebase/FirebaseAdmin";
import { FirebaseNotificationCode } from "./utils/Types";
import AppCertificatesRouter from "./routes/app/CertificatesRouter";
import ApiCertificatesRouter from "./routes/api/CertificatesRouter";

const express = require("express");


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
  app.get("/push", async (req: Request, res: Response) => {
    const payload: FirebaseSendMessageType = {
      notification: {
        title: 'asfasfasfas',
        body: 'Votre message ici'
      },
      data: {
        code: FirebaseNotificationCode.REMOVE_DEVICE,
        cle1: 'valeur1',
        cle2: 'valeur2',
      },
      android: {
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
      token: "fu5t9UtOTwWAHHRDGteEaR:APA91bG3aR7tSl8tkCz63pIvLBk69lsglt48FXjgOeNX6NquGRdsItACAwrOpaRllqrVg5Nl5FRmR3JWSKHE2V6bQ6PUuKmK7_4GQctTcsGCJu94aXvlwfDs5HGcikqSWUu2IbOEitbl",
    };

    await FirebaseSendMessage(payload);
    res.send({});
  })
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

  app.use("/users", AppUsersRouter);
  app.use("/certificates", AppCertificatesRouter);
  app.use("/api/users", ApiUsersRouter);
  app.use("/api/certificates", ApiCertificatesRouter);
  app.get("*", (req: Request, res: Response) => {
    res.status(404);
    res.json({
      success: false,
      error: {
        code: GeneralErrors.PAGE_NOT_EXIST,
        message: "The user couldn't be found in database",
      }
    });
  });
  app.post("*", (req: Request, res: Response) => {
    res.status(404);
    res.json({
      success: false,
      error: {
        code: GeneralErrors.PAGE_NOT_EXIST,
        message: "This page doesn't exist",
      }
    });
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
