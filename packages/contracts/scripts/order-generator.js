const { Shrub712 } = require("../utils/EIP712");
const ExchangeJson = require("../deployments/localhost/ShrubExchange.json");
const TokenJson = require("../deployments/localhost/FakeToken.json");
const Web3 = require("web3");
const util = require("util");
const fetch = require("node-fetch");

const wsUrl = "http://127.0.0.1:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(wsUrl));
const apiPort = Number(process.env.API_PORT) || 8000;

const Assets = {
  USDC: "",
  ETH: "0x0000000000000000000000000000000000000000",
};

const wait = util.promisify(setTimeout);

async function generateRandomOrder(nonce) {
  return {
    nonce,
    size: Math.floor(Math.random() * 5) + 1,
    isBuy: Math.random() * 100 > 50,
    price: Math.floor(Math.random() * 4000),
    offerExpire: Math.floor((new Date().getTime() + 60 * 1000 * 60) / 1000),
    fee: Math.floor(Math.random() * 100),
    baseAsset: Assets.USDC,
    quoteAsset: Assets.ETH,
    expiry:
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth() + Math.ceil(Math.random() * 2),
        1
      ) / 1000,
    strike: Math.floor(Math.random() * 10) * 100 + 2000,
    optionType: Math.floor(Math.random() * 2),
  };
}

async function saveOrder(order) {
  await fetch(`http://localhost:${apiPort}/orders`, {
    method: "post",
    body: JSON.stringify(order),
    headers: { "Content-Type": "application/json" },
  });
}

async function main() {
  const [from] = await web3.eth.getAccounts();
  const exchangeAddress = ExchangeJson.address;
  const tokenAddress = TokenJson.address;
  Assets.USDC = tokenAddress;

  console.log("Using ShrubExchange:", { exchangeAddress });
  const shrubInterface = new Shrub712(17, exchangeAddress);
  const exchange = new web3.eth.Contract(ExchangeJson.abi, exchangeAddress);
  const orderTypeHash = await exchange.methods.ORDER_TYPEHASH().call();

  while (true) {
    const nonce =
      Number(
        await exchange.methods
          .userPairNonce(from, Assets.ETH, Assets.USDC)
          .call()
      ) + 1;
    const order = await generateRandomOrder(Number(nonce));
    const signed = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      order,
      from
    );
    console.log(signed);
    await saveOrder({ ...signed.order, ...signed.sig, address: from });
    await wait(1000);
  }
}
main().catch(console.log);
