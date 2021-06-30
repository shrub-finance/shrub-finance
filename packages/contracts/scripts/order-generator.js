const { Shrub712 } = require("../utils/EIP712");
const ExchangeJson = require("../deployments/localhost/ShrubExchange.json");
const TokenJson = require("../deployments/localhost/FakeToken.json");
const Web3 = require("web3");
const util = require("util");
const fetch = require("node-fetch");
const bs = require('../utils/black-scholes');
const axios = require('axios');

const wsUrl = "http://127.0.0.1:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(wsUrl));
const apiPort = Number(process.env.API_PORT) || 8000;

const weiInEth = web3.utils.toBN(10).pow(web3.utils.toBN(18));

const Assets = {
  USDC: "",
  ETH: "0x0000000000000000000000000000000000000000",
};

const ETH_PRICE = process.argv[2] || 2500;
const RISK_FREE_RATE = 0.05

let optionContracts = [];

async function setOptionContracts() {
  optionContracts = (await axios.get('http://localhost:8000/contracts/raw')).data
}

const wait = util.promisify(setTimeout);

function getRandomContract() {
  const contractNumber = Math.floor(Math.random() * optionContracts.length);
  return optionContracts[contractNumber];
}

async function generateRandomOrder(nonce) {
  const {expiry, strike:strikeUsdc, optionType } = getRandomContract();
  const timeToExpiry = (expiry * 1000 - Date.now()) / (365 * 24 * 60 * 60 * 1000)
  const volatility = (Math.random() * 75 + 75) / 100;
  console.log(`
    ETH price: ${ETH_PRICE}
    strike: ${strikeUsdc}
    time to expiry (years): ${timeToExpiry}
    volatility: ${volatility}
    risk free rate: ${RISK_FREE_RATE}
  `)

  const strike = web3.utils.toBN(strikeUsdc).mul(weiInEth);
  const sizeEth = Math.floor(Math.random() * 5) + 1;
  const size = web3.utils.toBN(sizeEth).mul(weiInEth);
  const pricePerContractUsdc = Math.round(100 * bs.blackScholes(ETH_PRICE, strikeUsdc, timeToExpiry, volatility, RISK_FREE_RATE, optionType)) / 100
  const price = web3.utils.toBN(Math.round(pricePerContractUsdc * 100)).mul(weiInEth.div(web3.utils.toBN(100)));
  return {
    nonce,
    size,
    isBuy: Math.random() * 100 > 50,
    price,
    offerExpire: Math.floor((new Date().getTime() + 60 * 1000 * 60) / 1000),
    fee: Math.floor(Math.random() * 100),
    baseAsset: Assets.USDC,
    quoteAsset: Assets.ETH,
    expiry,
    strike,
    optionType: optionType === 'CALL' ? 1 : 0,
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
  await setOptionContracts();
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
    const { size, price, strike } = signed.order;
    await saveOrder({ ...signed.order, ...signed.sig, address: from, size: size.toString(), price: price.toString(), strike: strike.toString() });
    await wait(1000);
  }
}
main().catch(console.log);
