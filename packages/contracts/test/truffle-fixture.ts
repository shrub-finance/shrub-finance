// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const OrderLib = artifacts.require("OrderLib");
// @ts-ignore
const SUSDToken = artifacts.require("SUSDToken");

let linked = false;
module.exports = async () => {
  const orderLib = await OrderLib.new();
  OrderLib.setAsDeployed(orderLib);

  if(!linked) {
    await ShrubExchange.link(orderLib);
    linked = true;
  }

  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);
  const susdToken = await SUSDToken.new();
  SUSDToken.setAsDeployed(susdToken);
};
