export enum Provider {
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
}

export interface User {
  provider: Provider;
  id: string;
}

export interface Recipient {
  user: User;
  amount: string;
}

export interface InitRequest {
  user: User;
}

export interface InitResponse {
  name: string;
  publicKey: string;
  relayServer: string;
}

export interface SetAddressRequest {
  user: User;
  address: string;
}

export interface SetAddressResponse {
  success: true;
}

export interface TipRequest {
  from: User;
  recipients: Recipient[];
}

export interface TipResponse {
  transactionId: string;
  from: User;
  recipients: Recipient[];
}

export interface AccountInfoResponse {
  from: User;
  accountInfo: any;
}
