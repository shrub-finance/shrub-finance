const { Shrub712 } = require('../utils/EIP712');
const ExchangeJson = require('../build/contracts/ShrubExchange.json');
const TokenJson = require('../build/contracts/FakeToken.json');
const Web3 = require('web3');
const util = require('util');
const fetch = require('node-fetch');

const wsUrl = "http://127.0.0.1:8545"
const web3 = new Web3(new Web3.providers.HttpProvider(wsUrl));
const takerPrivKey = "0x1fb827553fb70314fd91fd57468e658d08eb67ff5d3e0d6d0b6fad53e1da73d3";
const apiPort = Number(process.env.API_PORT) || 8000

const Assets = {
  USDC: '',
  ETH: '0x0000000000000000000000000000000000000000'
}

const wait = util.promisify(setTimeout);

async function getOrders() {
  const expiry = Math.floor(Date.now()/1000);
  const orders = await fetch(`http://localhost:${apiPort}/orders?expiry=${expiry}`, {
    method: 'get'
  }).then(res => res.json());
  return orders;
}

async function topupAddress(address, value, token, exchange, from) {
  console.log("Sending", value, "to", address, "from", from, "with token", token._address);
  await web3.eth.sendTransaction({to: address, value: Math.floor(value * 1.2), from});
  await token.methods.transfer(address, value).send({from});
  await token.methods.approve(exchange._address, value).send({from: address});;
  await exchange.methods.deposit(Assets.ETH, value).send({value, from: address});
  await exchange.methods.deposit(token._address, value).send({from: address});
}

async function takeRandomOrder(nonce) {
  const orders = await getOrders();
  if(orders.length === 0) {
    throw new Error("No orders availble to take");
  }
  const orderIndex = Math.floor(orders.length * Math.random());
  const randomOrder = orders[orderIndex];
  return takeOpposite(randomOrder, nonce);
}

function takeOpposite(order, nonce) {
  const newOrder = {
    ...order,
    isBuy: !order.isBuy,
    nonce
  };
  return {
    [order.isBuy ? "buyOrder" : "sellOrder"]: order,
    [!order.isBuy ? "buyOrder" : "sellOrder"]: newOrder,
    newOrder
  }
}

async function main() {
  const [ maker, taker ] = await web3.eth.personal.getAccounts();
  const currentNetwork = await web3.eth.net.getId();
  const exchangeAddress = ExchangeJson.networks[currentNetwork.toString()].address;
  const tokenAddress = TokenJson.networks[currentNetwork.toString()].address;
  Assets.USDC = tokenAddress;
  console.log("Using maker:", {taker});
  console.log("Using taker:", {taker});
  console.log("Using ShrubExchange:", {exchangeAddress});
  console.log("Using Token:", {tokenAddress});
  const shrubInterface = new Shrub712(17, exchangeAddress);
  const exchange = new web3.eth.Contract(ExchangeJson.abi, exchangeAddress);
  const token = new web3.eth.Contract(TokenJson.abi, tokenAddress);
  const nonce = await exchange.methods.userPairNonce(taker, Assets.ETH, Assets.USDC).call();
  const orderTypeHash = await exchange.methods.ORDER_TYPEHASH().call();

  while(true) {
    try {
      const {sellOrder, buyOrder, newOrder} = await takeRandomOrder(Number(nonce));
      await topupAddress(taker, sellOrder.price, token, exchange, maker);
      const signed = await shrubInterface.signOrderWithWeb3(web3, orderTypeHash, newOrder, taker);
      const {v, r, s} = buyOrder;
      const buyerSig = {v, r, s};
      const smallSellOrder = shrubInterface.toSmallOrder(sellOrder);
      const smallBuyOrder = shrubInterface.toSmallOrder(buyOrder);
      const common = shrubInterface.toCommon(buyOrder);
      console.log("Matching order", {smallSellOrder, smallBuyOrder, common, signed, buyerSig});
      await exchange.methods.matchOrder(smallSellOrder, smallBuyOrder, common, signed.sig, buyerSig).send({from: taker});
    } catch(e) {
      console.log(e);
    }
    await wait(1000);
  }
}
main().catch(console.log);