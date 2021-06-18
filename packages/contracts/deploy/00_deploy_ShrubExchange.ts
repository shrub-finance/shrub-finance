import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("ShrubExchange", {
    from: deployer,
    log: true,
  });
};
export default func;
func.id = "deploy_shrub_exchange"; // id to prevent re-execution
func.tags = ["ShrubExchange"];
