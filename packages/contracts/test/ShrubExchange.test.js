const Exchange = artifacts.require("ShrubExchange");
const FakeToken = artifacts.require("FakeToken");
const { Shrub712 } = require("../utils/EIP712");
const utils = require("ethereumjs-util");
const util = require('util');

const Assets = {
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  ETH: "0x0000000000000000000000000000000000000000",
};
const STRIKE_BASE_SHIFT = 1000000;

const WeiInEth = web3.utils.toBN(10).pow(web3.utils.toBN(18))
const BigHundred = web3.utils.toBN(100);
const BigTwo = web3.utils.toBN(2);
const BigMillion = web3.utils.toBN(1e6);
const wait = util.promisify(setTimeout);


contract("ShrubExchange", (accounts) => {
  let exchange;
  let shrubInterface;
  let fakeToken;
  let orderTypeHash;

  const startTime = Date.now();
  let sellOrder = {
    size: WeiInEth.toString(),
    isBuy: false,
    nonce: 1,
    price: WeiInEth.mul(BigHundred).toString(),
    offerExpire: Math.floor((startTime + 5 * 1000 * 60) / 1000),
    fee: 1,

    baseAsset: Assets.USDC,
    quoteAsset: Assets.ETH,
    expiry: Math.floor((startTime + 30 * 1000) / 1000),
    strike: BigHundred.mul(BigMillion).toString(),
    optionType: 1,
  };

  let buyOrder = {
    ...sellOrder,
    isBuy: true,
  };

  before(async () => {
    exchange = await Exchange.deployed();
    shrubInterface = new Shrub712(17, exchange.address);
    fakeToken = await FakeToken.deployed();
    orderTypeHash = await exchange.ORDER_TYPEHASH.call();

    Assets.USDC = fakeToken.address;
    sellOrder.baseAsset = fakeToken.address;
    buyOrder.baseAsset = fakeToken.address;

    console.log("Sending tokens to buyer account");
    if (accounts.length < 2) {
      const privKey =
        "0x1fb827553fb70314fd91fd57468e658d08eb67ff5d3e0d6d0b6fad53e1da73d3";
      const created = await web3.eth.accounts.privateKeyToAccount(privKey);
      accounts.push(created.address);
    }
    console.log({ accounts });
    await fakeToken.transfer(accounts[1], WeiInEth.mul(web3.utils.toBN(10000)), { from: accounts[0] });
  });

  it("should hash an order and match the contract's hash", async () => {
    const order = {
      size: WeiInEth.toString(),
      isBuy: true,
      nonce: 0,
      price: WeiInEth.mul(BigHundred).toString(),
      offerExpire: new Date(0).getTime(),
      fee: 1,

      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: new Date(0).getTime(),
      strike: web3.utils.toBN(3300).mul(BigMillion).toString(),
      optionType: 1,
    };

    const sha3Message = shrubInterface.getOrderSha3Message(
      orderTypeHash,
      order
    );
    console.log(sha3Message);
    const hash = await web3.utils.soliditySha3(...sha3Message);
    const signature = await web3.eth.sign(hash, accounts[0]);

    const sig = signature.slice(2);
    const r = "0x" + sig.substr(0, 64);
    const s = "0x" + sig.substr(64, 64);
    const v = web3.utils.toDecimal("0x" + sig.substr(128, 2)) + 27;

    const hashedOrder = await exchange.hashOrder(order);
    console.log({ hash, hashedOrder, v, r, s });
    assert.equal(hash, hashedOrder);
  });

  it("should hash a small order and match the contract's hash", async () => {
    const common = shrubInterface.toCommon(buyOrder);
    const sha3Message = shrubInterface.getSmallOrderSha3Message(orderTypeHash, {
      ...buyOrder,
      ...common,
    });
    console.log(sha3Message);

    const hash = await web3.utils.soliditySha3(...sha3Message);
    const hashedOrder = await exchange.hashSmallOrder(buyOrder, common);
    console.log({ hash, hashedOrder });
    assert.equal(hash, hashedOrder);
  });

  it("should hash a common data and match the contract's hash", async () => {
    const commonTypeHash = await exchange.COMMON_TYPEHASH.call();

    const common = {
      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: new Date(0).getTime(),
      strike: web3.utils.toBN(3300).mul(BigMillion).toString(),
      optionType: 1,
    };

    const sha3Message = shrubInterface.getOrderCommonSha3Message(
      commonTypeHash,
      common
    );
    console.log(sha3Message);
    const hash = await web3.utils.soliditySha3(...sha3Message);

    const hashedOrder = await exchange.hashOrderCommon(common);
    console.log({ hash, hashedOrder });
    assert.equal(hash, hashedOrder);
  });

  it("should create a signature and be validated by the contract", async () => {
    const hash = await web3.utils.soliditySha3("Hello worlds");
    const signature = await web3.eth.sign(hash, accounts[0]);

    const sig = signature.slice(2);
    const r = "0x" + sig.substr(0, 64);
    const s = "0x" + sig.substr(64, 64);
    const v = web3.utils.toDecimal("0x" + sig.substr(128, 2));
    const validSig = await exchange.validateSignature(
      accounts[0],
      hash,
      v,
      r,
      s
    );
    console.log({ sig, validSig, v, r, s });
    assert.isTrue(validSig);
  });

  it("should be able to deposit funds to the exchange", async () => {
    await exchange.deposit(Assets.ETH, 100, { value: 100, from: accounts[0] });
    const balance = await exchange.userTokenBalances(accounts[0], Assets.ETH);
    console.log(balance.toNumber());
  });

  it("should be able to withdraw unlocked funds", async () => {
    await exchange.withdraw(Assets.ETH, 100, { from: accounts[0] });
    const balance = await exchange.userTokenBalances(accounts[0], Assets.ETH);
    console.log(balance.toNumber());
  });

  it("should be able to match two orders", async () => {
    const seller = accounts[0];
    const buyer = accounts[1];

    // Deposit ETH
    await exchange.deposit(Assets.ETH, WeiInEth.mul(BigHundred).mul(BigTwo), { value: WeiInEth.mul(BigHundred).mul(BigTwo), from: seller });

    // Deposit ERC20 to pay PRICE
    await fakeToken.approve(exchange.address, WeiInEth.mul(BigHundred), { from: buyer });
    await exchange.deposit(fakeToken.address, WeiInEth.mul(BigHundred), { from: buyer });

    // Sign orders
    const signedSellOrder = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      sellOrder,
      seller
    );
    const signedBuyOrder = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      buyOrder,
      buyer
    );

    // Filter off properties
    const smallSellOrder = shrubInterface.toSmallOrder(sellOrder);
    const smallBuyOrder = shrubInterface.toSmallOrder(buyOrder);
    const common = shrubInterface.toCommon(sellOrder);

    // Sanity checks
    assert.isTrue(smallSellOrder.isBuy === false, "sell isBuy should be false");
    assert.isTrue(smallBuyOrder.isBuy === true, "buy isBuy should be true");
    assert.isTrue(
      smallSellOrder.price <= smallBuyOrder.price,
      "Price should be sufficient for seller"
    );
    assert.isTrue(
      smallSellOrder.size <= smallBuyOrder.size,
      "Sell size should be sufficient for seller"
    );
    assert.isTrue(
      smallSellOrder.offerExpire >= Date.now() / 1000,
      "Sell Offer should not be expired"
    );
    assert.isTrue(
      smallBuyOrder.offerExpire >= Date.now() / 1000,
      "Buy Offer should not be expired"
    );

    // Make sure the signature recovers to our address
    const sellerRecovered = await exchange.getAddressFromSignedOrder(
      smallSellOrder,
      common,
      signedSellOrder.sig
    );
    assert.equal(seller, sellerRecovered, "Seller should match");

    // Make sure the nonces match what we expect
    const sellerNonce = await exchange.getCurrentNonce(
      seller,
      common.quoteAsset,
      common.baseAsset
    );
    const buyerNonce = await exchange.getCurrentNonce(
      buyer,
      common.quoteAsset,
      common.baseAsset
    );
    assert.isTrue(
      sellerNonce == sellOrder.nonce - 1,
      "Seller nonce should match order"
    );
    assert.isTrue(
      buyerNonce == buyOrder.nonce - 1,
      "Buyer nonce should match order"
    );

    // Make sure we've got balance available for seller
    const sellerBalance = await exchange.getAvailableBalance(
      seller,
      common.quoteAsset
    );
    if (sellOrder.optionType == 1) {
      console.log("SOLD A CALL");
      assert.isTrue(
        sellerBalance.gte(smallSellOrder.size),
        "Seller should have enough free collateral"
      );
    } else {
      console.log("SOLD A PUT");
      assert.isTrue(
        sellerBalance.toNumber() >= smallSellOrder.size * common.strike / STRIKE_BASE_SHIFT,
        "Seller should have enough free collateral"
      );
    }

    // Match the order, make sure seller has correct amount of asset locked up
    await exchange.matchOrder(
      smallSellOrder,
      smallBuyOrder,
      common,
      signedSellOrder.sig,
      signedBuyOrder.sig,
      { from: accounts[0] }
    );

    const sellerLockedBalance = (
      await exchange.userTokenLockedBalance(seller, Assets.ETH)
    );

    if (sellOrder.optionType == 1) {
      assert.equal(
        smallSellOrder.size,
        sellerLockedBalance,
        "Seller should have SIZE locked up for CALLS"
      );
    } else {
      assert.equal(
        smallSellOrder.size * common.strike / STRIKE_BASE_SHIFT,
        sellerLockedBalance,
        "Seller should have SIZE * STRIKE locked up for PUTS"
      );
    }

    // Make sure the buyer paid us sellOrder.price
    const paidToken =
      sellOrder.optionType == 1 ? fakeToken.address : Assets.ETH;
    const paidBalance = await exchange.userTokenBalances(seller, paidToken);
    assert.equal(paidBalance, smallSellOrder.price);
    const paid = { paidToken, paidBalance: paidBalance.toString() };

    console.log({ signedBuyOrder, signedSellOrder, sellerLockedBalance, paid });
  });


  it("should be able to match array of orders", async () => {
    const seller = accounts[0];
    const buyer = accounts[1];

    // Deposit ETH
    await exchange.deposit(Assets.ETH, BigTwo.mul(BigHundred).mul(WeiInEth), { value: BigTwo.mul(BigHundred).mul(WeiInEth), from: seller });

    // Deposit ERC20 to pay PRICE
    await fakeToken.approve(exchange.address, web3.utils.toBN(300).mul(WeiInEth), { from: buyer });
    await exchange.deposit(fakeToken.address, web3.utils.toBN(300).mul(WeiInEth), { from: buyer });



    const base = {
      price: WeiInEth.mul(BigHundred).toString(),
      offerExpire: Math.floor((new Date().getTime() + 5 * 1000 * 60) / 1000),
      fee: 1,

      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: Math.floor((new Date().getTime() + 30 * 1000 * 60) / 1000),
      strike: 100e6,
      optionType: 1,
    }

    const sellerLockedBalanceBefore = (
      await exchange.userTokenLockedBalance(seller, Assets.ETH)
    );


    const sellerTokenBalanceBefore = (await exchange.userTokenBalances(seller, Assets.USDC));

    const sellerNonce = (await exchange.getCurrentNonce(
      seller,
      Assets.ETH,
      Assets.USDC
    )).toNumber();


    const buyerNonce = (await exchange.getCurrentNonce(
      buyer,
      Assets.ETH,
      Assets.USDC
    )).toNumber();

    console.log({buyerNonce, sellerNonce});

    let sellOrders = [{
      size: WeiInEth.toString(),
      isBuy: false,
      nonce: sellerNonce + 1,
      ...base
    }, {
      size: WeiInEth.toString(),
      isBuy: false,
      nonce: sellerNonce + 2,
      ...base
    }, {
      size: WeiInEth.toString(),
      isBuy: false,
      nonce: sellerNonce + 3,
      ...base
    }];

    let buyOrders = [{
      ...base,
      size: WeiInEth.mul(web3.utils.toBN(2)).toString(),
      isBuy: true,
      nonce: buyerNonce + 1
    }, {
      ...base,
      size: WeiInEth.toString(),
      isBuy: true,
      nonce: buyerNonce + 2
    }];

    // Sign orders
    const signedSellOrders = await Promise.all(sellOrders.map(s => shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      s,
      seller
    )));

    const signedBuyOrders = await Promise.all(buyOrders.map(b => shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      b,
      buyer
    )));

    // Filter off properties
    const smallSellOrders = sellOrders.map(s => shrubInterface.toSmallOrder(s));
    const smallBuyOrders = buyOrders.map(b => shrubInterface.toSmallOrder(b));
    const commons = sellOrders.map(s => shrubInterface.toCommon(s));

    for(const b of signedBuyOrders) {
      const buyerRecovered = await exchange.getAddressFromSignedOrder(
        shrubInterface.toSmallOrder(b.order),
        commons[0],
        b.sig
      );
      assert.equal(buyer, buyerRecovered, "Buyer should match");
    }

    // Match the order, make sure seller has correct amount of asset locked up
    await exchange.matchOrders(
      smallSellOrders,
      smallBuyOrders,
      commons,
      signedSellOrders.map(o => o.sig),
      signedBuyOrders.map(o => o.sig),
      { from: accounts[0] }
    );

    const sellerLockedBalance = (
      await exchange.userTokenLockedBalance(seller, Assets.ETH)
    );

    if (sellOrder.optionType == 1) {
      assert.equal(
        sellerLockedBalanceBefore.add(web3.utils.toBN(3).mul(WeiInEth)),
        sellerLockedBalance.toString(),
        "Seller should have 3 locked up for CALLS"
      );
    } else {
      assert.equal(
        300 + sellerLockedBalanceBefore,
        sellerLockedBalance,
        "Seller should have 300 locked up for PUTS"
      );
    }

    // Make sure the buyer paid us sellOrder.price
    const paidToken =
      sellOrder.optionType == 1 ? fakeToken.address : Assets.ETH;
    const paidBalance = (await exchange.userTokenBalances(seller, paidToken));
    assert.isTrue(paidBalance.sub(sellerTokenBalanceBefore).eq(web3.utils.toBN(300).mul(WeiInEth)));
    const paid = { paidToken, paidBalance };

    console.log({ sellerLockedBalance, paid });
  });

  it("should have an option position", async () => {
    const fakeToken = await FakeToken.deployed();
    const exchange = await Exchange.deployed();

    const common = shrubInterface.toCommon(buyOrder);
    const commonHash = await exchange.hashOrderCommon(common);
    const seller = accounts[0];
    const buyer = accounts[1];
    const sellerPosition = await exchange.userOptionPosition(
      seller,
      commonHash
    );
    const buyerPosition = await exchange.userOptionPosition(buyer, commonHash);

    assert.isTrue(sellerPosition.eq(WeiInEth.mul(web3.utils.toBN(-1))), "Seller should be short 1 ETH");
    assert.isTrue(buyerPosition.eq(WeiInEth.mul(web3.utils.toBN(1))), "Buyer should be long 1 ETH");
    console.log({ sellerPosition, buyerPosition });
  });

  it("should be able to execute an option position", async () => {
    const seller = accounts[0];
    const buyer = accounts[1];

    const fakeToken = await FakeToken.deployed();
    const exchange = await Exchange.deployed();

    const smallBuyOrder = shrubInterface.toSmallOrder(buyOrder);
    const common = shrubInterface.toCommon(sellOrder);
    const commonHash = await exchange.hashOrderCommon(common);

    // Sign orders
    const signedBuyOrder = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      buyOrder,
      buyer
    );

    // Deposit ERC20 to pay STRIKE * SIZE
    const totalPrice =
      web3.utils.toBN(buyOrder.size)
      .mul(web3.utils.toBN(buyOrder.strike))
      .div(web3.utils.toBN(STRIKE_BASE_SHIFT));
    await fakeToken.approve(exchange.address, totalPrice, {
      from: buyer,
    });
    await exchange.deposit(fakeToken.address, totalPrice, {
      from: buyer,
    });

    const poolBalanceBefore = await exchange.positionPoolTokenBalance(
      commonHash,
      fakeToken.address
    );
    const buyerBalanceBefore = await exchange.userTokenBalances(
      buyer,
      fakeToken.address
    );


    const buyerPosition = await exchange.userOptionPosition(buyer, commonHash);
    await exchange.exercise(buyerPosition, common, {from: buyer});

    const poolBalanceAfter = await exchange.positionPoolTokenBalance(
      commonHash,
      fakeToken.address
    );
    const buyerBalanceAfter = await exchange.userTokenBalances(
      buyer,
      fakeToken.address
    );

    assert.isTrue(
      poolBalanceBefore < poolBalanceAfter,
      "pool balance should increase"
    );
    assert.isTrue(
      buyerBalanceBefore > buyerBalanceAfter,
      "Buyer balance should decrease"
    );
    assert.equal(
      poolBalanceAfter - poolBalanceBefore,
      buyOrder.size * buyOrder.strike / STRIKE_BASE_SHIFT,
      "Pool should now have the assets required to execute"
    );
  });

  it("should be able to claim funds as a seller that has been exercised against", async () => {
    const fakeToken = await FakeToken.deployed();
    const exchange = await Exchange.deployed();

    const common = shrubInterface.toCommon(buyOrder);
    const commonHash = await exchange.hashOrderCommon(common);
    const seller = accounts[0];
    const buyer = accounts[1];
    const sellerPosition = await exchange.userOptionPosition(
      seller,
      commonHash
    );

    const sellerBalanceBefore = await exchange.userTokenBalances(
      seller,
      fakeToken.address
    );

    assert.isTrue(sellerPosition.eq(WeiInEth.mul(web3.utils.toBN(-1))), "Seller should be short 1 ETH");

    const waitTime = 30000 - (Date.now() - startTime);
    console.log(`Waiting ${Math.floor(waitTime / 1000)} seconds for option to expire`);
    await wait(waitTime);

    const baseBalance = (await exchange.userTokenBalances(
      seller,
      common.baseAsset
    )).toString();


    const quoteBalance = (await exchange.userTokenBalances(
      seller,
      common.quoteAsset
    )).toString();


    await exchange.claim(common, {from: seller});

    const sellerBalanceAfter = await exchange.userTokenBalances(
      seller,
      fakeToken.address
    );

    const baseBalanceAfter = (await exchange.userTokenBalances(
      seller,
      common.baseAsset
    )).toString();


    const quoteBalanceAfter = (await exchange.userTokenBalances(
      seller,
      common.quoteAsset
    )).toString();



    const sellerPositionAfter = await exchange.userOptionPosition(
      seller,
      commonHash
    );

    console.log({baseBalance, quoteBalance, baseBalanceAfter, quoteBalanceAfter});

    assert.isTrue(
      sellerBalanceBefore < sellerBalanceAfter,
      "seller balance should increase"
    );

    assert.isTrue(
      sellerPosition < sellerPositionAfter,
      "seller balance should increase"
    );

    assert.isTrue(
      sellerPositionAfter == 0,
      "seller position should be zero"
    );

    console.log({ sellerPosition, sellerBalanceAfter });
  });
});
