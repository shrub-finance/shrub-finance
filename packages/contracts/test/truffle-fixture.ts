// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const SUSDToken = artifacts.require("SUSDToken");
// @ts-ignore
const TestTokenFactory = artifacts.require("TestTokenFactory");

// @ts-ignore
const HashUtil = artifacts.require("HashUtil");



module.exports = async () => {
  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);
  const hashUtil = await HashUtil.new();
  HashUtil.setAsDeployed(hashUtil);
  const susdToken = await SUSDToken.new();
  SUSDToken.setAsDeployed(susdToken);

  const tokenFactory = await TestTokenFactory.new();
  TestTokenFactory.setAsDeployed(tokenFactory);
};
