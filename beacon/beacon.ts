import Axios from 'axios';

import { P2PPairInfo, DAppClient, BeaconEvent, TezosOperationType } from '@airgap/beacon-sdk';
import { User, Recipient, Provider } from './types';
import { discordUrl, telegramUrl } from './constants';
import * as sqlite3Package from 'sqlite3';
import { SqlStorage } from './SqlStorage';

const sqlite3 = sqlite3Package.verbose();
var db = new sqlite3.Database('./storage/database.db');

db.run(
  `
	CREATE TABLE "users" (
		"provider"	TEXT NOT NULL,
		"userId"	TEXT NOT NULL,
		"address"	TEXT,
		"amount"	TEXT,
		"transactionId"	TEXT,
		"createdAt"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
		PRIMARY KEY("provider","userId")
	);
	`,
  (err, res) => {
    console.log('user table created', res);
  }
);

db.run(
  `
	CREATE TABLE "beacon" (
		"provider"	TEXT NOT NULL,
		"userId"	TEXT NOT NULL,
		"key"	TEXT,
		"value"	TEXT,
		"createdAt"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
		PRIMARY KEY("provider","userId","key")
	);
	`,
  (err, res) => {
    console.log('beacon table created', res);
  }
);

db.all(
  `
		SELECT * FROM users
		`,
  (err, res) => {
    if (!res) {
      return;
    }
    console.log(res);
    res.forEach(async (userRaw) => {
      const user = { provider: userRaw.provider, id: userRaw.userId };
      const userKey = getUserKey(user);
      const element = clients[userKey];
      if (!element) {
        const response = await initBeacon(user, false);

        clients[userKey] = {
          client: response[0] as DAppClient,
          qr: response[1] as P2PPairInfo,
        };
      }
    });
  }
);

const emptyHandler = {
  handler: async () => {},
};

const clients: { [key: string]: { client: DAppClient; qr: P2PPairInfo } } = {};

const initBeacon = async (user: User, sendPermissionRequest: boolean = true) => {
  console.log('initializing beacon for user ', user);
  let resolveOutside;
  const qrInfo = new Promise((resolve) => {
    resolveOutside = resolve;
  });

  const beaconInstance = new DAppClient({
    name: 'TzTip.me',
    storage: new SqlStorage(db, user),
    eventHandlers: {
      [BeaconEvent.P2P_LISTEN_FOR_CHANNEL_OPEN]: {
        // Every BeaconEvent can be overriden by passing a handler here.
        // The default will not be executed anymore. To keep the default,
        // you will have to call it again.
        handler: async (syncInfo) => {
          console.log('syncInfo', syncInfo);
          resolveOutside(syncInfo);
        },
      },
      [BeaconEvent.PERMISSION_REQUEST_SENT]: emptyHandler,
      [BeaconEvent.PERMISSION_REQUEST_SUCCESS]: emptyHandler,
      [BeaconEvent.PERMISSION_REQUEST_ERROR]: emptyHandler,
      [BeaconEvent.OPERATION_REQUEST_SENT]: emptyHandler,
      [BeaconEvent.OPERATION_REQUEST_SUCCESS]: emptyHandler,
      [BeaconEvent.OPERATION_REQUEST_ERROR]: emptyHandler,
      [BeaconEvent.SIGN_REQUEST_SENT]: emptyHandler,
      [BeaconEvent.SIGN_REQUEST_SUCCESS]: emptyHandler,
      [BeaconEvent.SIGN_REQUEST_ERROR]: emptyHandler,
      [BeaconEvent.BROADCAST_REQUEST_SENT]: emptyHandler,
      [BeaconEvent.BROADCAST_REQUEST_SUCCESS]: emptyHandler,
      [BeaconEvent.BROADCAST_REQUEST_ERROR]: emptyHandler,
      [BeaconEvent.LOCAL_RATE_LIMIT_REACHED]: emptyHandler,
      [BeaconEvent.NO_PERMISSIONS]: emptyHandler,
      [BeaconEvent.ACTIVE_ACCOUNT_SET]: emptyHandler,
      [BeaconEvent.ACTIVE_TRANSPORT_SET]: emptyHandler,
      [BeaconEvent.P2P_CHANNEL_CONNECT_SUCCESS]: emptyHandler,
      [BeaconEvent.INTERNAL_ERROR]: emptyHandler,
      [BeaconEvent.UNKNOWN]: emptyHandler,
    },
  });
  console.log('init');
  await beaconInstance.init();
  console.log('init2');
  if (sendPermissionRequest) {
    beaconInstance.requestPermissions().then((res) => {
      console.log('requestPermissions', res);
      Axios.post(`${user.provider === Provider.DISCORD ? discordUrl : telegramUrl}/bot/connected`, {
        from: user,
        accountInfo: res,
      });
      db.exec(
        `INSERT INTO users (provider, userId, address)
				VALUES ("${user.provider}", "${user.id}", "${res.address}")`, // TODO: prepared statements
        function (res: any) {
          console.log(res);
        }
      );
    });
    console.log('init3');

    const actualQrInfo = await qrInfo;
    console.log('actualQrInfo', actualQrInfo);

    return [beaconInstance, actualQrInfo];
  } else {
    return [beaconInstance, undefined];
  }
};

const getUserKey = (user: User) => {
  return `${user.provider}-${user.id}`;
};

const getUserFromDb = (user: User): Promise<{ address: string }> => {
  return new Promise((resolve, reject) => {
    db.each(
      `
			SELECT * FROM users WHERE provider = "${user.provider}" AND userId = "${user.id}"
			`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      }
    );
  });
};

const connect = async (user: User): Promise<P2PPairInfo> => {
  const userKey = getUserKey(user);
  const element = clients[userKey];
  if (element) {
    return element.qr;
  } else {
    const response = await initBeacon(user);
    clients[userKey] = {
      client: response[0] as DAppClient,
      qr: response[1] as P2PPairInfo,
    };
    return response[1] as P2PPairInfo;
  }
};

const tip = async (from: User, recipients: Recipient[]) => {
  console.log('from', from);
  console.log('recipients', recipients);
  const operations = (
    await Promise.all(
      recipients.map(async (recipient) => {
        const userInfo = await getUserFromDb(recipient.user);
        if (!userInfo) {
          Axios.post(`${from.provider === Provider.DISCORD ? discordUrl : telegramUrl}/bot/unregistered`, {
            from: from,
            recipient: recipient,
          });
          console.log('NO INFO FOUND FOR RECIPIENT', recipient);
        }
        return {
          kind: TezosOperationType.TRANSACTION,
          amount: recipient.amount,
          destination: userInfo ? userInfo.address : undefined,
        };
      })
    )
  ).filter((operation) => operation.destination !== undefined);

  const element = clients[getUserKey(from)];
  if (element) {
    console.log('sending request', operations);

    return element.client.requestOperation({
      operationDetails: operations as any,
    });
  } else {
    console.log('NO CLIENT FOUND FOR USER', from);
  }
};

export { connect, tip };
