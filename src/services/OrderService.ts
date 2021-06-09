import { OrderModel } from "../models/order";
import { OrderMatched } from "../types/contract-types/ShrubExchange";
export class OrderService {
  constructor(private orderModel: typeof OrderModel) {}

  public getOrders(baseAsset: string, quoteAsset: string, expiry?: number) {
    const query = {
      ...(baseAsset && { baseAsset }),
      ...(quoteAsset && { quoteAsset }),
      ...(expiry && { expiry: { $gt: expiry } }),
    };
    return this.orderModel.find(query);
  }

  public async fufillOrder(order:OrderMatched) {
    const {buyer, seller} = order.returnValues;
    const buyNonce = order.returnValues.buyOrder["nonce"];
    const sellNonce = order.returnValues.sellOrder["nonce"];
    const quoteAsset = order.returnValues.common["quoteAsset"];
    const baseAsset = order.returnValues.common["baseAsset"];

    const [buyerPrune, sellerPrune] = await Promise.all([
      this.orderModel.remove({baseAsset, quoteAsset, address: buyer, nonce: {$lte:  buyNonce}}),
      this.orderModel.remove({baseAsset, quoteAsset, address: seller, nonce: {$lte:  sellNonce}})
    ]);
  }
}
export const Orders = new OrderService(OrderModel);
