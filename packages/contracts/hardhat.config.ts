import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-solhint";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";

// All of the tasks are in a separate file
import "./hardhat-tasks";

import dotenv from "dotenv";
dotenv.config();


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
      allowUnlimitedContractSize: true,
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
    polygon: {
      chainId: 137,
      url: "https://polygon-rpc.com",
      // url: 'https://rpc-mainnet.maticvigil.com/',
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: !!process.env.REPORT_GAS,
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY, // polygon
    // apiKey: process.env.ETHERSCAN_API_KEY  // ethereum
  },
  mocha: {
    timeout: 35000,
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
};

if (process.env.MUMBAI_SECRET_KEY) {
  config.networks.mumbai = {
    chainId: 80001,
    // url: 'https://rpc-mumbai.matic.today',
    url: "https://rpc-mumbai.maticvigil.com",
    // url: 'https://matic-mumbai.chainstacklabs.com',
    // url: 'https://matic-testnet-archive-rpc.bwarelabs.com',
    accounts: [process.env.MUMBAI_SECRET_KEY],
  };
  config.networks.rinkeby = {
    chainId: 4,
    url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    accounts: [process.env.MUMBAI_SECRET_KEY],
  };
}

if (process.env.MUMBAI_SECRET_MNEMONIC) {
  config.networks.mumbai = {
    chainId: 80001,
    // url: 'https://rpc-mumbai.matic.today',
    // url: "https://rpc-mumbai.maticvigil.com",
    url: 'https://matic-mumbai.chainstacklabs.com',
    // url: 'https://matic-testnet-archive-rpc.bwarelabs.com',
    accounts: {
      mnemonic: process.env.MUMBAI_SECRET_MNEMONIC,
    },
  };
}

if (process.env.POLYGON_SECRET_MNEMONIC) {
  config.networks.polygon.accounts = {
    mnemonic: process.env.POLYGON_SECRET_MNEMONIC,
  };
  // config.networks.polygon = {
  //   chainId: 137,
  //   url: 'https://rpc-mainnet.maticvigil.com/',
  //   accounts: {
  //     mnemonic: process.env.POLYGON_SECRET_MNEMONIC,
  //   },
  // }
}

export default config;
