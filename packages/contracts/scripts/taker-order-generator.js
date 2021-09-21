const { Shrub712 } = require("../utils/EIP712");
const ExchangeJson = require("../deployments/localhost/ShrubExchange.json");
const TokenJson = require("../deployments/localhost/SUSDToken.json");
const Web3 = require("web3");
const util = require("util");
const fetch = require("node-fetch");

const wsUrl = "http://127.0.0.1:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(wsUrl));
const takerPrivKey =
  "0x1fb827553fb70314fd91fd57468e658d08eb67ff5d3e0d6d0b6fad53e1da73d3";
const apiPort = Number(process.env.API_PORT) || 8000;

const Assets = {
  USDC: "",
  MATIC: "0x0000000000000000000000000000000000000000",
};
const currentNonce = {};

const wait = util.promisify(setTimeout);

async function getOrders() {
  const expiry = Math.floor(Date.now() / 1000);
  const orders = await fetch(
    `http://localhost:${apiPort}/orders?expiry=${expiry}`,
    {
      method: "get",
    }
  ).then((res) => res.json());
  return orders;
}

async function topupAddress(address, value, token, exchange, from) {
  console.log(
    "Sending",
    value,
    "to",
    address,
    "from",
    from,
    "with token",
    token._address
  );
  await web3.eth.sendTransaction({
    to: address,
    value: Math.floor(value * 1.2),
    from,
  });
  await token.methods.transfer(address, value).send({ from });

  await token.methods.approve(exchange._address, value).send({ from: address });
  await exchange.methods.deposit(token._address, value).send({ from: address });
  await exchange.methods
    .deposit(Assets.MATIC, value)
    .send({ value, from: address });

  await token.methods.approve(exchange._address, value).send({ from });
  await exchange.methods.deposit(token._address, value).send({ from });
  await exchange.methods.deposit(Assets.MATIC, value).send({ value, from });
}

async function printBalances(address, exchange, order) {
  const ethBalance = await exchange.methods
    .getAvailableBalance(address, Assets.MATIC)
    .call();
  const tokenBalance = await exchange.methods
    .getAvailableBalance(address, Assets.USDC)
    .call();
  console.log({ address, ethBalance, tokenBalance, nonce: order.nonce });
}

async function takeRandomOrder(user, exchange) {
  let orders = await getOrders();
  const addresses = Array.from(new Set(orders.map((o) => o.address)));
  for (const address of addresses) {
    const [bestNonce, next] = Array.from(
      new Set(orders.map((o) => Number(o.nonce)))
    ).sort((a, b) => b - a);
    currentNonce[address] = bestNonce;
  }
  console.log("Filtering", orders.length, "orders");
  orders = orders.filter(
    (o) =>
      o.nonce === currentNonce[o.address] &&
      o.offerExpire >= Math.floor(Date.now() / 1000)
  );

  if (orders.length === 0) {
    throw new Error("No orders availble to take");
  }
  const orderIndex = Math.floor(orders.length * Math.random());
  const randomOrder = orders[orderIndex];
  const nonce =
    Number(
      await exchange.methods
        .getCurrentNonce(user, randomOrder.quoteAsset, randomOrder.baseAsset)
        .call()
    ) + 1;
  console.log(
    "Setting user expected nonce to",
    currentNonce[randomOrder.address]
  );
  console.log("Using nonce", nonce);
  return takeOpposite(randomOrder, nonce);
}

function takeOpposite(order, nonce) {
  const newOrder = {
    ...order,
    isBuy: !order.isBuy,
    nonce,
  };
  return {
    [order.isBuy ? "buyOrder" : "sellOrder"]: order,
    [!order.isBuy ? "buyOrder" : "sellOrder"]: newOrder,
    newOrder,
  };
}

async function main() {
  const [maker, taker] = await web3.eth.getAccounts();
  const currentNetwork = await web3.eth.net.getId();
  const exchangeAddress = ExchangeJson.address;
  const tokenAddress = TokenJson.address;
  Assets.USDC = tokenAddress;
  console.log("Using maker:", { taker });
  console.log("Using taker:", { taker });
  console.log("Using ShrubExchange:", { exchangeAddress });
  console.log("Using Token:", { tokenAddress });
  const shrubInterface = new Shrub712(17, exchangeAddress);
  const exchange = new web3.eth.Contract(ExchangeJson.abi, exchangeAddress);
  const token = new web3.eth.Contract(TokenJson.abi, tokenAddress);
  const orderTypeHash = await exchange.methods.ORDER_TYPEHASH().call();

  while (true) {
    try {
      const { sellOrder, buyOrder, newOrder } = await takeRandomOrder(
        taker,
        exchange
      );
      await topupAddress(
        taker,
        1000 * sellOrder.size * Math.max(sellOrder.price, sellOrder.strike),
        token,
        exchange,
        maker
      );
      const signed = await shrubInterface.signOrderWithWeb3(
        web3,
        orderTypeHash,
        newOrder,
        taker
      );
      const { v, r, s } = buyOrder;
      const buyerSig = newOrder.isBuy ? signed.sig : { v: Number(v), r, s };
      const sellerSig = !newOrder.isBuy ? signed.sig : { v: Number(v), r, s };
      const smallSellOrder = shrubInterface.toSmallOrder(sellOrder);
      const smallBuyOrder = shrubInterface.toSmallOrder(buyOrder);
      const common = shrubInterface.toCommon(buyOrder);
      console.log("Before Balance");
      await printBalances(maker, exchange, smallSellOrder);
      await printBalances(taker, exchange, smallBuyOrder);
      await exchange.methods
        .matchOrder(smallSellOrder, smallBuyOrder, common, sellerSig, buyerSig)
        .send({ from: taker, gasLimit: 250000 });
      console.log("After Balance");
      await printBalances(maker, exchange, smallSellOrder);
      await printBalances(taker, exchange, smallBuyOrder);
      console.log("Order filled");
      process.exit();
    } catch (e) {
      console.log(e);
    }
    await wait(1000);
  }
}
main().catch(console.log);
