export type Balance = { [currency: string]: string };

export type Option = {
  strikePrice: number;
  isCall: boolean;
  isBuy: boolean;
  last: number;
  ask: number;
  bid: number;
};
export type ContractData = {
  [optionPair: string ] : ContractInnerData
}


export type ContractInnerData = {
  [expiryDate: string] : {
    [optionType: string] : [number]
  }
}

export interface SmallOrder {
  size: number;
  isBuy: boolean;
  nonce: number;
  price: number;
  offerExpire: number;
  fee: number;
}

export enum OptionType {
  PUT= "PUT",
  CALL= "CALL"
}

export enum OptionAction {
  SELL= "SELL",
  BUY= "BUY",

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
