// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const SUSDToken = artifacts.require("SUSDToken");

module.exports = async () => {
  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);
  const susdToken = await SUSDToken.new();
  SUSDToken.setAsDeployed(susdToken);
};
