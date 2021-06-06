import { OrderModel } from "../models/order";
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
}
export const Orders = new OrderService(OrderModel);
