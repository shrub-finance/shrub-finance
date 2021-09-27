const TestTokenFactory = artifacts.require("TestTokenFactory");

contract("TestTokenFactory", (accounts) => {
  const WeiInEth = web3.utils.toBN(10).pow(web3.utils.toBN(18))

  let factory;
  before(async () => {
    factory = await TestTokenFactory.deployed();
  });

  function getNewTokenFromTx(tx) {
    return tx.logs.find( l => l.event == "TokenCreated").args.token;
  }

  it("should be able to create a test token", async () => {
    const admin = accounts[0];
    const tokenCreated = await factory.createToken("Test Token", "TEST", 10);
    const address = getNewTokenFromTx(tokenCreated);
    const rate = await factory.tokenRates(address);
    assert.equal(rate, 10);
  });

  it("should be able to mint a token", async () => {
    const user = accounts[1];
    const tokenCreated = await factory.createToken("Test Token 2", "TEST2", 10);
    const address = getNewTokenFromTx(tokenCreated);
    await factory.mintToken(address, {value: WeiInEth, from: user});

    const token = await ethers.getContractAt(
      "MintBurnToken",
      address
    );

    const balance = web3.utils.toBN(await token.balanceOf(user));
    assert.isTrue(balance.eq(WeiInEth.mul(web3.utils.toBN(10))));
  });


  it("should be able to burn a token", async () => {
    const user = accounts[1];
    const tokenCreated = await factory.createToken("Test Token 3", "TEST3", 10);
    const address = getNewTokenFromTx(tokenCreated);
    await factory.mintToken(address, {value: WeiInEth, from: user});

    const token = await ethers.getContractAt(
      "MintBurnToken",
      address
    );

    const balance = web3.utils.toBN(await token.balanceOf(user));
    await factory.burnToken(address, balance, {from: user});

    const balanceAfter = (await token.balanceOf(user)).toNumber();
    assert.equal(balanceAfter,  0);
  });
});
