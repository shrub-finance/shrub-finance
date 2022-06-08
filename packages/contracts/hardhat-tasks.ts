import { task, types } from 'hardhat/config'
import "@nomiclabs/hardhat-ethers";
import {
  HashUtil__factory, PaperPot__factory,
  PaperSeed__factory,
  PotNFTTicket__factory,
  SeedOrphanageV2__factory,
  ShrubExchange__factory, SMATICToken__factory,
  SUSDToken__factory,
} from './types'
import { readFileSync } from 'fs'
import { OrderCommon, SmallOrder } from '@shrub/app/src/types'
import { ACTIVE_ORDERS_QUERY } from './queries'
import assert from 'node:assert/strict';


import { ApolloClient, gql, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";
import promptly from "promptly";
// import optionContracts from "./option-contracts.json";
import chainlinkAggregatorV3Interface from "./external-contracts/chainlinkAggregatorV3InterfaceABI.json";
import { address } from 'hardhat/internal/core/config/config-validation'
const bs = require("./utils/black-scholes");
const { Shrub712 } = require("./utils/EIP712");

function toEthDate(date: Date) {
  return Math.round(Number(date) / 1000);
}
function fromEthDate(ethDate: number) {
  return new Date(ethDate * 1000);
}

const CHAINLINK_MATIC = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada"; // Mumbai
const CHAINLINK_ETH = "0x0715A7794a1dc8e42615F059dD6e406A6594651A"; // Mumbai
const CHAINLINK_BTC = "0x007A22900a3B98143368Bd5906f8E17e9867581b"; // Mumbai
const CHAINLINK_LINK_MATIC = "0x12162c3E810393dEC01362aBf156D7ecf6159528"; // Mumbai
const CHAINLINK_USDC = "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0"; // Mumbai
const MINUTES_BETWEEN_ORDERS = 5; // For maker2

const expiryDates = [
  new Date("2022-05-02"),
  new Date("2022-06-02"),
  new Date("2022-07-02"),
  // [toEthDate(new Date('2021-12-11')).toString()] : standardStrikes,
  // [toEthDate(new Date('2021-12-18')).toString()] : standardStrikes,
  // [toEthDate(new Date('2021-12-25')).toString()] : standardStrikes,
];
const callsArr = [2e6, 2.3e6, 2.5e6, 2.7e6];
const putsArr = [2e6, 1.8e6, 1.6e6, 1.4e6];

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, env) => {
  const { ethers } = env;
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("mintSeed", "seedContract owner mints an unclaimed seed")
  .addOptionalParam("id", "tokenId of the seed to claim", undefined, types.int)
  .addOptionalParam("ids", "tokenIds of seeds to claim", undefined, types.json)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id, ids } = taskArgs;
    if (!id && !ids) {
      console.log("id or ids must be provided");
      return;
    }
    const tokenIds = ids ? ids : [id];
    const [signer] = await ethers.getSigners();
    const seedDeployment = await deployments.get("PaperSeed");
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    for (const tokenId of tokenIds) {
      console.log(`claiming token ${tokenId}`);
      try {
        await PaperSeed.claimReserve(tokenId);
      } catch (e) {
        console.log(e.message);
        console.log(`error minting tokenId ${tokenId}`);
        console.log("breaking");
        return;
      }
    }
  });

task("sendSeed", "send a seed from the owner contract to an address")
  .addParam("id", "tokenId of the seed to send")
  .addParam("receiver", "address of the receiver")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id, receiver } = taskArgs;
    if (!id) {
      console.log("id is a required param");
      return;
    }
    if (!id) {
      console.log("id is a required param");
      return;
    }
    if (!ethers.utils.isAddress(receiver)) {
      console.log("invalid receiver address");
    }
    const [signer] = await ethers.getSigners();
    const seedDeployment = await deployments.get("PaperSeed");
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    const seedOwner = await PaperSeed.ownerOf(id);
    if (seedOwner !== signer.address) {
      console.log(`this seed is owned by ${seedOwner} - you cannot send it`);
      return;
    }
    const receiverSeeds = await PaperSeed.balanceOf(receiver);
    console.log(`${receiver} currently has ${receiverSeeds} Paper Seeds`);
    const conf = await promptly.confirm(
      `You are about to send tokenId ${id} to ${receiver}. Continue? (y/n)`
    );
    if (!conf) {
      return;
    }
    const tx = await PaperSeed["safeTransferFrom(address,address,uint256)"](
      signer.address,
      receiver,
      id
    );
    console.log(tx.hash);
  });

// task("distributeWater", "distribute water to accounts")
//   .addParam("receivers", "object of acccount/wlSpot pairs ex: {account1: 2, account2: 1}", {}, types.json)
//   .setAction(async (taskArgs, env) => {
//     const { ethers, deployments } = env;
//     const [owner] = await ethers.getSigners();
//     const receivers: {[account: string] : number} = taskArgs.receivers;
//     const accounts = [];
//     const wlSpots = [];
//     for (const [account, receiver] of Object.entries(receivers)) {
//       accounts.push(ethers.utils.getAddress(account));
//       assert.equal(Math.floor(receiver), receiver, "wlSpot must be an integer");
//       assert.equal(receiver >= 0, true, "wlSpot must not be negative");
//       wlSpots.push(receiver);
//     }
//     assert.equal(accounts.length > 0, true, "some wls must be specified");
//     const paperPotDeployment = await deployments.get("PaperPot");
//     const paperPot = PaperPot__factory.connect(paperPotDeployment.address, owner);
//     // await paperPot.adminDistributeWater(owner, amount);
//
//     const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
//     const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
//     await PotNFTTicket.updateWL(tokenId, accounts, wlSpots);
//   })

task("mintWater", "mint new water to an account")
  .addParam("to", "account to mint water to")
  .addParam("amount", "amount of water to mint")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const to = taskArgs.to;
    const amount = taskArgs.amount;
    const paperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(paperPotDeployment.address, owner);
    await paperPot.adminDistributeWater(to, amount);
  })

task("mintFertilizer", "mint new fertilizer to an account")
  .addParam("to", "account to mint fertilizer to")
  .addParam("amount", "amount of fertilizer to mint")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const to = taskArgs.to;
    const amount = taskArgs.amount;
    const paperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(paperPotDeployment.address, owner);
    await paperPot.adminDistributeFertilizer(to, amount);
  })

task("getTicketData", "gets the settings for a NFTTicket")
  .addParam("tokenId", "tokenId to change active state for")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    const ticketData = await PotNFTTicket.getTicketData(tokenId);
    console.log(ticketData);
  });

task("activateNFTTicket", "set the active state of an NFTTicket")
  .addParam("tokenId", "tokenId to change active state for")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .addParam("active", "whether to set active or not", true, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const active: boolean = taskArgs.active;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updateActive(tokenId, active);
  })

task("setPauseNFTTicket", "set the paused state of an NFTTicket")
  .addParam("tokenId", "tokenId to change paused state for")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .addParam("paused", "whether to set paused or not", true, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const paused: boolean = taskArgs.paused;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updatePaused(tokenId, paused);
  })

task("initializeNFTTicket", "initialize a ticket for the pot sale")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .addOptionalParam('recipient', 'account that is paid fees for this ticket', '', types.string)
  .addOptionalParam('contractAddress', 'contract address of NFT to be minted at redemption', '', types.string)
  .addOptionalParam('startDate', 'not used yet', '', types.string)
  .addOptionalParam('endDate', 'not used yet', '', types.string)
  .addOptionalParam('mintStartDate', 'start date of the main mint', '', types.string)
  .addOptionalParam('mintEndDate', 'end date of the main mint', '', types.string)
  .addParam('mintPrice', 'ticket price for the main mint in ETH / 1000')
  .addOptionalParam('wlMintStartDate', 'start date of the main mint', '', types.string)
  .addOptionalParam('wlMintEndDate', 'end date of the main mint', '', types.string)
  .addParam('wlMintPrice', 'ticket price for the main mint in ETH / 1000')
  .addOptionalParam('maxPerMint', 'max amount to be minted at a time during the main mint', 10, types.int)
  .addParam('redeemPrice', 'redeem price for ticket in ETH / 1000')
  .addParam('redeemEndDate', 'redeem endDate after which the ticket cannot be redeemed')
  .addParam('maxSupply', 'max number of tickets to be minted during main mint')
  .addOptionalParam('active', 'state of active at initilization', false, types.boolean)
  .addOptionalParam('paused', 'state of paused at initilization', false, types.boolean)
  .addOptionalParam('redeemActive', 'state of redeemActive at initilization', false, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner, signer1] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const paperPotDeployment = await deployments.get("PaperPot");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    let now = new Date();
    let oneDayFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 1));
    let twoDaysFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 2));
    let { controller, recipient, contractAddress, startDate, endDate, mintStartDate, mintEndDate, mintPrice,
      wlMintStartDate, wlMintEndDate, wlMintPrice, maxPerMint, redeemPrice, redeemEndDate, redeemActive, maxSupply, active, paused} = taskArgs
    const ticketData = {
      controller: controller || signer1.address,
      recipient: recipient || signer1.address,
      contractAddress: contractAddress || paperPotDeployment.address,
      startDate: toEthDate(new Date(startDate)) || toEthDate(now),
      endDate: toEthDate(new Date(endDate)) || toEthDate(oneDayFromNow),
      mintStartDate: toEthDate(new Date(mintStartDate)) || toEthDate(oneDayFromNow),
      mintEndDate: toEthDate(new Date(mintEndDate)) || toEthDate(twoDaysFromNow),
      mintPrice: ethers.constants.WeiPerEther.mul(mintPrice).div(1000),
      wlMintStartDate: toEthDate(new Date(wlMintStartDate)) || toEthDate(now),
      wlMintEndDate: toEthDate(new Date(wlMintEndDate)) || toEthDate(oneDayFromNow),
      wlMintPrice: ethers.constants.WeiPerEther.mul(wlMintPrice).div(1000),
      maxMintAmountPlusOne: maxPerMint + 1,
      redeemPrice: ethers.constants.WeiPerEther.mul(redeemPrice).div(1000),
      redeemEndDate: toEthDate(new Date(redeemEndDate)) || toEthDate(now),
      redeemActive: redeemActive,
      maxSupply: maxSupply,
      active: active,
      paused: paused,
    };
    await PotNFTTicket.initializeTicket(ticketData);
  });

task("setUriTicket")
  .addParam("uri", "uri to set the ticket to")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const uri: string = taskArgs.uri;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    await PotNFTTicket.setUri(uri);
    const newUri = await PotNFTTicket.uri(1);
    console.log(`uri set to ${newUri}`);
  });

task("updateNFTTicketMintDates")
  .addParam("tokenId", "tokenId of ticket to update")
  .addOptionalParam("startDate", "new startDate")
  .addOptionalParam("endDate", "new endDate")
  .addOptionalParam("wlStartDate", "new wlStartDate")
  .addOptionalParam("wlEndDate", "new wlEndDate")
  .addOptionalParam("controller", "address of the controller of the ticket")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    for (const param of ['startDate', 'endDate', 'wlStartDate', 'wlEndDate']) {
      console.log(taskArgs[param]);
      if (!taskArgs[param]) {
        continue;
      }
      const date = new Date(taskArgs[param]);
      if (date.toString() === 'Invalid Date') {
        console.log(`invalid ${param}`);
        return;
      }
      const ethDate = toEthDate(date);
      if (param === 'startDate') {
        await PotNFTTicket.updateMintStartDate(tokenId, ethDate);
      } else if (param === 'endDate') {
        await PotNFTTicket.updateMintEndDate(tokenId, ethDate);
      }else if (param === 'wlStartDate') {
        await PotNFTTicket.updateWlMintStartDate(tokenId, ethDate);
      }else if (param === 'wlEndDate') {
        await PotNFTTicket.updateWlMintEndDate(tokenId, ethDate);
      } else {
        throw new Error(`unexpected param - ${param}`);
      }
      console.log(`${param} updated to ${date.toISOString()}`);
    }
    // const startDate = new Date(taskArgs.startDate);
    // if (startDate.toString() === 'Invalid Date') {
    //   console.log('invalid date');
    //   return;
    // }
    // const ethStartDate = toEthDate(startDate);
    // const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    // await PotNFTTicket.updateMintStartDate(tokenId, ethStartDate);
  });

task("updateNFTTicketWL")
  .addParam("tokenId", "tokenId to update the whitelist for")
  .addParam("wls", "object of acccount/wlSpot pairs ex: {account1: 2, account2: 1}", {}, types.json)
  .addOptionalParam("controller", "address of the controller of the ticket")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const [owner, account1, account2, account3, account4 ] = await ethers.getSigners();
    const wls: {[account: string] : number} = taskArgs.wls;
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    if (Object.keys(wls).length === 0) {
      wls[owner.address] = 1;
      wls[account1.address] = 2;
      wls[account2.address] = 3;
      wls[account3.address] = 4;
    }
    const accounts = [];
    const wlSpots = [];
    for (const [account, wlSpot] of Object.entries(wls)) {
      accounts.push(ethers.utils.getAddress(account));
      assert.equal(Math.floor(wlSpot), wlSpot, "wlSpot must be an integer");
      assert.equal(wlSpot >= 0, true, "wlSpot must not be negative");
      wlSpots.push(wlSpot);
    }
    assert.equal(accounts.length > 0, true, "some wls must be specified");
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updateWL(tokenId, accounts, wlSpots);
  })

task("unpausePot", "unpause minting for paper Pot")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const PaperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(PaperPotDeployment.address, owner);
    await paperPot.unpauseMinting();
  })

task("pausePot", "pause minting for paper Pot")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const PaperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(PaperPotDeployment.address, owner);
    await paperPot.pauseMinting();
  })

task("setNftTicketInfo", "set the address and tokenId for the NFTTicket")
  .addParam("tokenId", "tokenId to change paused state for")
  .addParam("address", "address of the NFTTicket contract")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const address: string = taskArgs.address;
    const [owner] = await ethers.getSigners();
    const PaperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(PaperPotDeployment.address, owner);
    await paperPot.setNftTicketInfo(tokenId, address);
  })

task(
  "getOrphanageRegistered",
  "list of registered accounts who have signed up for the adoption program"
).setAction(async (taskArgs, env) => {
  const { ethers, deployments } = env;
  const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
  const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
    orphanageDeploymentV2.address,
    ethers.provider
  );
  const registeredAccounts = await SeedOrphanageV2.getRegister();
  console.log(JSON.stringify(registeredAccounts.map((r) => r.toLowerCase())));
});

task(
  "getOrphanageSeeds",
  "list of seeds up for adoption in the orphanage"
).setAction(async (taskArgs, env) => {
  const { ethers, deployments } = env;
  const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
  const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
    orphanageDeploymentV2.address,
    ethers.provider
  );
  const registeredAccounts = await SeedOrphanageV2.getSeeds();
  console.log(JSON.stringify(registeredAccounts.map((bn) => bn.toNumber())));
});

task("supplyOrphanage", "send seeds to be adopted")
  .addParam("ids", "array of tokenIds to fund contract with", [], types.json)
  .setAction(async (taskArgs, env) => {
    function setTimeoutAsync(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const { ethers, deployments } = env;
    const { ids } = taskArgs;
    if (!ids) {
      console.log("ids is a required param");
      return;
    }
    const [signer] = await ethers.getSigners();
    const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
    const seedDeployment = await deployments.get("PaperSeed");
    const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
      orphanageDeploymentV2.address,
      signer
    );
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    // Check that all of the tokenIds are owned
    let ownershipCheckFailed = false;
    for (const tokenId of ids) {
      const owner = await PaperSeed.ownerOf(tokenId);
      if (owner !== signer.address) {
        console.log(
          `tokenId ${tokenId} is owner by ${owner}, not ${signer.address}`
        );
        ownershipCheckFailed = true;
      }
    }
    if (ownershipCheckFailed) {
      console.log("FAILURE: seeds were not delivered");
      return;
    }
    const isApproved = await PaperSeed.isApprovedForAll(
      signer.address,
      SeedOrphanageV2.address
    );
    if (!isApproved) {
      // if not approved - then approve the orphanage for transferring the seeds
      await PaperSeed.setApprovalForAll(SeedOrphanageV2.address, true);
    }
    // Loop through the tokenIds and send them.
    for (const tokenId of ids) {
      console.log(`adding seed with tokenId ${tokenId}`);
      const tx = await SeedOrphanageV2.addSeed(tokenId);
      console.log(tx.hash);
      await setTimeoutAsync(1000);
    }
    await env.run("getOrphanageSeeds");
  });

task("emptyOrphanage", "reclaim seeds from orphanage")
  .addParam("id")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id } = taskArgs;
    if (!id) {
      console.log("id is a required param");
      return;
    }
    const [signer] = await ethers.getSigners();
    const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
    const seedDeployment = await deployments.get("PaperSeed");
    const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
      orphanageDeploymentV2.address,
      signer
    );
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    // Ensure that the seed is owned by the orphanage
    const ownerOfSeed = await PaperSeed.ownerOf(id);
    if (ownerOfSeed !== SeedOrphanageV2.address) {
      console.log(
        `tokenId ${id} not in orphanage address: ${SeedOrphanageV2.address}`
      );
      return;
    }
    const tx = await SeedOrphanageV2.removeSeed(id);
    console.log(tx.hash);
    await env.run("getOrphanageSeeds");
  });

task("deliverSeeds", "send seeds to adoptive gardeners")
  .addParam("id", "tokenId of the seed", undefined, types.int)
  .addParam("receiver", "address of the receiver", "", types.string)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id: tokenId, receiver } = taskArgs;
    if (!tokenId) {
      console.log("id is a required param");
      return;
    }
    if (!receiver) {
      console.log("receiver is a required param");
      return;
    }
    // validate the receiver address
    if (!ethers.utils.isAddress(receiver)) {
      console.log("receiver address is not valid");
      return;
    }
    const [signer] = await ethers.getSigners();
    const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
    const seedDeployment = await deployments.get("PaperSeed");
    const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
      orphanageDeploymentV2.address,
      signer
    );
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    // validate that this tokenId is owned by the orphanage
    const ownerOf = await PaperSeed.ownerOf(tokenId);
    if (ownerOf !== SeedOrphanageV2.address) {
      console.log(`tokenId ${tokenId} is not owned by the orphanage contract`);
      return;
    }
    // validate that the receiver is a seed holder
    const seedCount = await PaperSeed.balanceOf(receiver);
    if (seedCount.eq(0)) {
      console.log(`account ${receiver} has no seeds, and is thus ineligible`);
      return;
    }
    // final confirmation
    const conf = await promptly.confirm(
      `You are about to deliver seed with tokenId ${tokenId} to ${receiver}. Continue? (y/n)`
    );
    if (!conf) {
      return;
    }
    console.log("sending seed");
    const tx = await SeedOrphanageV2.deliver(tokenId, receiver);
    console.log(`seed with tokenId ${tokenId} delivered in tx ${tx.hash}`);
    console.log(`remaining seeds`);
    await env.run("getOrphanageSeeds");
  });

task("mintUnclaimed", "seedContract owner mints the unclaimed seeds")
  .addParam(
    "unclaimedFile",
    "json file with unclaimed tokenIds",
    null,
    types.string
  )
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { unclaimedFile } = taskArgs;
    if (!unclaimedFile) {
      console.log("unclaimedFile is a required param");
      return;
    }
    function setTimeoutAsync(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const unclaimed = JSON.parse(readFileSync(unclaimedFile, "utf-8"));
    const [signer] = await ethers.getSigners();
    console.log(signer.address);
    const seedDeployment = await deployments.get("PaperSeed");
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    for (const tokenId of unclaimed) {
      console.log(`claiming token ${tokenId}`);
      try {
        const tx = await PaperSeed.claimReserve(tokenId);
      } catch (e) {
        console.log(e.message);
        if (e.message === "transaction underpriced") {
          await setTimeoutAsync(10000);
          const tx = await PaperSeed.claimReserve(tokenId);
        } else {
          throw e;
        }
      }
      await setTimeoutAsync(2000);
    }
  });

task("distribMatic", "distribute MATIC")
  .addOptionalParam("amount", "number of MATIC to distribute", 1.0, types.float)
  .addOptionalParam(
    "count",
    "number of accounts to distribute MATIC to",
    6,
    types.int
  )
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { amount, count } = taskArgs;
    const [account0, ...signers] = await ethers.getSigners();
    const masterBalance = await account0.getBalance();
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterBalance
      )} MATIC`
    );
    const ethPerAccount = ethers.utils.parseUnits(amount.toString());
    const ethRequired = ethPerAccount.mul(count);
    console.log(
      `about to distribute ${amount} MATIC to ${count} accounts for a total of ${ethers.utils.formatEther(
        ethRequired
      )} MATIC`
    );
    if (masterBalance.lt(ethRequired)) {
      throw new Error("insufficient balance");
    }
    for (let i = 0; i < count; i++) {
      const account = signers[i];
      console.log(
        `sending ${ethers.utils.formatEther(ethPerAccount)} MATIC to ${
          account.address
        }`
      );
      await account0.sendTransaction({
        to: account.address,
        value: ethPerAccount,
      });
    }
    const account0Balance = await account0.getBalance();
    console.log("final MATIC balances:");
    console.log(
      `${account0.address}: ${ethers.utils.formatEther(account0Balance)}`
    );
    for (let i = 0; i < count; i++) {
      const account = signers[i];
      const accountBalance = await account.getBalance();
      console.log(
        `${account.address}: ${ethers.utils.formatEther(accountBalance)}`
      );
    }
  });

task("distribTestToken", "distribute sUSDC and sMATIC")
  .addOptionalParam(
    "amount",
    "number of tokens to distribute",
    1000,
    types.float
  )
  .addOptionalParam(
    "count",
    "number of accounts to distribute MATIC to",
    6,
    types.int
  )
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { amount, count } = taskArgs;
    const [account0, ...signers] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const smaticTokenDeployment = await deployments.get("SMATICToken");
    const shrubExchange = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );
    const smaticToken = await ethers.getContractAt(
      "SMATICToken",
      smaticTokenDeployment.address
    );
    let shrubExchangeConnect = ShrubExchange__factory.connect(
      shrubExchangeDeployment.address,
      account0
    );
    let susdConnect = SUSDToken__factory.connect(
      susdTokenDeployment.address,
      account0
    );
    let smaticConnect = SMATICToken__factory.connect(
      smaticTokenDeployment.address,
      account0
    );

    const masterBalance = await account0.getBalance();
    const masterSusdBalance = await susdConnect.balanceOf(account0.address);
    const masterSmaticBalance = await smaticConnect.balanceOf(account0.address);
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterBalance
      )} MATIC`
    );
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterSusdBalance
      )} sUSD`
    );
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterSmaticBalance
      )} sMATIC`
    );

    const ethPerAccount = ethers.utils.parseUnits(amount.toString());
    const ethRequired = ethPerAccount.mul(count);
    console.log(
      `about to distribute ${amount} sMATIC and sUSD to ${count} accounts for a total of ${ethers.utils.formatEther(
        ethRequired
      )} sMATIC and sUSD`
    );
    if (
      masterSmaticBalance.lt(ethRequired) ||
      masterSmaticBalance.lt(ethRequired)
    ) {
      throw new Error("insufficient balance");
    }
    for (let i = 0; i < count; i++) {
      const account = signers[i];
      shrubExchangeConnect = shrubExchangeConnect.connect(account0);
      susdConnect = susdConnect.connect(account0);
      smaticConnect = smaticConnect.connect(account0);

      // Transfer funds to other accounts
      console.log(
        `sending ${ethers.utils.formatEther(ethPerAccount)} sUSD to ${
          account.address
        }`
      );
      await susdConnect.transfer(account.address, ethPerAccount, {
        gasLimit: 100000,
      });
      console.log(
        `sending ${ethers.utils.formatEther(ethPerAccount)} sMATIC to ${
          account.address
        }`
      );
      await smaticConnect.transfer(account.address, ethPerAccount, {
        gasLimit: 100000,
      });

      // Approve for deposit into Shrub
      shrubExchangeConnect = shrubExchangeConnect.connect(account);
      susdConnect = susdConnect.connect(account);
      smaticConnect = smaticConnect.connect(account);
      console.log("checking if sUSD is approved for deposit into shrub");
      const susdAllowance = await susdConnect.allowance(
        account.address,
        shrubExchangeConnect.address
      );
      if (susdAllowance.lt(1000)) {
        console.log("approving sUSD for deposit into shrub");
        await susdConnect.approve(
          shrubExchangeConnect.address,
          ethers.BigNumber.from(1e6).mul(ethers.constants.WeiPerEther),
          { gasLimit: 100000 }
        );
      }
      console.log("checking if sMATIC is approved for deposit into shrub");
      const smaticAllowance = await smaticConnect.allowance(
        account.address,
        shrubExchangeConnect.address
      );
      if (smaticAllowance.lt(1000)) {
        console.log("approving sMATIC for deposit into shrub");
        await smaticConnect.approve(
          shrubExchangeConnect.address,
          ethers.BigNumber.from(1e6).mul(ethers.constants.WeiPerEther),
          { gasLimit: 100000 }
        );
      }

      // Deposit into Shrub
      console.log(
        `depoisting ${ethers.utils.formatEther(
          ethPerAccount
        )} sUSD into Shrub from ${account.address}`
      );
      await shrubExchangeConnect.deposit(susdConnect.address, ethPerAccount, {
        gasLimit: 100000,
      });
      console.log(
        `depoisting ${ethers.utils.formatEther(
          ethPerAccount
        )} sMATIC into Shrub from ${account.address}`
      );
      await shrubExchangeConnect.deposit(smaticConnect.address, ethPerAccount, {
        gasLimit: 100000,
      });

      const sUsdShrubBalance = await shrubExchangeConnect.getAvailableBalance(
        account.address,
        susdConnect.address
      );
      const sMaticShrubBalance = await shrubExchangeConnect.getAvailableBalance(
        account.address,
        smaticConnect.address
      );
      console.log(
        `Total Shrub Balances for ${
          account.address
        }: sUSD: ${ethers.utils.formatEther(
          sUsdShrubBalance
        )} sMATIC: ${ethers.utils.formatEther(sMaticShrubBalance)}`
      );
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
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const shrubExchange = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );

    // ensure that susdToken deploy is confirmed
    // await susdToken.deployTransaction.wait();
    await (
      await susdToken.approve(
        shrubExchange.address,
        ethers.BigNumber.from(100000).mul(weiInEth)
      )
    ).wait();
    await susdToken.transfer(
      account1.address,
      ethers.BigNumber.from(1000).mul(weiInEth)
    );
    const susdBalance0 = await susdToken.balanceOf(account0.address);
    const susdBalance1 = await susdToken.balanceOf(account1.address);

    // Deposit 10 MATIC and 500 SUSD in the shrubExchange
    // Ensure that shrubExchange is deployed
    // await shrubExchange.deployTransaction.wait();
    await shrubExchange.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchange.deposit(
      susdToken.address,
      ethers.BigNumber.from(85000).mul(weiInEth)
    );

    // Setup contracts for account1
    const susdTokenAcct1 = susdToken.connect(account1);
    const shrubExchangeAcct1 = shrubExchange.connect(account1);
    await (
      await susdTokenAcct1.approve(
        shrubExchange.address,
        ethers.BigNumber.from(10000).mul(weiInEth)
      )
    ).wait();
    await shrubExchangeAcct1.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchangeAcct1.deposit(
      susdToken.address,
      ethers.BigNumber.from(500).mul(weiInEth)
    );

    console.log(`ShrubContractAddress: ${shrubExchange.address}`);
    console.log(`SUSDContractAddress: ${susdToken.address}`);
  }
);

task("maker2", "creates limit orders")
  .addOptionalParam("count", "number of orders to generate", 100, types.int)
  .addOptionalParam(
    "baseIv",
    "the centered IV for the generator",
    125,
    types.float
  )
  .addOptionalParam(
    "ivRange",
    "maximum deviation from the baseIv",
    50,
    types.float
  )
  .addOptionalParam("ethPrice", "price of MATIC in USD", 1.5, types.float)
  .addOptionalParam(
    "riskFreeRate",
    "annual risk free rate of return (0.05 means 5%)",
    0.05,
    types.float
  )
  .setAction(async (taskArgs, env) => {
    console.log("running");
    const { ethers, deployments, web3 } = env;
    const [master, account0, account1, account2, account3, account4, account5] =
      await ethers.getSigners();
    const accounts = [
      account0,
      account1,
      account2,
      account3,
      account4,
      account5,
    ];

    const STRIKE_BASE_SHIFT = 1e6;
    const { count, baseIv, ivRange, ethPrice, riskFreeRate } = taskArgs;
    const WeiInEth = ethers.constants.WeiPerEther;
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const smaticTokenDeployment = await deployments.get("SMATICToken");
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );
    const smaticToken = await ethers.getContractAt(
      "SMATICToken",
      smaticTokenDeployment.address
    );
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const shrubExchangeDeployed = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    let shrubContractAccount = ShrubExchange__factory.connect(
      shrubExchangeDeployed.address,
      account0
    );
    const shrubInterface = new Shrub712(17, shrubExchangeDeployment.address);
    const priceFeedMatic = new ethers.Contract(
      CHAINLINK_MATIC,
      chainlinkAggregatorV3Interface,
      account0
    );
    const client = new ApolloClient({
      link: new HttpLink({
        uri: "https://api.thegraph.com/subgraphs/name/jguthrie7/shrub",
        fetch,
      }),
      cache: new InMemoryCache(),
    });

    function generateRandomOrder(
      expiry: number,
      strikeUsdcMillion: number,
      optionType: string,
      maticPrice: number,
      isBuy: boolean
    ) {
      const strikeUsdc = strikeUsdcMillion / STRIKE_BASE_SHIFT;
      const timeToExpiry =
        (expiry * 1000 - Date.now()) / (365 * 24 * 60 * 60 * 1000);
      const volatility =
        ((isBuy ? -1 : 1) * Math.random() * ivRange + baseIv) / 100;
      // console.log(`
      //   MATIC price: ${maticPrice}
      //   strike: ${strikeUsdc}
      //   time to expiry (years): ${timeToExpiry}
      //   volatility: ${volatility}
      //   risk free rate: ${riskFreeRate}
      // `)
      const strike = ethers.BigNumber.from(strikeUsdcMillion);
      const sizeEth = Math.floor(Math.random() * 5) + 1;
      const size = ethers.BigNumber.from(sizeEth).mul(WeiInEth);
      const pricePerContractUsdc =
        Math.round(
          10000 *
          bs.blackScholes(
            maticPrice,
            strikeUsdc,
            timeToExpiry,
            volatility,
            riskFreeRate,
            optionType.toLowerCase()
          )
        ) / 10000;
      if (timeToExpiry < 0 || pricePerContractUsdc < 0.0002) {
        return null;
      }
      const price = ethers.BigNumber.from(
        Math.round(pricePerContractUsdc * 10000)
      )
        .mul(WeiInEth.div(ethers.BigNumber.from(10000)))
        .mul(size)
        .div(WeiInEth);
      const fee = ethers.BigNumber.from(Math.floor(Math.random() * 100));
      const smallOrder: SmallOrder = {
        size,
        isBuy,
        nonce: 0,
        price,
        fee,
        offerExpire:
          Math.floor((new Date().getTime() + 60 * 1000 * 60 * 3.5) / 1000) +
          Math.floor(Math.random() * 60 * 60), // 3.5 - 4.5 hours from now
      };
      const common: OrderCommon = {
        baseAsset: susdToken.address,
        quoteAsset: smaticToken.address,
        expiry,
        strike,
        optionType: optionType === "CALL" ? 1 : 0,
      };
      return { smallOrder, common };
    }

    const maticPriceBig = await priceFeedMatic.latestRoundData();
    const maticPrice = Number(
      ethers.utils.formatUnits(maticPriceBig.answer, 8)
    );
    const orderTypeHash = await shrubContractAccount.ORDER_TYPEHASH();

    return new Promise((resolve, reject) => {
      setInterval(() => {
        return main()
          .then((count) =>
            console.log(
              `${new Date().toLocaleString()} - ${count} orders added`
            )
          )
          .catch(reject);
      }, MINUTES_BETWEEN_ORDERS * 60 * 1000);

      async function main() {
        let count = 0;
        for (const account of accounts) {
          shrubContractAccount = shrubContractAccount.connect(account);
          let queryResults;
          try {
            queryResults = await client.query({
              query: ACTIVE_ORDERS_QUERY,
              variables: {
                id: account.address.toLowerCase(),
                now: Math.floor(Date.now() / 1000),
              },
            });
          } catch (e) {
            console.log(e);
            if (e && e.statusCode) {
              console.log(`Subgraph issue: response ${e.statusCode}`);
            }
            console.log("stopping this iteration");
            break;
          }
          const activeOptions =
            queryResults && queryResults.data && queryResults.data.options;
          const activeOptionsWithOrders = activeOptions.filter(
            (o) => o.buyOrders.length || o.sellOrders.length
          );
          for (const expiryDate of expiryDates) {
            for (const optionType of ["CALL", "PUT"]) {
              const strikes = optionType === "CALL" ? callsArr : putsArr;
              for (const strike of strikes) {
                for (const isBuy of [true, false]) {
                  // Look for matching existing order
                  const alreadyAnOrder = Boolean(
                    activeOptionsWithOrders.find((o) => {
                      return (
                        o.expiry === expiryDate.getTime() / 1000 &&
                        o.optionType === optionType &&
                        Number(o.strike) ===
                        Number(ethers.utils.formatUnits(strike, 6)) &&
                        (isBuy
                          ? Boolean(o.buyOrders[0])
                          : Boolean(o.sellOrders[0]))
                      );
                    })
                  );
                  if (alreadyAnOrder) {
                    continue;
                  }
                  console.log(
                    new Date().toLocaleString(),
                    account.address,
                    expiryDate.toLocaleString(),
                    optionType,
                    ethers.utils.formatUnits(strike, 6),
                    isBuy,
                    alreadyAnOrder ? " - Skipping" : ""
                  );
                  const randomOrder = generateRandomOrder(
                    expiryDate.getTime() / 1000,
                    strike,
                    optionType,
                    maticPrice,
                    isBuy
                  );
                  if (!randomOrder) {
                    console.log("skipping because no order");
                    continue;
                  }
                  const { smallOrder, common } = randomOrder;
                  if (!smallOrder || !common) {
                    console.log("skipping because no smallOrder or common");
                    continue;
                  }
                  try {
                    const nonce = await shrubContractAccount[
                      "getCurrentNonce(address,(address,address,uint256,uint256,uint8))"
                      ](account.address, common);
                    //  Overwrite nonce
                    smallOrder.nonce = nonce.toNumber() + 1;
                    const signedSellOrder =
                      await shrubInterface.signOrderWithWeb3(
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
                    await shrubContractAccount.announce(
                      smallOrder,
                      common,
                      signedSellOrder.sig,
                      { gasLimit: 50000 }
                    );
                  } catch (e) {
                    console.log(e);
                    continue;
                  }
                  count++;
                }
              }
            }
          }
        }
        return count;
      }
    });
  });

task("cancel", "cancel all orders for an account").setAction(
  async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [account0, account1] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const shrubExchangeDeployed = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const shrubContractAccount = ShrubExchange__factory.connect(
      shrubExchangeDeployed.address,
      account0
    );
    const hashUtilDeployment = await deployments.get("HashUtil");
    const hashUtilDeployed = await ethers.getContractAt(
      "HashUtil",
      hashUtilDeployment.address
    );
    const hashUtil = HashUtil__factory.connect(
      hashUtilDeployed.address,
      account0
    );
    const client = new ApolloClient({
      link: new HttpLink({
        uri: "https://api.thegraph.com/subgraphs/name/jguthrie7/shrub",
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    // Query to see current state of things
    console.log(account0.address);
    const queryResults = await client.query({
      query: ACTIVE_ORDERS_QUERY,
      variables: {
        id: account0.address.toLowerCase(),
        now: Math.floor(Date.now() / 1000),
      },
    });
    const activeOptions =
      queryResults && queryResults.data && queryResults.data.options;
    for (const activeOption of activeOptions) {
      const {
        expiry,
        optionType,
        strike,
        baseAsset,
        quoteAsset,
        buyOrders,
        sellOrders,
      } = activeOption;
      if (buyOrders && buyOrders[0]) {
        console.log(
          `cancelling order for buy ${new Date(
            expiry * 1000
          ).toLocaleString()} ${optionType} ${strike}`
        );
        const { nonce, size, price, offerExpire, fee } = buyOrders[0];
        try {
          // const filter = await shrubContractAccount.queryFilter()
          const order = {
            size: ethers.utils.parseUnits(size),
            isBuy: true,
            nonce: nonce,
            price: ethers.utils.parseUnits(price),
            offerExpire: offerExpire,
            fee: ethers.utils.parseUnits(fee),
            baseAsset: baseAsset.id,
            quoteAsset: quoteAsset.id,
            expiry: expiry,
            strike: ethers.utils.parseUnits(strike, 6),
            optionType: optionType === "CALL" ? 1 : 0,
          };
          // console.log(order);
          // const positionHash = await hashUtil.hashOrderCommon(order)
          // console.log(positionHash);
          const cancel = await shrubContractAccount.cancel(order);
          console.log(cancel);
        } catch (e) {
          console.log("cancel failed");
          console.log(e);
        }
      }
      if (sellOrders && sellOrders[0]) {
        console.log(
          `cancelling order for sell ${new Date(
            expiry * 1000
          ).toLocaleString()} ${optionType} ${strike}`
        );
        const { nonce, size, price, offerExpire, fee } = sellOrders[0];
        try {
          // const filter = await shrubContractAccount.queryFilter()
          const order = {
            size: ethers.utils.parseUnits(size),
            isBuy: false,
            nonce: nonce,
            price: ethers.utils.parseUnits(price),
            offerExpire: offerExpire,
            fee: ethers.utils.parseUnits(fee),
            baseAsset: baseAsset.id,
            quoteAsset: quoteAsset.id,
            expiry: expiry,
            strike: ethers.utils.parseUnits(strike, 6),
            optionType: optionType === "CALL" ? 1 : 0,
          };
          // console.log(order);
          // const positionHash = await hashUtil.hashOrderCommon(order)
          // console.log(positionHash);
          const cancel = await shrubContractAccount.cancel(order);
          console.log(cancel);
        } catch (e) {
          console.log("cancel failed");
          console.log(e);
        }
      }
    }

    // Loop through expiries
    // Loop through Call/Put
    // Loop through strikes
    // Loop through Buy/Sell
  }
);

task("maker", "creates limit orders")
  .addOptionalParam("count", "number of orders to generate", 100, types.int)
  .addOptionalParam(
    "baseIv",
    "the centered IV for the generator",
    125,
    types.float
  )
  .addOptionalParam(
    "ivRange",
    "maximum deviation from the baseIv",
    50,
    types.float
  )
  .addOptionalParam("ethPrice", "price of MATIC in USD", 1.5, types.float)
  .addOptionalParam(
    "riskFreeRate",
    "annual risk free rate of return (0.05 means 5%)",
    0.05,
    types.float
  )
  .setAction(async (taskArgs, env) => {
    console.log(taskArgs);
    const STRIKE_BASE_SHIFT = 1e6;
    const { count, baseIv, ivRange, ethPrice, riskFreeRate } = taskArgs;
    const { ethers, deployments, web3 } = env;
    const WeiInEth = ethers.constants.WeiPerEther;
    const [account0, account1] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const smaticTokenDeployment = await deployments.get("SMATICToken");
    const shrubExchangeDeployed = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );
    const smaticToken = await ethers.getContractAt(
      "SMATICToken",
      smaticTokenDeployment.address
    );
    const shrubInterface = new Shrub712(17, shrubExchangeDeployment.address);

    function getRandomArrayElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomContract() {
      // const contractNumber = Math.floor(Math.random() * optionContracts.length);
      // return optionContracts[contractNumber];
      const optionType = Math.random() > 0.5 ? "CALL" : "PUT";
      const expiry = Number(getRandomArrayElement(expiryDates)) / 1000;
      const strike =
        optionType === "CALL"
          ? getRandomArrayElement(callsArr)
          : getRandomArrayElement(putsArr);
      return { optionType, expiry, strike };
    }

    function generateRandomOrder() {
      const {
        expiry,
        strike: strikeUsdcMillion,
        optionType,
      } = getRandomContract();
      const strikeUsdc = strikeUsdcMillion / STRIKE_BASE_SHIFT;
      const timeToExpiry =
        (expiry * 1000 - Date.now()) / (365 * 24 * 60 * 60 * 1000);
      const isBuy = Math.random() * 100 > 50;
      const volatility =
        ((isBuy ? -1 : 1) * Math.random() * ivRange + baseIv) / 100;
      console.log(`
          MATIC price: ${ethPrice}
          strike: ${strikeUsdc}
          time to expiry (years): ${timeToExpiry}
          volatility: ${volatility}
          risk free rate: ${riskFreeRate}
        `);
      const strike = ethers.BigNumber.from(strikeUsdcMillion);
      const sizeEth = Math.floor(Math.random() * 5) + 1;
      const size = ethers.BigNumber.from(sizeEth).mul(WeiInEth);
      const pricePerContractUsdc =
        Math.round(
          10000 *
          bs.blackScholes(
            ethPrice,
            strikeUsdc,
            timeToExpiry,
            volatility,
            riskFreeRate,
            optionType.toLowerCase()
          )
        ) / 10000;
      if (timeToExpiry < 0) {
        return null;
      }
      const price = ethers.BigNumber.from(
        Math.round(pricePerContractUsdc * 10000)
      )
        .mul(WeiInEth.div(ethers.BigNumber.from(10000)))
        .mul(size)
        .div(WeiInEth);
      const fee = ethers.BigNumber.from(Math.floor(Math.random() * 100));
      const smallOrder: SmallOrder = {
        size,
        isBuy,
        nonce: 0,
        price,
        fee,
        offerExpire: Math.floor(
          (new Date().getTime() + 60 * 1000 * 60 * 24) / 1000
        ),
      };
      const common: OrderCommon = {
        baseAsset: susdToken.address,
        quoteAsset: smaticToken.address,
        expiry,
        strike,
        optionType: optionType === "CALL" ? 1 : 0,
      };
      return { smallOrder, common };
    }

    const account = account0;
    const shrubContractAccount = ShrubExchange__factory.connect(
      shrubExchangeDeployed.address,
      account
    );
    const orderTypeHash = await shrubContractAccount.ORDER_TYPEHASH();

    for (let i = 0; i < count; i++) {
      const randomOrder = generateRandomOrder();
      if (!randomOrder) {
        continue;
      }
      const { smallOrder, common } = randomOrder;
      if (!smallOrder || !common) {
        continue;
      }
      const nonce = await shrubContractAccount[
        "getCurrentNonce(address,(address,address,uint256,uint256,uint8))"
        ](account.address, common);
      //  Overwrite nonce
      smallOrder.nonce = nonce.toNumber() + 1;
      console.log(orderTypeHash, smallOrder, account.address, common);
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
      await shrubContractAccount.announce(
        smallOrder,
        common,
        signedSellOrder.sig,
        { gasLimit: 50000 }
      );
    }
  });

task("faucet", "initializes faucet with SUSD and SMATIC")
  .addOptionalParam(
    "susdAmount",
    "amount of SUSD to add to faucet",
    1e7,
    types.int
  )
  .addOptionalParam(
    "smaticAmount",
    "amount of SMATIC to add to faucet",
    1e7,
    types.int
  )
  .addOptionalParam(
    "susdRate",
    "how many SUSD to sell/buy for 1 MATIC",
    10000,
    types.int
  )
  .addOptionalParam(
    "smaticRate",
    "how many SMATIC to sell/buy for 1 MATIC",
    10000,
    types.int
  )
  .setAction(async (taskArgs, env) => {
    const { susdAmount, smaticAmount, susdRate, smaticRate } = taskArgs;
    const { ethers, deployments } = env;

    const [account0] = await ethers.provider.listAccounts();

    const sUSDDeployment = await deployments.get("SUSDToken");
    const sMATICDeployment = await deployments.get("SMATICToken");
    const tfDeployment = await deployments.get("TokenFaucet");

    const sUsd = await ethers.getContractAt(
      "SUSDToken",
      sUSDDeployment.address
    );
    const sMatic = await ethers.getContractAt(
      "SMATICToken",
      sMATICDeployment.address
    );
    const faucet = await ethers.getContractAt(
      "TokenFaucet",
      tfDeployment.address
    );

    await sMatic.approve(account0, faucet.address);
    await sUsd.approve(account0, faucet.address);
    await faucet.addToken(sMatic.address, smaticRate);
    await faucet.addToken(sUsd.address, susdRate);
    await sMatic.transfer(
      faucet.address,
      ethers.constants.WeiPerEther.mul(smaticAmount)
    );
    await sUsd.transfer(
      faucet.address,
      ethers.constants.WeiPerEther.mul(susdAmount)
    );
  });
