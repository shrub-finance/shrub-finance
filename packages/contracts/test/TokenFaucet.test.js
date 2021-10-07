const SUSD = artifacts.require("SUSDToken");
const TokenFaucet = artifacts.require("TokenFaucet");
const toBN = web3.utils.toBN;

contract("TokenFaucet", (accounts) => {
  const WeiInEth = web3.utils.toBN(10).pow(web3.utils.toBN(18))

  let susd;
  let faucet;
  before(async () => {
    faucet = await TokenFaucet.deployed();
    susd = await SUSD.deployed();
  });

  function getNewTokenFromTx(tx) {
    return tx.logs.find( l => l.event == "TokenCreated").args.token;
  }

  it("should be able to add the token to faucet", async () => {
    const user = accounts[0];
    const address = susd.address;
    const rate = 1;
    await faucet.addToken(address, rate, {from: user});
    const addAmount = WeiInEth.mul(toBN(10));
    await susd.transfer(faucet.address, addAmount, {from: user});
  });


  it("should be able to buy tokens from the faucet", async () => {
    const user = accounts[1];
    const address = susd.address;
    const rate = 1;
    await faucet.buyFromFaucet(address, {value: WeiInEth, from: user});
    const balance = web3.utils.toBN(await susd.balanceOf(user));
    assert.isTrue(balance.eq(WeiInEth.mul(web3.utils.toBN(rate))));
  });


  it("should be able to sell tokens to the faucet", async () => {
    const user = accounts[1];
    const address = susd.address;
    const rate = 1;
    const balance = web3.utils.toBN(await susd.balanceOf(user));
    await susd.approve(faucet.address, balance, {from: user})
    await faucet.sellToFaucet(address, balance, {from: user});
    const balanceAfter = web3.utils.toBN(await susd.balanceOf(user));
    assert.isTrue(balanceAfter.eq(web3.utils.toBN(0)));
  });
});
