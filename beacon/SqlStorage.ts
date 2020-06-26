import { defaultValues } from '@airgap/beacon-sdk/dist/types/storage/StorageKeyReturnDefaults';
import { Storage, StorageKey, StorageKeyReturnType } from '@airgap/beacon-sdk';
import { User } from './types';

import * as sqlite3Package from 'sqlite3';

/* eslint-disable prefer-arrow/prefer-arrow-functions */

export class SqlStorage implements Storage {
  constructor(private readonly db: sqlite3Package.Database, private readonly user: User) {}

  public static async isSupported(): Promise<boolean> {
    return false;
  }

  public async get<K extends StorageKey>(key: K): Promise<StorageKeyReturnType[K]> {
    console.log('get', key);
    return new Promise((resolve, reject) => {
      this.db.all(
        `
				SELECT * FROM beacon WHERE provider = "${this.user.provider}" AND userId = "${this.user.id}" AND key = "${key}"
				`,
        (err, res) => {
          if (err) {
            console.log('err', err);
            reject(err);
          }

          const value = res[0] ? res[0].value : undefined;
          console.log('read', key, value);
          if (value) {
            try {
              resolve(JSON.parse(value));
            } catch (jsonParseError) {
              resolve(value as StorageKeyReturnType[K]); // TODO: Validate storage
            }
          } else {
            if (typeof defaultValues[key] === 'object') {
              resolve(JSON.parse(JSON.stringify(defaultValues[key])));
            } else {
              console.log('returning default!', defaultValues[key]);
              resolve(defaultValues[key]);
            }
          }
        }
      );
    });
  }

  public async set<K extends StorageKey>(key: K, value: StorageKeyReturnType[K]): Promise<void> {
    console.log('set', key, value);

    const valueToBeStored = typeof value === 'string' ? value : JSON.stringify(value);

    this.db.run(
      `
			INSERT INTO beacon (provider, userId, key, value) VALUES(?, ?, ?, ?) ON CONFLICT(provider, userId, key) DO UPDATE SET value = ?
			`,
      this.user.provider,
      this.user.id,
      key,
      valueToBeStored,
      valueToBeStored
    );
  }

  public async delete<K extends StorageKey>(key: K): Promise<void> {
    console.log('delete', key);
    this.db.exec(
      `
			DELETE FROM beacon WHERE provider = "${this.user.provider}" AND userId = "${this.user.id}" AND key = "${key}"
			`
    );
  }
}
