import {BigNumber} from "ethers";

export type Balance = { [currency: string]: string };

export type ShrubBalance = {
  locked: {[currency: string]: number},
  available: {[currency: string]: number}
};

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
  size: BigNumber;
  isBuy: boolean;
  nonce: number;
  price: BigNumber;
  offerExpire: number;
  fee: BigNumber;
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
  strike: BigNumber;
  optionType: 0 | 1;
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

export interface ApiOrder extends Signature{
  // Common
  baseAsset: string;
  quoteAsset: string;
  expiry: number;
  strike: { $numberDecimal: BigNumber };
  optionType: 0 | 1;
  // Small
  size: { $numberDecimal: BigNumber };
  isBuy: boolean;
  nonce: number;
  price: { $numberDecimal: BigNumber };
  offerExpire: number;
  fee: { $numberDecimal: BigNumber };
  // Address
  address: string;
}

export interface AppOrder extends Signature{
  // Common
  baseAsset: string;
  quoteAsset: string;
  expiry: Date;
  formattedExpiry: string;
  strike: BigNumber;
  formattedStrike: string;
  optionType: 'CALL' | 'PUT';
  // Small
  size: BigNumber;
  formattedSize: string;
  isBuy: boolean;
  nonce: number;
  price: BigNumber;
  formattedPrice: string;
  offerExpire: Date;
  fee: BigNumber;
  formattedFee: string;
  // Address
  address: string;
}
