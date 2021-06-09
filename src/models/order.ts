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

  v: number
  r: string
  s: string
  address: string
}

const OrderSchema = new mongoose.Schema({
  size: { type: Number, required: true },
  isBuy: { type: Boolean, required: true},
  nonce: { type: Number, required: true},
  price: { type: Number, required: true},
  offerExpire: { type: Number, required: true},
  fee: { type: Number, required: true},

  baseAsset: { type: String, required: true},
  quoteAsset: { type: String, required: true},
  expiry: { type: Number, required: true},
  strike: { type: Number, required: true},
  optionType: { type: Number, required: true},

  v: { type: Number, required: true},
  r: { type: String, required: true},
  s: { type: String, required: true},
  address: { type: String, required: true},
});

OrderSchema.index({ baseAsset: 1, quoteAsset: 1, expiry: 1 });
OrderSchema.index({ address: 1 });
OrderSchema.index({ address: 1, baseAsset: 1, quoteAsset: 1, nonce: 1 });

export const OrderModel = mongoose.model<IOrder & mongoose.Document>(
  "Order",
  OrderSchema
);
