// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const FakeToken = artifacts.require("FakeToken");
// @ts-ignore
const TestTokenFactory = artifacts.require("TestTokenFactory");

module.exports = async () => {
  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);

  const fakeToken = await FakeToken.new();
  FakeToken.setAsDeployed(fakeToken);

  const tokenFactory = await TestTokenFactory.new();
  TestTokenFactory.setAsDeployed(tokenFactory);
};
