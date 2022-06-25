import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy"

function toEthDate(date: Date) {
  return Math.round(Number(date) / 1000);
}
function fromEthDate(ethDate: number) {
  return new Date(ethDate * 1000);
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer, account2 } = await getNamedAccounts();
  let paperPotAddress: string;
  let wethAddress: string;
  let fundsRecipient: string;
  let mintStartDate: number;
  let mintEndDate: number;
  let maxSupply: number = 124;

  if (network.name !== 'localhost') {
    const paperPotDeployment = await deployments.get("PaperPot");
    const wethDeployment = await deployments.get("WETH");
    paperPotAddress = paperPotDeployment.address;
    wethAddress = wethDeployment.address;
    fundsRecipient = account2;
    const now = new Date();
    let oneDayFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 1));
    mintStartDate = toEthDate(now);
    mintEndDate = toEthDate(oneDayFromNow);
  }
  console.log(paperPotAddress, wethAddress, fundsRecipient, mintStartDate, mintEndDate, maxSupply);
  if (!paperPotAddress || !wethAddress || !fundsRecipient || !mintStartDate || !mintEndDate || !maxSupply) {
    throw new Error('missing required args');
  }
  await deploy("PaperPotMint", {
    from: deployer,
    args: [paperPotAddress, wethAddress, fundsRecipient, mintStartDate, mintEndDate, maxSupply],
    log: true,
  });
};
export default func;
func.id = "deploy_paper_pot_mint"; // id to prevent re-execution
func.tags = ["PaperPotMint"];
