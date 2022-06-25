import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // constructor(string memory imageBaseUri_) {
  //   _imageBaseUri = imageBaseUri_;
  // }

  // const imageBaseUri = 'https://imageBaseUri';
  const imageBaseUri = 'ipfs://Qma6J1XLwV6H1XgEMY5h6GqdFaYbLmu49iT1GBCcSgk32C/'
  const shrubDefaultImageUris = [
    'ipfs://QmaQve5NbkqHFSd528LUXCTqeEisek5xtWmSSkqpkmqqQr/wonder.png',
    'ipfs://QmaQve5NbkqHFSd528LUXCTqeEisek5xtWmSSkqpkmqqQr/passion.png',
    'ipfs://QmaQve5NbkqHFSd528LUXCTqeEisek5xtWmSSkqpkmqqQr/hope.png',
    'ipfs://QmaQve5NbkqHFSd528LUXCTqeEisek5xtWmSSkqpkmqqQr/power.png'
  ]

  await deploy("PaperPotMetadata", {
    from: deployer,
    args: [imageBaseUri, shrubDefaultImageUris],
    log: true,
  });
};
export default func;
func.id = "deploy_paper_pot_metadata"; // id to prevent re-execution
func.tags = ["PaperPotMetadata"];
