import { EventEmitter } from "events";
import Web3 from 'web3';
import { Config } from "../config";
import { Orders } from "./OrderService";
const web3Url = Config.web3WssUrl;
const web3 = new Web3(new Web3.providers.WebsocketProvider(web3Url));
import ExchangeJson from '../../artifacts/contracts/ShrubExchange.sol/ShrubExchange.json';
const abi = ExchangeJson.abi;

export class ContractService {
  public match: EventEmitter;
  public exchange: any;


  async start() {
    const address = await this.getExchangeAddress();
    this.exchange = new web3.eth.Contract(abi, address) as any as any;
    this.match = this.exchange.events.OrderMatched((err, order) => {
      const {buyer, seller} = order.returnValues;
      const buyNonce = order.returnValues.buyOrder["nonce"];
      const sellNonce = order.returnValues.sellOrder["nonce"];
      console.log("Order matched", "Buyer", order.returnValues.buyer, "Seller", order.returnValues.seller);
      console.log("Buyer nonce", order.returnValues.buyOrder["nonce"]);
      console.log("Seller nonce", order.returnValues.sellOrder["nonce"]);
      Orders.fufillOrder(order);
    });
  }

  async getExchangeAddress() {
    if(Config.shrubExchangeAddress) {
      return Config.shrubExchangeAddress;
    }
    const currentNetwork = await web3.eth.net.getId();
    const exchangeAddress = ExchangeJson.networks[currentNetwork.toString()].address;
    return exchangeAddress;
  }

  async getFilledOrders(address: string) {
    const [sells, buys] = await Promise.all([
      this.exchange.events.OrderMatched({fromBlock: 0, filter: {seller: address}}),
      this.exchange.events.OrderMatched({fromBlock: 0, filter: {buyer: address}}),
    ]);
    return {sells, buys};
  }

  stop() {
    this.match.removeAllListeners();
    this.match = null;
    this.exchange = null;
  }
}
export const Exchange = new ContractService();
