import FirebaseAdmin from "firebase-admin";
import { config } from "./config";
import { Message } from "firebase-admin/lib/messaging";
import { FirebaseNotificationCode } from "../../utils/Types";

export interface FirebaseSendMessageType {
  token: string,
  notification: {
    title: string;
    body: string;
  }
  data: {
    code: FirebaseNotificationCode;
    [key: string]: any;
  };
  android: {
    priority: 'high' | 'normal',
  };
  apns: {
    headers: {
      'apns-priority': '10',
    },
  },
}

FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(config as FirebaseAdmin.ServiceAccount),
});

export const FirebaseSendMessage = async (message: FirebaseSendMessageType) => {
  const payload: FirebaseSendMessageType = {
    notification: {
      title: message.notification.title,
      body: message.notification.body
    },
    data: message.data,
    android: {
      priority: message.android && message.android.priority ? message.android.priority : "high",
    },
    apns: {
      headers: {
        'apns-priority': message.apns && message.apns.headers && message.apns.headers["apns-priority"] ?
          message.apns.headers["apns-priority"] : "10",
      },
    },
    token: message.token
  };

  return new Promise(resolve => {
    FirebaseAdmin.messaging().send(payload as Message).then(response => {
      resolve(response)
    }).catch(error => {
      console.log("error firebase send")
      console.log(error)
      console.log(payload)
      resolve(error)
    });
  })
}

export default FirebaseAdmin;
