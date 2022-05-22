import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const wethDeployment = await deployments.get("WETH");
  const wethAddress = wethDeployment.address;

  await deploy("NFTTicket", {
    from: deployer,
    args: [wethAddress],
    log: true,
  });
};
export default func;
func.id = "deploy_nft_ticket"; // id to prevent re-execution
func.tags = ["NFTTicket"];
