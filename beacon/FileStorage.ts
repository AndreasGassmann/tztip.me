import { access, constants, readFileSync, writeFileSync } from 'fs';
import { defaultValues } from '@airgap/beacon-sdk/dist/types/storage/StorageKeyReturnDefaults';
import { Storage, StorageKey, StorageKeyReturnType } from '@airgap/beacon-sdk';

interface JsonObject {
  [key: string]: unknown;
}

/* eslint-disable prefer-arrow/prefer-arrow-functions */

export function readLocalFile(file: string): Promise<JsonObject> {
  return new Promise((resolve: (_: JsonObject) => void, reject: (error: unknown) => void): void => {
    const fileContent = readFileSync(file, { encoding: 'utf8' });
    try {
      const json: JsonObject = JSON.parse(fileContent);
      resolve(json);
    } catch (jsonParseError) {
      reject(jsonParseError);
    }
  });
}

export function writeLocalFile(file: string, json: JsonObject): Promise<void> {
  return new Promise((resolve: (_: void) => void): void => {
    const fileContent: string = JSON.stringify(json);
    writeFileSync(file, fileContent, { encoding: 'utf8' });
    resolve();
  });
}

export class FileStorage implements Storage {
  private isReady: Promise<void>;

  constructor(private readonly file: string = './storage/storage.json') {
    this.isReady = new Promise(async (resolve, reject) => {
      access(this.file, constants.F_OK, async (err) => {
        if (err) {
          await writeLocalFile(this.file, {});
        }
        resolve();
      });
    });
  }

  public static async isSupported(): Promise<boolean> {
    return Promise.resolve(typeof global !== 'undefined');
  }

  public async get<K extends StorageKey>(key: K): Promise<StorageKeyReturnType[K]> {
    await this.isReady;
    const json: JsonObject = await readLocalFile(this.file);

    if (json[key]) {
      return json[key] as StorageKeyReturnType[K];
    } else {
      if (typeof defaultValues[key] === 'object') {
        return JSON.parse(JSON.stringify(defaultValues[key]));
      } else {
        return defaultValues[key];
      }
    }
  }

  public async set<K extends StorageKey>(key: K, value: StorageKeyReturnType[K]): Promise<void> {
    await this.isReady;
    const json: JsonObject = await readLocalFile(this.file);

    json[key] = value;

    return writeLocalFile(this.file, json);
  }

  public async delete<K extends StorageKey>(key: K): Promise<void> {
    await this.isReady;
    const json: JsonObject = await readLocalFile(this.file);
    json[key] = undefined;

    return writeLocalFile(this.file, json);
  }
}
