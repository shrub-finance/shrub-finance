import { HardhatUserConfig, task, types } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-solhint";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";

import optionContracts from "./option-contracts.json";
import {ShrubExchange, ShrubExchange__factory} from "./types/ethers-v5";
import {OrderCommon, SmallOrder} from "@shrub/app/src/types";
const bs = require('./utils/black-scholes');
const { Shrub712 } = require("./utils/EIP712");

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
  "deposits MATIC and SUSD into first two accounts",
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
        ethers.BigNumber.from(100000).mul(weiInEth)
      )
    ).wait();
    await fakeToken.transfer(
      account1.address,
      ethers.BigNumber.from(1000).mul(weiInEth)
    );
    const fkBalance0 = await fakeToken.balanceOf(account0.address);
    const fkBalance1 = await fakeToken.balanceOf(account1.address);

    // Deposit 10 MATIC and 500 SUSD in the shrubExchange
    // Ensure that shrubExchange is deployed
    // await shrubExchange.deployTransaction.wait();
    await shrubExchange.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchange.deposit(
      fakeToken.address,
      ethers.BigNumber.from(85000).mul(weiInEth)
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

task( 'maker', 'creates limit orders')
  .addOptionalParam('count', 'number of orders to generate', 100, types.int)
  .addOptionalParam('baseIv', 'the centered IV for the generator', 125, types.float)
  .addOptionalParam('ivRange', 'maximum deviation from the baseIv', 50, types.float)
  .addOptionalParam('ethPrice', 'price of MATIC in USD', 2500, types.float)
  .addOptionalParam('riskFreeRate', 'annual risk free rate of return (0.05 means 5%)', 0.05, types.float)
  .setAction(
    async (taskArgs, env) => {
      console.log(taskArgs);
      const STRIKE_BASE_SHIFT = 1e6;
      const {count, baseIv, ivRange, ethPrice, riskFreeRate} = taskArgs
      const {ethers, deployments, web3} = env;
      const WeiInEth = ethers.constants.WeiPerEther
      const [account0, account1] = await ethers.getSigners();
      const shrubExchangeDeployment = await deployments.get("ShrubExchange");
      const fakeTokenDeployment = await deployments.get("FakeToken");
      const shrubExchangeDeployed = await ethers.getContractAt(
        "ShrubExchange",
        shrubExchangeDeployment.address
      );
      const fakeToken = await ethers.getContractAt(
        "FakeToken",
        fakeTokenDeployment.address
      );
      const shrubInterface = new Shrub712(17, shrubExchangeDeployment.address);
      function getRandomContract() {
        const contractNumber = Math.floor(Math.random() * optionContracts.length);
        return optionContracts[contractNumber];
      }

      function generateRandomOrder() {
        const {expiry, strike:strikeUsdcMillion, optionType } = getRandomContract();
        const strikeUsdc = strikeUsdcMillion / STRIKE_BASE_SHIFT;
        const timeToExpiry = (expiry * 1000 - Date.now()) / (365 * 24 * 60 * 60 * 1000)
        const isBuy = Math.random() * 100 > 50;
        const volatility = ((isBuy ? -1 : 1) * Math.random() * ivRange + baseIv) / 100;
        console.log(`
          MATIC price: ${ethPrice}
          strike: ${strikeUsdc}
          time to expiry (years): ${timeToExpiry}
          volatility: ${volatility}
          risk free rate: ${riskFreeRate}
        `)
        const strike = ethers.BigNumber.from(strikeUsdcMillion);
        const sizeEth = Math.floor(Math.random() * 5) + 1;
        const size = ethers.BigNumber.from(sizeEth).mul(WeiInEth);
        const pricePerContractUsdc = Math.round(100 * bs.blackScholes(ethPrice, strikeUsdc, timeToExpiry, volatility, riskFreeRate, optionType.toLowerCase())) / 100
        if(timeToExpiry < 0) {
          return null
        }
        const price = ethers.BigNumber.from(Math.round(pricePerContractUsdc * 100)).mul(WeiInEth.div(ethers.BigNumber.from(100))).mul(size).div(WeiInEth);
        const fee = ethers.BigNumber.from(Math.floor(Math.random() * 100))
        const smallOrder: SmallOrder = {
          size,
          isBuy,
          nonce: 0,
          price,
          fee,
          offerExpire: Math.floor((new Date().getTime() + 60 * 1000 * 60) / 1000),
        }
        const common: OrderCommon = {
          baseAsset: fakeToken.address,
          quoteAsset: ethers.constants.AddressZero,
          expiry,
          strike,
          optionType: optionType === 'CALL' ? 1 : 0,
        }
        return { smallOrder, common }
      }


      const account = account0
      const shrubContractAccount = ShrubExchange__factory.connect(shrubExchangeDeployed.address, account);
      const orderTypeHash = await shrubContractAccount.ORDER_TYPEHASH();
      for (let i = 0; i < count; i++) {
        const { smallOrder, common } = await generateRandomOrder();
        if (!smallOrder || !common) {
          continue;
        }
        const nonce = await shrubContractAccount["getCurrentNonce(address,(address,address,uint256,uint256,uint8))"](account.address, common)
        //  Overwrite nonce
        smallOrder.nonce = nonce.toNumber() + 1;
        console.log(orderTypeHash, smallOrder, account.address, common)
        const signedSellOrder = await shrubInterface.signOrderWithWeb3(
          web3,
          orderTypeHash,
          {
            size: smallOrder.size.toString(),
            price: smallOrder.price.toString(),
            fee: smallOrder.fee.toNumber(),
            strike: common.strike.toString(),
            ...smallOrder,
            ...common,
          },
          account.address
        );
        await shrubContractAccount.announce(smallOrder, common, signedSellOrder.sig)
      }
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
