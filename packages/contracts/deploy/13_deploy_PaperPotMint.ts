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

  // if (network.name !== 'localhost') {
  //   const paperPotDeployment = await deployments.get("PaperPot");
  //   const wethDeployment = await deployments.get("WETH");
  //   paperPotAddress = paperPotDeployment.address;
  //   wethAddress = wethDeployment.address;
  //   fundsRecipient = account2;
  //   const now = new Date();
  //   let oneDayFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 1));
  //   mintStartDate = toEthDate(now);
  //   mintEndDate = toEthDate(oneDayFromNow);
  // }

  const paperPotDeployment = await deployments.get("PaperPot");
  // const now = new Date();
  // let oneDayFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 1));

  // paperPotAddress = paperPotDeployment.address;
  // wethAddress = '0x1b91ABd51e34524F11Bca086a5fECD716eD1aadd'  // Mumbai
  // fundsRecipient = '0x8BdB0a4cBbB8fd047eB07A1950d5f1e1Af3B48f2';  // Mumbai Test1 Chrome
  // mintStartDate = toEthDate(now);  // Mumbai
  // mintEndDate = toEthDate(oneDayFromNow)

  paperPotAddress = paperPotDeployment.address;
  wethAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'  // Polygon
  fundsRecipient = '0x4497C08e3FcC1580B13afA1ddDA10aB3aB0822ae';  // Polygon
  mintStartDate = toEthDate(new Date('2022-06-25T14:30:00.000Z'));  // 10:30a June 25
  mintEndDate = toEthDate(new Date('2022-06-27T14:30:00.000Z'));    // 10:30a June 27

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
