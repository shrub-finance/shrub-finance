// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const SUSDToken = artifacts.require("SUSDToken");
// @ts-ignore
const TestTokenFactory = artifacts.require("TestTokenFactory");

module.exports = async () => {
  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);
  const susdToken = await SUSDToken.new();
  SUSDToken.setAsDeployed(susdToken);

  const tokenFactory = await TestTokenFactory.new();
  TestTokenFactory.setAsDeployed(tokenFactory);
};
