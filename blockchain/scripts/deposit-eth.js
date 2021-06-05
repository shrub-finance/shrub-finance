const ExchangeJson = require('../build/contracts/ShrubExchange.json');
const Web3 = require('web3');
const util = require('util');

const wsUrl = "http://127.0.0.1:8545"
const web3 = new Web3(new Web3.providers.HttpProvider(wsUrl));
const parityAdmin = "0x00a329c0648769A73afAc7F9381E08FB43dBEA72";
const apiPort = Number(process.env.API_PORT) || 8000

const Assets = {
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ETH: '0x0000000000000000000000000000000000000000'
}

const wait = util.promisify(setTimeout);

async function main() {
  const currentNetwork = await web3.eth.net.getId();
  const exchangeAddress = ExchangeJson.networks[currentNetwork.toString()].address;
  console.log("Using ShrubExchange:", {exchangeAddress});
  const exchange = new web3.eth.Contract(ExchangeJson.abi, exchangeAddress);
  const depositAmount = process.env.DEPOSIT_ETH || "1";
  const wei = web3.utils.toWei(depositAmount, "ether");
  console.log("Depositing", depositAmount, "ETH");
  await exchange.methods.deposit(Assets.ETH, wei).send({value: wei, from: parityAdmin});
}
main().catch(console.log);
