const Exchange = artifacts.require("ShrubExchange");
const FakeToken = artifacts.require("FakeToken");
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

  it("should be able to deposit funds to the exchange", async () => {
    const exchange = await Exchange.deployed();
    await exchange.deposit(Assets.ETH, 100, {value: 100, from: accounts[0]});
    const balance = await exchange.userTokenBalances(accounts[0], Assets.ETH);
    console.log(balance.toNumber());
  });

  it("should be able to withdraw unlocked funds", async () => {
    const exchange = await Exchange.deployed();
    await exchange.withdraw(Assets.ETH, 100, {from: accounts[0]});
    const balance = await exchange.userTokenBalances(accounts[0], Assets.ETH);
    console.log(balance.toNumber());
  });

  it("should be able to match two orders", async () => {
    const fakeToken = await FakeToken.deployed();
    const exchange = await Exchange.deployed()

    const sellOrder = {
      size: 1,
      isBuy: false,
      nonce: 1,
      price: 100,
      offerExpire: new Date().getTime() + 5 * 1000 * 60,
      fee: 1,

      baseAsset: fakeToken.address,
      quoteAsset: Assets.ETH,
      expiry: new Date().getTime() + 30 * 1000 * 60,
      strike: 4500,
      optionType: 1,
    }

    const buyOrder = {
      ...sellOrder,
      isBuy: true
    }

    const orderTypeHash = await exchange.ORDER_TYPEHASH.call();
    const shrubInterface = new Shrub712(17, exchange.address);

    await exchange.deposit(Assets.ETH, 200, {value: 200, from: accounts[0]});

    await fakeToken.approve(exchange.address, 100, {from: accounts[0]})
    await exchange.deposit(fakeToken.address, 100, {from: accounts[0]});




    const signedSellOrder = await shrubInterface.signOrderWithWeb3(web3, orderTypeHash, sellOrder, accounts[0]);
    const signedBuyOrder = await shrubInterface.signOrderWithWeb3(web3, orderTypeHash, buyOrder, accounts[0]);

    const smallSellOrder = shrubInterface.toSmallOrder(sellOrder);
    const smallBuyOrder = shrubInterface.toSmallOrder(buyOrder);
    const common = shrubInterface.toCommon(sellOrder);

    assert.isTrue(smallSellOrder.isBuy == false, "sell isBuy should be false");
    assert.isTrue(smallBuyOrder.isBuy == true, "buy isBuy should be true");
    assert.isTrue(smallSellOrder.price <= smallBuyOrder.price, "Price should be sufficient for seller");
    assert.isTrue(smallSellOrder.size <= smallBuyOrder.size, "Sell size should be sufficient for seller");
    assert.isTrue(smallSellOrder.offerExpire >= Date.now(), "Sell Offer should not be expired");
    assert.isTrue(smallBuyOrder.offerExpire >= Date.now(), "Buy Offer should not be expired");

    const seller = await exchange.getAddressFromSignedOrder(smallSellOrder, common, signedSellOrder.sig);
    assert.equal(seller, accounts[0], "Seller should be account0");
    const sellerNonce = await exchange.getCurrentNonce(accounts[0], common.quoteAsset, common.baseAsset);
    const buyerNonce = await exchange.getCurrentNonce(accounts[0], common.quoteAsset, common.baseAsset);
    assert.isTrue(sellerNonce == sellOrder.nonce - 1, "Seller nonce should match order")
    assert.isTrue(buyerNonce == buyOrder.nonce - 1, "Buyer nonce should match order")


    const sellerBalance = await exchange.getAvailableBalance(accounts[0], common.quoteAsset);
    if(sellOrder.optionType == 1) {
      console.log("SOLD A CALL");
      assert.isTrue(sellerBalance.toNumber() >= smallSellOrder.size, "Seller should have enough free collateral");
    } else {
      console.log("SOLD A PUT");
      assert.isTrue(sellerBalance.toNumber() >= smallSellOrder.size * common.strike, "Seller should have enough free collateral");
    }

    await exchange.matchOrder(smallSellOrder, smallBuyOrder, common, signedSellOrder.sig, signedBuyOrder.sig, {from: accounts[0]})
    console.log({signedBuyOrder, signedSellOrder});
  });
});
