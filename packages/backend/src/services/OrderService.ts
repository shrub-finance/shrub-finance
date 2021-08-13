import { OrderModel } from "../models/order";
export class OrderService {
  constructor(private orderModel: typeof OrderModel) {}

  public getOrders(
    baseAsset: string,
    quoteAsset: string,
    expiry?: number,
    optionType?: number,
    strike?: number,
    isBuy?: boolean
  ) {
    const query = {
      ...(baseAsset && { baseAsset }),
      ...(quoteAsset && { quoteAsset }),
      ...(expiry && { expiry }),
      ...(optionType && { optionType }),
      ...(strike && { strike }),
      ...(isBuy && { isBuy }),
    };
    console.log(query);
    return this.orderModel.find(query);
  }

  public async fufillOrder(order: any) {
    const { buyer, seller } = order.returnValues;
    const buyNonce = order.returnValues.buyOrder["nonce"];
    const sellNonce = order.returnValues.sellOrder["nonce"];
    const quoteAsset = order.returnValues.common["quoteAsset"];
    const baseAsset = order.returnValues.common["baseAsset"];

    const [buyerPrune, sellerPrune] = await Promise.all([
      this.orderModel.remove({
        baseAsset,
        quoteAsset,
        address: buyer,
        nonce: { $lte: buyNonce },
      }),
      this.orderModel.remove({
        baseAsset,
        quoteAsset,
        address: seller,
        nonce: { $lte: sellNonce },
      }),
    ]);
  }

  public async pruneExpiredOffers() {
    const now = Date.now() / 1000;
    const pruned = await this.orderModel.remove({ offerExpire: { $lte: now } });
    if (pruned.deletedCount) {
      console.log("pruned", pruned.deletedCount, "expired offers");
    }
  }
}
export const Orders = new OrderService(OrderModel);
