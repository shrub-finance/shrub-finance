export type Balance = { [currency: string]: number };

export type Option = {
  strikePrice: number;
  isCall: boolean;
  isBuy: boolean;
  last: number;
  ask: number;
  bid: number;
};

// export interface IOrder {
//   size: number;
//   isBuy: boolean;
//   nonce: number;
//   price: number;
//   offerExpire: number;
//   fee: number;
//
//   baseAsset: string;
//   quoteAsset: string;
//   expiry: number;
//   strike: number;
//   optionType: number;
//
//   v: number;
//   r: string;
//   s: string;
//   address: string;
// }

export interface SmallOrder {
  size: number;
  isBuy: boolean;
  nonce: number;
  price: number;
  offerExpire: number;
  fee: number;
}

export enum OptionType {
  "PUT",
  "CALL",
}

export interface OrderCommon {
  baseAsset: string;
  quoteAsset: string;
  expiry: number;
  strike: number;
  optionType: OptionType;
}

export interface Signature {
  v: number;
  r: string;
  s: string;
}

export interface UnsignedOrder extends SmallOrder, OrderCommon {}

export interface IOrder extends SmallOrder, OrderCommon, Signature {
  address: string;
}
