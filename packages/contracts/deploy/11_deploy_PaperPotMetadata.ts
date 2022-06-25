import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const imageBaseUri = 'ipfs://Qma6J1XLwV6H1XgEMY5h6GqdFaYbLmu49iT1GBCcSgk32C/'
  const shrubDefaultImageUris = [
    'ipfs://QmZhNz9uzbFL1qYi1ZoLJSbHWwnoakdCWD1RueiHCi4aob', // Wonder
    'ipfs://QmZiLsTv8aeWw97MdRN7hQ6fUmVX754GGMfGG4i3oc9N5q', // Passion
    'ipfs://QmXmV17zELQQpkWw1VfwXPRMaxsk8EkEVBDJn6VRioL6rV', // Hope
    'ipfs://QmbFabH5JL2UsJnSsaZFTwBwSSSZjp5RKgZPugnM6FmAi4', // Power
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
