import mongoose from "mongoose";
import mongooseInt32 from 'mongoose-int32';

const Int32 = mongooseInt32.loadType(mongoose);

const Decimal128 = mongoose.Schema.Types.Decimal128

export interface IOrder {
  size: mongoose.Schema.Types.Decimal128;
  isBuy: boolean;
  nonce: number;
  price: mongoose.Schema.Types.Decimal128;
  offerExpire: number;
  fee: mongoose.Schema.Types.Decimal128;

  baseAsset: string;
  quoteAsset: string;
  expiry: number;
  strike: mongoose.Schema.Types.Decimal128;
  optionType: number;

  v: number;
  r: string;
  s: string;
  address: string;
}

const OrderSchema = new mongoose.Schema({
  size: { type: Decimal128, required: true },
  isBuy: { type: Boolean, required: true },
  nonce: { type: Int32, required: true },
  price: { type: Decimal128, required: true },
  offerExpire: { type: Int32, required: true },
  fee: { type: Decimal128, required: true },

  baseAsset: { type: String, required: true },
  quoteAsset: { type: String, required: true },
  expiry: { type: Int32, required: true },
  strike: { type: Decimal128, required: true },
  optionType: { type: Int32, required: true },

  v: { type: Int32, required: true },
  r: { type: String, required: true },
  s: { type: String, required: true },
  address: { type: String, required: true },
});

OrderSchema.index({ expiry: 1 });
OrderSchema.index({ offerExpire: 1 });
OrderSchema.index({ baseAsset: 1, quoteAsset: 1, expiry: 1 });
OrderSchema.index({ address: 1 });
OrderSchema.index({ address: 1, baseAsset: 1, quoteAsset: 1, nonce: 1 });

export const OrderModel = mongoose.model<IOrder & mongoose.Document>(
  "Order",
  OrderSchema
);
