// @ts-ignore
const ShrubExchange = artifacts.require("ShrubExchange");
// @ts-ignore
const OrderLib = artifacts.require("OrderLib");
// @ts-ignore
const SUSDToken = artifacts.require("SUSDToken");

// @ts-ignore
const HashUtil = artifacts.require("HashUtil");



let linked = false;
module.exports = async () => {
/*
 *  const orderLib = await OrderLib.new();
 *  OrderLib.setAsDeployed(orderLib);
 *
 *  if(!linked) {
 *    await ShrubExchange.link(orderLib);
 *    linked = true;
 *  }
 *
 */
  const shrubExchange = await ShrubExchange.new();
  ShrubExchange.setAsDeployed(shrubExchange);
  const hashUtil = await HashUtil.new();
  HashUtil.setAsDeployed(hashUtil);
  const susdToken = await SUSDToken.new();
  SUSDToken.setAsDeployed(susdToken);
};
