// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const SUSDToken = artifacts.require("SUSDToken");
// @ts-ignore
const TestTokenFactory = artifacts.require("TestTokenFactory");
// @ts-ignore
const TokenFaucet = artifacts.require("TokenFaucet");
// @ts-ignore
const HashUtil = artifacts.require("HashUtil");

// @ts-ignore
const TokenizeLib = artifacts.require("TokenizeLib");

let linked = false;
module.exports = async () => {
  if (!linked) {
    linked = true;
    try {
      const tokenizeLib = await TokenizeLib.new();
      TokenizeLib.setAsDeployed(tokenizeLib);
      await ShrubExchange.link(tokenizeLib);
    } catch (e) {
      console.error(e);
    }
  }

  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);

  const hashUtil = await HashUtil.new();
  HashUtil.setAsDeployed(hashUtil);

  const susdToken = await SUSDToken.new();
  SUSDToken.setAsDeployed(susdToken);

  const tokenFactory = await TestTokenFactory.new();
  TestTokenFactory.setAsDeployed(tokenFactory);

  const tokenFaucet = await TokenFaucet.new();
  TokenFaucet.setAsDeployed(tokenFaucet);
};
