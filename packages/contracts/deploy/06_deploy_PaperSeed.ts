import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const metadataUri = 'QmX89dS39k2FG44TY8YMgENrwruWz96SRSvk3nbGxEnvDo';
const merkleRoot = '0x0d9ed8584731d0b6b1d26cc0281a79b44669a7f80ff14cd299decc674479ce3a'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // constructor(uint256 _maxReserve, bytes32 _merkleRoot, string memory _baseUri) ERC721("Paper Seed", "PSEED") {
    await deploy("PaperSeed", {
    from: deployer,
    args: [10000, merkleRoot, `ipfs://${metadataUri}/`],
    log: true,
  });
};
export default func;
func.id = "deploy_paper_seed"; // id to prevent re-execution
func.tags = ["PaperSeed"];
