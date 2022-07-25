import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  let paperPotAddress: string;
  const paperPotDeployment = await deployments.get("PaperPot");
  paperPotAddress = paperPotDeployment.address;

  await deploy("WaterFaucet", {
    from: deployer,
    args: [paperPotAddress],
    log: true,
  });
};
export default func;
func.id = "deploy_water_faucet"; // id to prevent re-execution
func.tags = ["WaterFaucet"];
