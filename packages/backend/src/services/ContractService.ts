import { EventEmitter } from "events";
import Web3 from "web3";
import { Config } from "../config";
import { Orders } from "./OrderService";
const web3Url = Config.web3WssUrl;
const web3 = new Web3(new Web3.providers.WebsocketProvider(web3Url));
import { ShrubExchange } from "@shrub/contracts/types/web3-v1/ShrubExchange";
import { AbiItem } from "web3-utils/types";
import { OrderModel } from "../models/order";
import { ShrubExchangeAbi } from "@shrub/contracts";

export class ContractService {
  public match: EventEmitter;
  public exchange: ShrubExchange;

  constructor(private orderModel: typeof OrderModel) {}

  async start() {
    const address = await this.getExchangeAddress();
    this.exchange = new web3.eth.Contract(
      ShrubExchangeAbi,
      address
    ) as any as ShrubExchange;

    this.match = this.exchange.events.OrderMatched((err, order) => {
      if (err) {
        return;
      }
      const { buyer, seller } = order.returnValues;
      const buyNonce = order.returnValues.buyOrder["nonce"];
      const sellNonce = order.returnValues.sellOrder["nonce"];
      console.log(
        "Order matched",
        "Buyer",
        order.returnValues.buyer,
        "Seller",
        order.returnValues.seller
      );
      console.log("Buyer nonce", order.returnValues.buyOrder["nonce"]);
      console.log("Seller nonce", order.returnValues.sellOrder["nonce"]);
      Orders.fufillOrder(order);
    });
  }

  async pruneAllUserOrders() {
    const now = Date.now() / 1000;
    const openOrders = await this.orderModel.find({
      offerExpire: { $gte: now },
    });
    const addresses = Array.from(new Set(openOrders.map((o) => o.address)));
    for (const user of addresses) {
      const seen = {};
      const filled = await this.getFilledOrders(user);
      const sorted = filled.buys
        .concat(filled.sells)
        .sort((a, b) => b.returnValues["nonce"] - a.returnValues["nonce"]);
      for (const order of sorted) {
        const base = order.returnValues["baseAsset"];
        const quote = order.returnValues["quoteAsset"];
        if (!seen[base + ":" + quote]) {
          seen[base + ":" + quote] = true;
          await Orders.fufillOrder(order);
        }
      }
    }
  }

  async getExchangeAddress() {
    const exchangeAddress = process.env.SHRUB_ADDRESS || "";
    return exchangeAddress;
  }

  async getFilledOrders(
    address: string
  ): Promise<{ buys: any[]; sells: any[] }> {
    const [sells, buys] = await Promise.all([
      this.exchange.getPastEvents("OrderMatched", {
        fromBlock: 0,
        filter: { seller: address },
      }),
      this.exchange.getPastEvents("OrderMatched", {
        fromBlock: 0,
        filter: { buyer: address },
      }),
    ]);
    return { sells, buys };
  }

  stop() {
    this.match.removeAllListeners();
    this.match = null;
    this.exchange = null;
  }
}
export const Exchange = new ContractService(OrderModel);
