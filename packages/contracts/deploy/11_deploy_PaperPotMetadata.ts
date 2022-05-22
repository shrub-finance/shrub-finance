import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // constructor(string memory imageBaseUri_) {
  //   _imageBaseUri = imageBaseUri_;
  // }

  const imageBaseUri = 'https://imageBaseUri';

  await deploy("PaperPotMetadata", {
    from: deployer,
    args: [imageBaseUri],
    log: true,
  });
};
export default func;
func.id = "deploy_paper_pot_metadata"; // id to prevent re-execution
func.tags = ["PaperPotMetadata"];
