import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-solhint";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, env) => {
  const { ethers } = env;
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task(
  "fundAccounts",
  "deposits ETH and FK into first two accounts",
  async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const weiInEth = ethers.BigNumber.from(10).pow(18);
    const tenEth = ethers.BigNumber.from(10).mul(weiInEth);
    const [account0, account1] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const fakeTokenDeployment = await deployments.get("FakeToken");
    const shrubExchange = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const fakeToken = await ethers.getContractAt(
      "FakeToken",
      fakeTokenDeployment.address
    );

    // ensure that fakeToken deploy is confirmed
    // await fakeToken.deployTransaction.wait();
    await (
      await fakeToken.approve(
        shrubExchange.address,
        ethers.BigNumber.from(10000).mul(weiInEth)
      )
    ).wait();
    await fakeToken.transfer(
      account1.address,
      ethers.BigNumber.from(1000).mul(weiInEth)
    );
    const fkBalance0 = await fakeToken.balanceOf(account0.address);
    const fkBalance1 = await fakeToken.balanceOf(account1.address);

    // Deposit 10 ETH and 500 FK in the shrubExchange
    // Ensure that shrubExchange is deployed
    // await shrubExchange.deployTransaction.wait();
    await shrubExchange.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchange.deposit(
      fakeToken.address,
      ethers.BigNumber.from(8500).mul(weiInEth)
    );

    // Setup contracts for account1
    const fakeTokenAcct1 = fakeToken.connect(account1);
    const shrubExchangeAcct1 = shrubExchange.connect(account1);
    await (
      await fakeTokenAcct1.approve(
        shrubExchange.address,
        ethers.BigNumber.from(10000).mul(weiInEth)
      )
    ).wait();
    await shrubExchangeAcct1.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchangeAcct1.deposit(
      fakeToken.address,
      ethers.BigNumber.from(500).mul(weiInEth)
    );

    console.log(`ShrubContractAddress: ${shrubExchange.address}`);
    console.log(`FkContractAddress: ${fakeToken.address}`);
  }
);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

type AbiExporter = { abiExporter: any };
const config: HardhatUserConfig & AbiExporter = {
  defaultNetwork: "hardhat",
  networks: {
    ganache: {
      url: "http://localhost:8545",
      chainId: 1337,
    },
    hardhat: {
      accounts: {
        mnemonic:
        "palm weapon verb cream balcony acid book ring surround end race gaze",
      },
      /*mining: {
            auto: false,
            interval: 5000
        },*/
      chainId: 1337,
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  solidity: "0.7.3",
  gasReporter: {
    currency: "USD",
    enabled: !!process.env.REPORT_GAS,
  },
  abiExporter: {
    path: "./abi",
    clear: true,
    flat: true,
    spacing: 2,
  },
  mocha: {
    timeout: 35000
  }
};

export default config;
