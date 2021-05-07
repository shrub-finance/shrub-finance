const Exchange = artifacts.require("ShrubExchange");
const { Shrub712 } = require('./EIP712');
const utils = require('ethereumjs-util');

const Assets = {
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ETH: '0x0000000000000000000000000000000000000000'
}
contract("ShrubExchange", accounts => {
  it("should hash an order and match the contract's hash", async () =>{
    const exchange = await Exchange.deployed()
    const orderTypeHash = await exchange.ORDER_TYPEHASH.call();
    const shrubInterface = new Shrub712(17, exchange.address);


    const order = {
      size: 1,
      isBuy: true,
      nonce: 0,
      price: 100,
      offerExpire: new Date(0).getTime(),
      fee: 1,

      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: new Date(0).getTime(),
      strike: 3300,
      optionType: 1,
    }

    const sha3Message = shrubInterface.getOrderSha3Message(orderTypeHash, order);
    console.log(sha3Message);
    const hash = await web3.utils.soliditySha3(...sha3Message);
    const signature = await web3.eth.sign(hash, accounts[0]);

    const sig = signature.slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    const v = web3.utils.toDecimal('0x' + sig.slice(128, 130)) + 27;


    const hashedOrder = await exchange.hashOrder(order);
    console.log({hash, hashedOrder, v, r, s});
    assert.equal(hash, hashedOrder);
  });


  it("should hash a small order and match the contract's hash", async () =>{
    const exchange = await Exchange.deployed()
    const orderTypeHash = await exchange.ORDER_TYPEHASH.call();
    const shrubInterface = new Shrub712(17, exchange.address);


    const order = {
      size: 1,
      isBuy: true,
      nonce: 0,
      price: 100,
      offerExpire: new Date(0).getTime(),
      fee: 1,
    }

    const common = {
      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: new Date(0).getTime(),
      strike: 3300,
      optionType: 1,
    }

    const sha3Message = shrubInterface.getSmallOrderSha3Message(orderTypeHash, {...order, ...common});
    console.log(sha3Message);

    const hash = await web3.utils.soliditySha3(...sha3Message);
    const hashedOrder = await exchange.hashSmallOrder(order, common);
    console.log({hash, hashedOrder});
    assert.equal(hash, hashedOrder);
  });


  it("should hash a common data and match the contract's hash", async () =>{
    const exchange = await Exchange.deployed()
    const orderTypeHash = await exchange.COMMON_TYPEHASH.call();
    const shrubInterface = new Shrub712(17, exchange.address);

    const common = {
      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: new Date(0).getTime(),
      strike: 3300,
      optionType: 1,
    }

    const sha3Message = shrubInterface.getOrderCommonSha3Message(orderTypeHash, common);
    console.log(sha3Message);
    const hash = await web3.utils.soliditySha3(...sha3Message);

    const hashedOrder = await exchange.hashOrderCommon(common);
    console.log({hash, hashedOrder});
    assert.equal(hash, hashedOrder);
  });


  it("should create a signature and be validated by the contract", async () =>{
    const exchange = await Exchange.deployed()
    const orderTypeHash = await exchange.ORDER_TYPEHASH.call();
    const shrubInterface = new Shrub712(17, exchange.address);


    const order = {
      size: 1,
      isBuy: true,
      nonce: 0,
      price: 100,
      offerExpire: new Date(0).getTime(),
      fee: 1,

      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: new Date(0).getTime(),
      strike: 3300,
      optionType: 1,
    }

    const sha3Message = shrubInterface.getOrderSha3Message(orderTypeHash, order);
    const hash = await web3.utils.soliditySha3("Hello worlds");
    const signature = await web3.eth.sign(hash, accounts[0]);

    const sig = signature.slice(2);
    const r = '0x' + sig.substr(0, 64);
    const s = '0x' + sig.substr(64, 64);
    const v = '0x' + sig.substr(128, 2)
    const validSig = await exchange.validateSignature(accounts[0], hash, v, r, s);
    console.log({sig, validSig});
    assert.isTrue(validSig);
  });
});
