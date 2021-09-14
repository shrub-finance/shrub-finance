const Exchange = artifacts.require("ShrubExchange");
const FakeToken = artifacts.require("FakeToken");
const { Shrub712 } = require("../utils/EIP712");
const utils = require("ethereumjs-util");

const Assets = {
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  ETH: "0x0000000000000000000000000000000000000000",
};
const OptionTypes = {
  PUT: 0,
  CALL: 1
}
const STRIKE_BASE_SHIFT = 1000000;

const WeiInEth = web3.utils.toBN(10).pow(web3.utils.toBN(18))
const BigHundred = web3.utils.toBN(100);
const BigTwo = web3.utils.toBN(2);
const BigMillion = web3.utils.toBN(1e6);


contract("ShrubExchange::announce", (accounts) => {
  let exchange;
  let shrubInterface;
  let fakeToken;
  let orderTypeHash;

  let sellOrder = {
    size: WeiInEth.toString(),
    isBuy: false,
    nonce: 1,
    price: WeiInEth.mul(BigHundred).toString(),
    offerExpire: Math.floor((new Date().getTime() + 5 * 1000 * 60) / 1000),
    fee: 1,

    baseAsset: Assets.USDC,
    quoteAsset: Assets.ETH,
    expiry: Math.floor((new Date().getTime() + 30 * 1000 * 60) / 1000),
    strike: BigHundred.mul(BigMillion).toString(),
    optionType: OptionTypes.CALL,
  };


  before(async () => {
    exchange = await Exchange.deployed();
    shrubInterface = new Shrub712(17, exchange.address);
    fakeToken = await FakeToken.deployed();
    orderTypeHash = await exchange.ORDER_TYPEHASH.call();

    Assets.USDC = fakeToken.address;
    sellOrder.baseAsset = fakeToken.address;
  });

  it("should be able to announce an order", async () => {
    const seller = accounts[0];
    const common = shrubInterface.toCommon(sellOrder);
    const sellerNonce = await exchange.getCurrentNonce(
      seller,
      common
    );
    sellOrder.nonce = sellerNonce.toNumber() + 1;

    const smallSellOrder = shrubInterface.toSmallOrder(sellOrder);
    const signedSellOrder = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      sellOrder,
      seller
    );


    const value = WeiInEth;
    await exchange.deposit(Assets.ETH, value, { value, from: seller });
    console.log(smallSellOrder, common, signedSellOrder.sig);
    await exchange.announce(smallSellOrder, common, signedSellOrder.sig, {from: seller});
  });


  it("should be able to announce many orders", async () => {
    const seller = accounts[0];
    const common = shrubInterface.toCommon(sellOrder);
    const sellerNonce = await exchange.getCurrentNonce(
      seller,
      common
    );
    sellOrder.nonce = sellerNonce.toNumber() + 1;

    const smallSellOrder = shrubInterface.toSmallOrder(sellOrder);
    const signedSellOrder = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      sellOrder,
      seller
    );


    const value = WeiInEth;
    await exchange.deposit(Assets.ETH, value, { value, from: seller });

    const orders = new Array(10).fill(smallSellOrder);
    const commons = new Array(10).fill(common);
    const sigs = new Array(10).fill(signedSellOrder.sig);

    console.log(smallSellOrder, common, signedSellOrder.sig);
    await exchange.announceMany(orders, commons, sigs, {from: seller});
  });
});
