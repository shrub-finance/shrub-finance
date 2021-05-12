import mongoose from "mongoose";
export interface IOrder {
  size: number
  isBuy: boolean
  nonce: number
  price: number
  offerExpire: number
  fee: number

  baseAsset: string
  quoteAsset: string
  expiry: number
  strike: number
  optionType: number

  v: string
  r: string
  s: string
  address: string
}

const OrderSchema = new mongoose.Schema({
  size: Number,
  isBuy: Boolean,
  nonce: Number,
  price: Number,
  offerExpire: Number,
  fee: Number,

  baseAsset: String,
  quoteAsset: String,
  expiry: Number,
  strike: Number,
  optionType: Number,

  v: String,
  r: String,
  s: String,
  address: String
});

OrderSchema.index({ baseAsset: 1, quoteAsset: 1, expiry: 1 });
OrderSchema.index({ address: 1 });

export const OrderModel = mongoose.model<IOrder & mongoose.Document>(
  "Order",
  OrderSchema
);
