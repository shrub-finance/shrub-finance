import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("BabyBudAvatar", {
    from: deployer,
    args: [],
    log: true,
  });
};
export default func;
func.id = "deploy_baby_bud_avatar"; // id to prevent re-execution
func.tags = ["BabyBudAvatar"];
