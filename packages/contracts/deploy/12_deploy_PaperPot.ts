import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const paperSeedDeployment = await deployments.get("PaperSeed");
  const paperSeedAddress = paperSeedDeployment.address;
  const paperPotMetadataDeployment = await deployments.get("PaperPotMetadata");
  const metadataGenerator = paperPotMetadataDeployment.address;
  const seedContractAddresses = [paperSeedAddress];
  const resourceUris = [
    'https://pot',
    'https://fertilizer',
    'https://water',
  ]
  const shrubDefaultUris = [
    'https://wonder',
    'https://passion',
    'https://hope',
    'https://power',
  ]
  const sadSeeds = [1,11,101,150,1555];

//   constructor(
//     address[] memory seedContractAddresses,
//     uint[] memory sadSeeds,
//     string[] memory resourceUris_,
//     string[] memory shrubDefaultUris_,
//     address metadataGenerator_
// ) ERC1155("") {
  await deploy("PaperPot", {
    from: deployer,
    args: [seedContractAddresses, sadSeeds, resourceUris, shrubDefaultUris, metadataGenerator],
    log: true,
  });
};
export default func;
func.id = "deploy_paper_pot"; // id to prevent re-execution
func.tags = ["PaperPot"];
