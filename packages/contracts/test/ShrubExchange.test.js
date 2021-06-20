const Exchange = artifacts.require("ShrubExchange");
const FakeToken = artifacts.require("FakeToken");
const { Shrub712 } = require("../utils/EIP712");
const utils = require("ethereumjs-util");

const Assets = {
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  ETH: "0x0000000000000000000000000000000000000000",
};
contract("ShrubExchange", (accounts) => {
  let exchange;
  let shrubInterface;
  let fakeToken;
  let orderTypeHash;

  let sellOrder = {
    size: 1,
    isBuy: false,
    nonce: 1,
    price: 100,
    offerExpire: Math.floor((new Date().getTime() + 5 * 1000 * 60) / 1000),
    fee: 1,

    baseAsset: Assets.USDC,
    quoteAsset: Assets.ETH,
    expiry: Math.floor((new Date().getTime() + 30 * 1000 * 60) / 1000),
    strike: 100,
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
    await fakeToken.transfer(accounts[1], 10000, { from: accounts[0] });
  });

  it("should hash an order and match the contract's hash", async () => {
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
      strike: 3300,
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
    await exchange.deposit(Assets.ETH, 200, { value: 200, from: seller });

    // Deposit ERC20 to pay PRICE
    await fakeToken.approve(exchange.address, 100, { from: buyer });
    await exchange.deposit(fakeToken.address, 100, { from: buyer });

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
        sellerBalance.toNumber() >= smallSellOrder.size,
        "Seller should have enough free collateral"
      );
    } else {
      console.log("SOLD A PUT");
      assert.isTrue(
        sellerBalance.toNumber() >= smallSellOrder.size * common.strike,
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
    ).toNumber();

    if (sellOrder.optionType == 1) {
      assert.equal(
        smallSellOrder.size,
        sellerLockedBalance,
        "Seller should have SIZE locked up for CALLS"
      );
    } else {
      assert.equal(
        smallSellOrder.size * common.strike,
        sellerLockedBalance,
        "Seller should have SIZE * STRIKE locked up for PUTS"
      );
    }

    // Make sure the buyer paid us sellOrder.price
    const paidToken =
      sellOrder.optionType == 1 ? fakeToken.address : Assets.ETH;
    const paidBalance = await exchange.userTokenBalances(seller, paidToken);
    assert.equal(paidBalance, smallSellOrder.price * smallBuyOrder.size);
    const paid = { paidToken, paidBalance: paidBalance.toNumber() };

    console.log({ signedBuyOrder, signedSellOrder, sellerLockedBalance, paid });
  });


  it("should be able to match array of orders", async () => {
    const seller = accounts[0];
    const buyer = accounts[1];

    // Deposit ETH
    await exchange.deposit(Assets.ETH, 200, { value: 200, from: seller });

    // Deposit ERC20 to pay PRICE
    await fakeToken.approve(exchange.address, 300, { from: buyer });
    await exchange.deposit(fakeToken.address, 300, { from: buyer });



    const base = {
      price: 100,
      offerExpire: Math.floor((new Date().getTime() + 5 * 1000 * 60) / 1000),
      fee: 1,

      baseAsset: Assets.USDC,
      quoteAsset: Assets.ETH,
      expiry: Math.floor((new Date().getTime() + 30 * 1000 * 60) / 1000),
      strike: 100,
      optionType: 1,
    }

    const sellerLockedBalanceBefore = (
      await exchange.userTokenLockedBalance(seller, Assets.ETH)
    ).toNumber();


    const sellerTokenBalanceBefore = (await exchange.userTokenBalances(seller, Assets.USDC)).toNumber();

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
      size: 1,
      isBuy: false,
      nonce: sellerNonce + 1,
      ...base
    }, {
      size: 1,
      isBuy: false,
      nonce: sellerNonce + 2,
      ...base
    }, {
      size: 1,
      isBuy: false,
      nonce: sellerNonce + 3,
      ...base
    }];

    let buyOrders = [{
      ...base,
      size: 2,
      isBuy: true,
      nonce: buyerNonce + 1
    }, {
      ...base,
      size: 1,
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
    ).toNumber();

    if (sellOrder.optionType == 1) {
      assert.equal(
        3 + sellerLockedBalanceBefore,
        sellerLockedBalance,
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
    const paidBalance = (await exchange.userTokenBalances(seller, paidToken)).toNumber();
    assert.equal(paidBalance - sellerTokenBalanceBefore, 100 * 3);
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

    assert.equal(sellerPosition.toNumber(), -1, "Seller should be short 1 ETH");
    assert.equal(buyerPosition.toNumber(), 1, "Buyer should be long 1 ETH");
    console.log({ sellerPosition, buyerPosition });
  });

  it("should be able to execute an option position", async () => {
    const seller = accounts[0];
    const buyer = accounts[1];

    const fakeToken = await FakeToken.deployed();
    const exchange = await Exchange.deployed();

    const smallBuyOrder = shrubInterface.toSmallOrder(buyOrder);
    const common = shrubInterface.toCommon(sellOrder);

    // Sign orders
    const signedBuyOrder = await shrubInterface.signOrderWithWeb3(
      web3,
      orderTypeHash,
      buyOrder,
      buyer
    );

    // Deposit ERC20 to pay STRIKE * SIZE
    await fakeToken.approve(exchange.address, buyOrder.size * buyOrder.strike, {
      from: buyer,
    });
    await exchange.deposit(fakeToken.address, buyOrder.size * buyOrder.strike, {
      from: buyer,
    });

    const sellerBalanceBefore = await exchange.userTokenBalances(
      seller,
      fakeToken.address
    );
    const buyerBalanceBefore = await exchange.userTokenBalances(
      buyer,
      fakeToken.address
    );
    await exchange.execute(smallBuyOrder, common, seller, signedBuyOrder.sig);
    const sellerBalanceAfter = await exchange.userTokenBalances(
      seller,
      fakeToken.address
    );
    const buyerBalanceAfter = await exchange.userTokenBalances(
      buyer,
      fakeToken.address
    );

    assert.isTrue(
      sellerBalanceBefore < sellerBalanceAfter,
      "Seller balance should increase"
    );
    assert.isTrue(
      buyerBalanceBefore > buyerBalanceAfter,
      "Buyer balance should decrease"
    );
    assert.equal(
      sellerBalanceAfter - sellerBalanceBefore,
      buyOrder.size * buyOrder.strike,
      "Seller should now have the assets required to execute"
    );
  });
});
