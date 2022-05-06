import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  ERC20, ERC20Token, ERC20Token__factory,
  PaperPot,
  PaperPot__factory,
  PaperPotMetadata,
  PaperPotMetadata__factory,
  PaperSeed,
  PaperSeed__factory,
} from '../types'
import { describe } from 'mocha'
import { sign } from 'crypto'
import { BigNumber } from 'ethers';
import { string } from 'hardhat/internal/core/params/argumentTypes'
// import { BigNumber } from 'ethers/lib/ethers'

// const { BigNumber } = ethers;
const { Zero, One } = ethers.constants;
const BYTES_ZERO = ethers.utils.toUtf8Bytes('');

function toEthDate(date: Date) {
  return Math.round(Number(date) / 1000);
}

describe("PaperPot", () => {
  let now: Date;
  let ethNow: number;
  let owner: SignerWithAddress;
  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;
  let signer3: SignerWithAddress;
  let signer4: SignerWithAddress;
  let signer1PaperSeed: PaperSeed;
  let signer2PaperSeed: PaperSeed;
  let signer1PaperPot: PaperPot;
  let signer2PaperPot: PaperPot;
  let signer3PaperPot: PaperPot;
  let signer4PaperPot: PaperPot;
  let weth: ERC20Token;
  let paperSeed: PaperSeed;
  let paperPot: PaperPot;
  let paperPotMetadata: PaperPotMetadata;
  const SAD_SEEDS = [11, 13, 15, 17, 19];
  const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";
  const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
  const RESOURCE_URIS = [
    'http://test.xyz/1',
    'http://test.xyz/2',
    'http://test.xyz/3'
  ];
  const SHRUB_DEFAULT_URIS = [
    'http://test.xyz/wonder',
    'http://test.xyz/passion',
    'http://test.xyz/hope',
    'http://test.xyz/power'
  ];

  beforeEach(async () => {
    now = new Date();
    const signers = await ethers.getSigners();
    owner = signers[0];
    signer1 = signers[1];
    signer2 = signers[2];
    signer3 = signers[3];
    signer4 = signers[4];
    const maxIndex = 10000;
    const merkleRoot =
      "0x618ddd3b36d40f8d9b942cf72c5e92615e6594b3e8b537082310ae48e51cd059";
    const baseUri = "https://shrub.finance/";
    const PaperSeed = await ethers.getContractFactory("PaperSeed") as PaperSeed__factory;
    paperSeed = await PaperSeed.deploy(maxIndex, merkleRoot, baseUri);
    await paperSeed.deployed();
    await paperSeed.claimReserve(1);
    await paperSeed.claimReserve(2);
    await paperSeed.claimReserve(3);
    await paperSeed.claimReserve(4);
    const imageBaseUri = "ipfs://abcdefg/";
    const PaperPotMetadata = await ethers.getContractFactory("PaperPotMetadata") as PaperPotMetadata__factory;
    paperPotMetadata = await PaperPotMetadata.deploy(imageBaseUri);
    const PaperPot = await ethers.getContractFactory("PaperPot") as PaperPot__factory;
    paperPot = await PaperPot.deploy(
      [paperSeed.address],
      SAD_SEEDS,
      RESOURCE_URIS,
      SHRUB_DEFAULT_URIS,
      paperPotMetadata.address
    );
    const WETH = await ethers.getContractFactory("ERC20Token") as ERC20Token__factory;
    weth = await WETH.deploy(
      "Wrapped Ether",
      "WETH",
      ethers.constants.WeiPerEther.mul(100)
    );

    ethNow = (await ethers.provider.getBlock('latest')).timestamp;
    signer1PaperSeed = paperSeed.connect(signer1);
    signer2PaperSeed = paperSeed.connect(signer2);
    signer1PaperPot = paperPot.connect(signer1);
    signer2PaperPot = paperPot.connect(signer2);
    signer3PaperPot = paperPot.connect(signer3);
    signer4PaperPot = paperPot.connect(signer4);
  });

  // Tests
  // Deploy Contract
  // Add Seed Contract Address
  // Remove Seed Contract Address
  // Admin Mint Pot
  // Admin Mint Water
  // Admin Mint Fertilizer

  // Plant
  // Plant and make happy
  // Eligible for watering
  // Water
  // Water with fertilizer
  // get water from faucet
  // harvest
  // metadata generator

  describe("Deploy Contract", async () => {
    it("should deploy", async () => {});
  });

  describe("Seed Contract Addresses", async () => {
    let baseERC721;
    beforeEach(async () => {
      const BaseERC721 = await ethers.getContractFactory("BaseERC721");
      baseERC721 = await BaseERC721.deploy("Test ERC721", "TST");
    });
    async function baselineCheck() {
      const seedContractAddresses0 = await paperPot.SEED_CONTRACT_ADDRESSES(0);
      await expect(paperPot.SEED_CONTRACT_ADDRESSES(1)).to.be.revertedWith("");
      expect(seedContractAddresses0).to.equal(paperSeed.address);
    }
    it("should have the seed contract from the constructor", async () => {
      await baselineCheck();
    });
    describe("add", async () => {
      it("should not allow non-owner to add seed contract address", async () => {
        await expect(
          signer1PaperPot.addSeedContractAddress(ADDRESS_ONE)
        ).to.be.revertedWith("Ownable: caller is not the owner");
        await baselineCheck();
      });
      it("should not allow owner to add same seed contract address", async () => {
        await expect(
          paperPot.addSeedContractAddress(paperSeed.address)
        ).to.be.revertedWith("address already on seedContractAddresses");
        await baselineCheck();
      });
      it("should not allow owner to add seed contract address for a non ERC721 address", async () => {
        await expect(
          paperPot.addSeedContractAddress(ADDRESS_ONE)
        ).to.be.revertedWith("not a valid ERC-721 implementation");
        await baselineCheck();
      });
      it("should allow owner to add seed contract address", async () => {
        await paperPot.addSeedContractAddress(baseERC721.address);
        const seedContractAddresses0 = await paperPot.SEED_CONTRACT_ADDRESSES(
          0
        );
        const seedContractAddresses1 = await paperPot.SEED_CONTRACT_ADDRESSES(
          1
        );
        await expect(paperPot.SEED_CONTRACT_ADDRESSES(2)).to.be.revertedWith(
          ""
        );
        expect(seedContractAddresses0).to.equal(paperSeed.address);
        expect(seedContractAddresses1).to.equal(baseERC721.address);
      });
    });
    describe("remove", async () => {
      it("should not allow non-owner to remove seed contract address", async () => {
        await expect(
          signer1PaperPot.removeSeedContractAddress(paperSeed.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
        await baselineCheck();
      });
      it("should not allow owner to remove seed contract address when address is not on list", async () => {
        await expect(
          paperPot.removeSeedContractAddress(ADDRESS_ONE)
        ).to.be.revertedWith("address not on seedContractAddresses");
        await baselineCheck();
      });
      it("should allow owner to remove seed contract address", async () => {
        await paperPot.removeSeedContractAddress(paperSeed.address);
        await expect(paperPot.SEED_CONTRACT_ADDRESSES(0)).to.be.revertedWith(
          ""
        );
      });
    });
    describe("both", async () => {
      it("should allow owner to add then remove seed contract address", async () => {
        await paperPot.addSeedContractAddress(baseERC721.address);
        const seedContractAddresses1 = await paperPot.SEED_CONTRACT_ADDRESSES(
          1
        );
        expect(seedContractAddresses1).to.equal(baseERC721.address);
        await paperPot.removeSeedContractAddress(baseERC721.address);
        await baselineCheck();
      });
    });
  });

  describe("admin minting", async () => {
    describe("adminMintPot", async () => {
      it("should not allow non-admin to mint pot", async () => {
        await expect(
          signer1PaperPot.adminMintPot(signer1.address, 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("should allow admin to mint pot to self", async () => {
        const before = await paperPot.balanceOf(owner.address, 1);
        await paperPot.adminMintPot(owner.address, 3);
        const after = await paperPot.balanceOf(owner.address, 1);
        expect(before).to.equal(BigNumber.from(0));
        expect(after).to.equal(BigNumber.from(3));
      });
      it("should allow admin to mint pot to arbitrary address", async () => {
        const before = await paperPot.balanceOf(signer1.address, 1);
        await paperPot.adminMintPot(signer1.address, 2);
        const after = await paperPot.balanceOf(signer1.address, 1);
        expect(before).to.equal(BigNumber.from(0));
        expect(after).to.equal(BigNumber.from(2));
      });
    });
    describe("adminDistributeWater", async () => {
      it("should not allow non-admin to mint water", async () => {
        await expect(
          signer1PaperPot.adminDistributeWater(signer1.address, 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("should allow admin to mint water to self", async () => {
        const before = await paperPot.balanceOf(owner.address, 3);
        await paperPot.adminDistributeWater(owner.address, 10);
        const after = await paperPot.balanceOf(owner.address, 3);
        expect(before).to.equal(BigNumber.from(0));
        expect(after).to.equal(BigNumber.from(10));
      });
      it("should allow admin to mint water to arbitrary address", async () => {
        const before = await paperPot.balanceOf(signer2.address, 3);
        await paperPot.adminDistributeWater(signer2.address, 20);
        const after = await paperPot.balanceOf(signer2.address, 3);
        expect(before).to.equal(BigNumber.from(0));
        expect(after).to.equal(BigNumber.from(20));
      });
    });
    describe("adminDistributeFertilizer", async () => {
      it("should not allow non-admin to mint fertilizer", async () => {
        await expect(
          signer1PaperPot.adminDistributeFertilizer(signer1.address, 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("should allow admin to mint fertilizer to self", async () => {
        const before = await paperPot.balanceOf(owner.address, 2);
        await paperPot.adminDistributeFertilizer(owner.address, 11);
        const after = await paperPot.balanceOf(owner.address, 2);
        expect(before).to.equal(BigNumber.from(0));
        expect(after).to.equal(BigNumber.from(11));
      });
      it("should allow admin to mint fertilizer to arbitrary address", async () => {
        const before = await paperPot.balanceOf(signer3.address, 2);
        await paperPot.adminDistributeFertilizer(signer3.address, 12);
        const after = await paperPot.balanceOf(signer3.address, 2);
        expect(before).to.equal(BigNumber.from(0));
        expect(after).to.equal(BigNumber.from(12));
      });
    });
  });

  describe("planting", async () => {
    beforeEach(async () => {
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
    });
    describe("plant", async () => {
      it("should not allow with invalid seedContractAddress", async () => {
        await expect(signer1PaperPot.plant(ADDRESS_ONE, 3)).to.be.revertedWith(
          "Invalid seedContractAddress"
        );
      });
      it("should not allow with invalid seedContractAddress (after removal from valid)", async () => {
        await paperPot.removeSeedContractAddress(paperSeed.address);
        await expect(
          signer1PaperPot.plant(paperSeed.address, 3)
        ).to.be.revertedWith("Invalid seedContractAddress");
      });
      it("should not allow if user has no pots", async () => {
        const potCount = await paperPot.balanceOf(signer1.address, 1);
        expect(potCount).to.equal(Zero);
        await expect(
          signer1PaperPot.plant(paperSeed.address, 3)
        ).to.be.revertedWith("Must own a pot token to plant");
      });
      it("should not allow if seed does not exist", async () => {
        await paperPot.adminMintPot(signer1.address, 1);
        const potCount = await paperPot.balanceOf(signer1.address, 1);
        expect(potCount).to.equal(One);
        await expect(
          signer1PaperPot.plant(paperSeed.address, 30)
        ).to.be.revertedWith("ERC721: owner query for nonexistent token");
      });
      it("should not allow if seed is not owned by operator", async () => {
        await paperPot.adminMintPot(signer1.address, 1);
        const potCount = await paperPot.balanceOf(signer1.address, 1);
        expect(potCount).to.equal(One);
        await expect(
          signer1PaperPot.plant(paperSeed.address, 4)
        ).to.be.revertedWith("Must own seed to plant");
        const potCountAfter = await paperPot.balanceOf(signer1.address, 1);
        expect(potCountAfter).to.equal(One);
      });
      it("should not allow if PaperPot has not been approved to move seed", async () => {
        await paperPot.adminMintPot(signer1.address, 1);
        const potCount = await paperPot.balanceOf(signer1.address, 1);
        expect(potCount).to.equal(One);
        await expect(
          signer1PaperPot.plant(paperSeed.address, 3)
        ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
        const potCountAfter = await paperPot.balanceOf(signer1.address, 1);
        expect(potCountAfter).to.equal(One);
      });
      it("should be able to mint with correct conditions", async () => {
        await paperPot.adminMintPot(signer1.address, 3);
        const potCountBefore = await paperPot.balanceOf(signer1.address, 1);
        const pottedPlantIndexBefore = await paperPot.pottedPlantCurrentIndex();
        const seedOwnerBefore = await paperSeed.ownerOf(3);
        expect(seedOwnerBefore).to.equal(signer1.address);
        expect(potCountBefore).to.equal(BigNumber.from(3));
        expect(pottedPlantIndexBefore).to.equal(0);
        await signer1PaperSeed.approve(paperPot.address, 3);
        const plantTx = await signer1PaperPot.plant(paperSeed.address, 3);
        const plantReceipt = await plantTx.wait();
        const plantEvent = plantReceipt.events.find(
          (event) => event.event === "Plant"
        );
        expect(plantEvent).to.exist;
        expect(plantEvent.args.tokenId).to.equal(1e6 + 1);
        expect(plantEvent.args.seedTokenId).to.equal(3);
        expect(plantEvent.args.account).to.equal(signer1.address);

        const potCountAfter = await paperPot.balanceOf(signer1.address, 1);
        const seedOwnerAfter = await paperSeed.ownerOf(3);
        const pottedPlantIndexAfter = await paperPot.pottedPlantCurrentIndex();
        const pottedPlantBalance = await paperPot.balanceOf(
          signer1.address,
          1e6 + 1
        );
        const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
        const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
        const lastWatering = await paperPot.getLastWatering(1e6 + 1);
        expect(potCountAfter).to.equal(BigNumber.from(2));
        expect(pottedPlantIndexAfter).to.equal(1);
        expect(seedOwnerAfter).to.equal(DEAD_ADDRESS);
        expect(pottedPlantBalance).to.equal(One);
        expect(plantedSeed).to.equal(3);
        expect(growthLevel).to.equal(0);
        expect(lastWatering).to.equal(1);
      });
      it("should not allow minting with the same seed twice", async () => {
        await paperPot.adminMintPot(signer1.address, 3);
        const potCountBefore = await paperPot.balanceOf(signer1.address, 1);
        const pottedPlantIndexBefore = await paperPot.pottedPlantCurrentIndex();
        const seedOwnerThreeBefore = await paperSeed.ownerOf(3);
        expect(seedOwnerThreeBefore).to.equal(signer1.address);
        expect(potCountBefore).to.equal(BigNumber.from(3));
        expect(pottedPlantIndexBefore).to.equal(0);
        await signer1PaperSeed.approve(paperPot.address, 3);

        const plantTx = await signer1PaperPot.plant(paperSeed.address, 3);
        const plantReceipt = await plantTx.wait();
        const plantEvent = plantReceipt.events.find(
          (event) => event.event === "Plant"
        );
        expect(plantEvent).to.exist;
        expect(plantEvent.args.tokenId).to.equal(1e6 + 1);
        expect(plantEvent.args.seedTokenId).to.equal(3);
        expect(plantEvent.args.account).to.equal(signer1.address);

        await expect(
          signer1PaperPot.plant(paperSeed.address, 3)
        ).to.be.revertedWith("Must own seed to plant");

        const potCountAfter = await paperPot.balanceOf(signer1.address, 1);
        const seedOwnerThreeAfter = await paperSeed.ownerOf(3);
        const pottedPlantIndexAfter = await paperPot.pottedPlantCurrentIndex();
        const pottedPlantBalanceOne = await paperPot.balanceOf(
          signer1.address,
          1e6 + 1
        );
        const plantedSeedOne = await paperPot.getPlantedSeed(1e6 + 1);
        const growthLevelOne = await paperPot.getGrowthLevel(1e6 + 1);
        const lastWateringOne = await paperPot.getLastWatering(1e6 + 1);
        const pottedPlantBalanceTwo = await paperPot.balanceOf(
          signer1.address,
          1e6 + 2
        );
        expect(potCountAfter).to.equal(BigNumber.from(2));
        expect(pottedPlantIndexAfter).to.equal(1);
        expect(seedOwnerThreeAfter).to.equal(DEAD_ADDRESS);
        expect(pottedPlantBalanceOne).to.equal(One);
        expect(pottedPlantBalanceTwo).to.equal(Zero);
        expect(plantedSeedOne).to.equal(3);
        expect(growthLevelOne).to.equal(0);
        expect(lastWateringOne).to.equal(1);
      });
      it("should be able to mint many with correct conditions", async () => {
        // Transfer also seed 4 to signer1
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer1.address,
          4
        );
        await paperPot.adminMintPot(signer1.address, 3);
        const potCountBefore = await paperPot.balanceOf(signer1.address, 1);
        const pottedPlantIndexBefore = await paperPot.pottedPlantCurrentIndex();
        const seedOwnerThreeBefore = await paperSeed.ownerOf(3);
        const seedOwnerFourBefore = await paperSeed.ownerOf(4);
        expect(seedOwnerThreeBefore).to.equal(signer1.address);
        expect(seedOwnerFourBefore).to.equal(signer1.address);
        expect(potCountBefore).to.equal(BigNumber.from(3));
        expect(pottedPlantIndexBefore).to.equal(0);
        await signer1PaperSeed.approve(paperPot.address, 3);
        await signer1PaperSeed.approve(paperPot.address, 4);

        const plantTx = await signer1PaperPot.plant(paperSeed.address, 3);
        const plantReceipt = await plantTx.wait();
        const plantEvent = plantReceipt.events.find(
          (event) => event.event === "Plant"
        );
        expect(plantEvent).to.exist;
        expect(plantEvent.args.tokenId).to.equal(1e6 + 1);
        expect(plantEvent.args.seedTokenId).to.equal(3);
        expect(plantEvent.args.account).to.equal(signer1.address);

        const plantTx2 = await signer1PaperPot.plant(paperSeed.address, 4);
        const plantReceipt2 = await plantTx2.wait();
        const plantEvent2 = plantReceipt2.events.find(
          (event) => event.event === "Plant"
        );
        expect(plantEvent2).to.exist;
        expect(plantEvent2.args.tokenId).to.equal(1e6 + 2);
        expect(plantEvent2.args.seedTokenId).to.equal(4);
        expect(plantEvent2.args.account).to.equal(signer1.address);

        const potCountAfter = await paperPot.balanceOf(signer1.address, 1);
        const seedOwnerThreeAfter = await paperSeed.ownerOf(3);
        const seedOwnerFourAfter = await paperSeed.ownerOf(4);
        const pottedPlantIndexAfter = await paperPot.pottedPlantCurrentIndex();
        const pottedPlantBalanceOne = await paperPot.balanceOf(
          signer1.address,
          1e6 + 1
        );
        const plantedSeedOne = await paperPot.getPlantedSeed(1e6 + 1);
        const growthLevelOne = await paperPot.getGrowthLevel(1e6 + 1);
        const lastWateringOne = await paperPot.getLastWatering(1e6 + 1);
        const pottedPlantBalanceTwo = await paperPot.balanceOf(
          signer1.address,
          1e6 + 2
        );
        const plantedSeedTwo = await paperPot.getPlantedSeed(1e6 + 2);
        const growthLevelTwo = await paperPot.getGrowthLevel(1e6 + 2);
        const lastWateringTwo = await paperPot.getLastWatering(1e6 + 2);
        expect(potCountAfter).to.equal(BigNumber.from(1));
        expect(pottedPlantIndexAfter).to.equal(2);
        expect(seedOwnerThreeAfter).to.equal(DEAD_ADDRESS);
        expect(seedOwnerFourAfter).to.equal(DEAD_ADDRESS);
        expect(pottedPlantBalanceOne).to.equal(One);
        expect(pottedPlantBalanceTwo).to.equal(One);
        expect(plantedSeedOne).to.equal(3);
        expect(growthLevelOne).to.equal(0);
        expect(lastWateringOne).to.equal(1);
        expect(plantedSeedTwo).to.equal(4);
        expect(growthLevelTwo).to.equal(0);
        expect(lastWateringTwo).to.equal(1);
      });

    })
    describe("plantAndMakeHappy", async () => {
      beforeEach(async () => {
        await paperPot.adminMintPot(signer1.address, 1);
        await paperSeed.claimReserve(11);
        // Happy seed
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer1.address,
          4
        );
        // Sad Seed
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer1.address,
          11
        );
      });
      it("ensure that seeds have expected emotion", async () => {
        const isSad4 = await paperPot.isSeedSad(4);
        const isSad11 = await paperPot.isSeedSad(11);
        expect(isSad4).to.equal(false);
        expect(isSad11).to.equal(true);
      })
      it("should reject if incorrect payment amount - no payment", async () => {
        await expect(signer1PaperPot.plantAndMakeHappy(
          paperSeed.address,
          11,
          {value: ethers.constants.Zero})
        ).to.be.revertedWith(
          "PaperPot: Incorrect payment amount"
        );
      });
      it("should reject if incorrect payment amount - too low", async () => {
        await expect(signer1PaperPot.plantAndMakeHappy(
          paperSeed.address,
          11,
          {value: ethers.constants.WeiPerEther.div(2)})
        ).to.be.revertedWith(
          "PaperPot: Incorrect payment amount"
        );
      });
      it("should reject if incorrect payment amount - too high", async () => {
        await expect(signer1PaperPot.plantAndMakeHappy(
          paperSeed.address,
          11,
          {value: ethers.constants.WeiPerEther.mul(2)})
        ).to.be.revertedWith(
          "PaperPot: Incorrect payment amount"
        );
      });
      it("should reject if seed already happy", async () => {
        await expect(signer1PaperPot.plantAndMakeHappy(
          paperSeed.address,
          4,
          {value: ethers.constants.WeiPerEther})
        ).to.be.revertedWith(
          "PaperPot: Seed already happy"
        );
      });
      it("should plant and create a happy plant", async () => {

        const potCountBefore = await paperPot.balanceOf(signer1.address, 1);
        const pottedPlantIndexBefore = await paperPot.pottedPlantCurrentIndex();
        const seedOwnerBefore = await paperSeed.ownerOf(11);
        expect(seedOwnerBefore).to.equal(signer1.address);
        expect(potCountBefore).to.equal(BigNumber.from(1));
        expect(pottedPlantIndexBefore).to.equal(0);
        await signer1PaperSeed.approve(paperPot.address, 11);
        const plantTx = await signer1PaperPot.plantAndMakeHappy(
          paperSeed.address,
          11,
          {value: ethers.constants.WeiPerEther}
        )
        const plantReceipt = await plantTx.wait();
        const plantEvent = plantReceipt.events.find(
          (event) => event.event === "Plant"
        );
        expect(plantEvent).to.exist;
        expect(plantEvent.args.tokenId).to.equal(1e6 + 1);
        expect(plantEvent.args.seedTokenId).to.equal(11);
        expect(plantEvent.args.account).to.equal(signer1.address);

        const potCountAfter = await paperPot.balanceOf(signer1.address, 1);
        const seedOwnerAfter = await paperSeed.ownerOf(11);
        const pottedPlantIndexAfter = await paperPot.pottedPlantCurrentIndex();
        const pottedPlantBalance = await paperPot.balanceOf(
          signer1.address,
          1e6 + 1
        );
        const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
        const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
        const lastWatering = await paperPot.getLastWatering(1e6 + 1);
        expect(potCountAfter).to.equal(BigNumber.from(0));
        expect(pottedPlantIndexAfter).to.equal(1);
        expect(seedOwnerAfter).to.equal(DEAD_ADDRESS);
        expect(pottedPlantBalance).to.equal(One);
        expect(plantedSeed).to.equal(11);
        expect(growthLevel).to.equal(0);
        expect(lastWatering).to.equal(1);

        const isSad4 = await paperPot.isSeedSad(4);
        const isSad11 = await paperPot.isSeedSad(11);
        expect(isSad4).to.equal(false);
        expect(isSad11).to.equal(false);
      });
    });
  });

  describe("uri", async () => {
    it('Should reject if token does not exist', async () => {
      await expect(paperPot.uri(1)).to.be.revertedWith(
        "PaperPot: URI query for nonexistent token"
      );
      await expect(paperPot.uri(4)).to.be.revertedWith("PaperPot: URI query for nonexistent token");
      await expect(paperPot.uri(3000001)).to.be.revertedWith("PaperPot: URI query for nonexistent token");
    });
    it('Should return standard uri if tokenId is 1-2-3', async () => {
      await paperPot.adminMintPot(signer1.address, 1);
      await paperPot.adminDistributeFertilizer(signer1.address, 1);
      await paperPot.adminDistributeWater(signer1.address, 1);
      const uri1 = await paperPot.uri(1);
      const uri2 = await paperPot.uri(2);
      const uri3 = await paperPot.uri(3);
      expect(uri1).to.equal('http://test.xyz/1');
      expect(uri2).to.equal('http://test.xyz/2');
      expect(uri3).to.equal('http://test.xyz/3');
    });
    it('Should work', async () => {
      const expectedMetadata = {
        name: 'Potted Plant of Power #1',
        description: 'created by Shrub.finance',
        created_by: 'Shrub.finance',
        image: 'ipfs://abcdefg/pottedplant-Power-0-happy',
        attributes: [
          { trait_type: 'Class', value: 'Power' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'DNA', value: 3 },
          { trait_type: 'Growth', value: 0 },
          { trait_type: 'Emotion', value: 'Happy' },
          { trait_type: 'Planted Seed', value: 'Paper Seed of Power #3' }
        ]
      }
      await paperPot.adminMintPot(signer1.address, 3);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
      await signer1PaperSeed.approve(paperPot.address, 3);
      const plantTx = await signer1PaperPot.plant(paperSeed.address, 3);
      const uri = await paperPot.uri(1e6 + 1);
      const splitUri = uri.split(',');
      // console.log(uri);
      // console.log(splitUri);
      // console.log(splitUri.length);
      expect(splitUri.length).to.equal(2);
      expect(splitUri[0]).to.equal('data:application/json;base64');
      const decodedBase64Bytes = ethers.utils.base64.decode(splitUri[1]);
      const decodedMetadata = JSON.parse(ethers.utils.toUtf8String(decodedBase64Bytes));
      expect(decodedMetadata).to.deep.equal(expectedMetadata);
      const plantReceipt = await plantTx.wait();
      const plantEvent = plantReceipt.events.find(
        (event) => event.event === "Plant"
      );
      const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
      const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
      const lastWatering = await paperPot.getLastWatering(1e6 + 1);
      expect(plantedSeed).to.equal(3);
      expect(growthLevel).to.equal(0);
      expect(lastWatering).to.equal(1);
    })
    it('Should not be able to set uri if not admin', async () => {
      const expectedMetadata = {
        name: 'Potted Plant of Power #1',
        description: 'created by Shrub.finance',
        created_by: 'Shrub.finance',
        image: 'ipfs://abcdefg/pottedplant-Power-0-happy',
        attributes: [
          { trait_type: 'Class', value: 'Power' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'DNA', value: 3 },
          { trait_type: 'Growth', value: 0 },
          { trait_type: 'Emotion', value: 'Happy' },
          { trait_type: 'Planted Seed', value: 'Paper Seed of Power #3' }
        ]
      }
      await paperPot.adminMintPot(signer1.address, 3);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
      await signer1PaperSeed.approve(paperPot.address, 3);
      const plantTx = await signer1PaperPot.plant(paperSeed.address, 3);
      const uri = await paperPot.uri(1e6 + 1);
      const splitUri = uri.split(',');
      expect(splitUri.length).to.equal(2);
      expect(splitUri[0]).to.equal('data:application/json;base64');
      const decodedBase64Bytes = ethers.utils.base64.decode(splitUri[1]);
      const decodedMetadata = JSON.parse(ethers.utils.toUtf8String(decodedBase64Bytes));
      expect(decodedMetadata).to.deep.equal(expectedMetadata);
      const plantReceipt = await plantTx.wait();
      const plantEvent = plantReceipt.events.find(
        (event) => event.event === "Plant"
      );
      const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
      const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
      const lastWatering = await paperPot.getLastWatering(1e6 + 1);
      expect(plantedSeed).to.equal(3);
      expect(growthLevel).to.equal(0);
      expect(lastWatering).to.equal(1);
      await expect(signer1PaperPot.setURI(1e6 + 1, 'test.abc.def/100')).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    })
    it('Should be able to override potted plant uri', async () => {
      const expectedMetadata = {
        name: 'Potted Plant of Power #1',
        description: 'created by Shrub.finance',
        created_by: 'Shrub.finance',
        image: 'ipfs://abcdefg/pottedplant-Power-0-happy',
        attributes: [
          { trait_type: 'Class', value: 'Power' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'DNA', value: 3 },
          { trait_type: 'Growth', value: 0 },
          { trait_type: 'Emotion', value: 'Happy' },
          { trait_type: 'Planted Seed', value: 'Paper Seed of Power #3' }
        ]
      }
      await paperPot.adminMintPot(signer1.address, 3);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
      await signer1PaperSeed.approve(paperPot.address, 3);
      const plantTx = await signer1PaperPot.plant(paperSeed.address, 3);
      const uri = await paperPot.uri(1e6 + 1);
      const splitUri = uri.split(',');
      expect(splitUri.length).to.equal(2);
      expect(splitUri[0]).to.equal('data:application/json;base64');
      const decodedBase64Bytes = ethers.utils.base64.decode(splitUri[1]);
      const decodedMetadata = JSON.parse(ethers.utils.toUtf8String(decodedBase64Bytes));
      expect(decodedMetadata).to.deep.equal(expectedMetadata);
      const plantReceipt = await plantTx.wait();
      const plantEvent = plantReceipt.events.find(
        (event) => event.event === "Plant"
      );
      const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
      const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
      const lastWatering = await paperPot.getLastWatering(1e6 + 1);
      expect(plantedSeed).to.equal(3);
      expect(growthLevel).to.equal(0);
      expect(lastWatering).to.equal(1);
      await paperPot.setURI(1e6 + 1, 'test.abc.def/100');
      const newUri = await paperPot.uri(1e6 + 1);
      expect(newUri).to.equal('test.abc.def/100');
    })
  });

  describe("watering", async () => {
    let expectedMetadata;
    beforeEach(async () => {
      expectedMetadata = {
        name: 'Potted Plant of Power #1',
        description: 'created by Shrub.finance',
        created_by: 'Shrub.finance',
        image: 'ipfs://abcdefg/pottedplant-Power-0-happy',
        attributes: [
          { trait_type: 'Class', value: 'Power' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'DNA', value: 3 },
          { trait_type: 'Growth', value: 0 },
          { trait_type: 'Emotion', value: 'Happy' },
          { trait_type: 'Planted Seed', value: 'Paper Seed of Power #3' }
        ]
      }
      await paperPot.adminMintPot(signer1.address, 3);
      await paperPot.adminDistributeWater(signer1.address, 1);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
      await signer1PaperSeed.approve(paperPot.address, 3);
      await signer1PaperPot.plant(paperSeed.address, 3);
      const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
      const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
      const lastWatering = await paperPot.getLastWatering(1e6 + 1);
      const waterSupplyBefore = await paperPot.balanceOf(signer1.address, 3);
      expect(plantedSeed).to.equal(3);
      expect(growthLevel).to.equal(0);
      expect(lastWatering).to.equal(1);
      expect(waterSupplyBefore).to.equal(1);
    })
    describe("without fertilizer", async () => {
      it("should fail if there is insufficient water for watering 1", async () => {
        await signer1PaperPot.safeTransferFrom(signer1.address, signer2.address, 3, 1, BYTES_ZERO);
        const waterSupply = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupply).to.equal(0)
        await expect(signer1PaperPot.water([1e6 + 1])).to.be.revertedWith(
          "PaperPot: Insufficient balance"
        );
      });
      it("should fail if there is insufficient water for watering 2", async () => {
        const waterSupply = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupply).to.equal(1)
        await expect(signer1PaperPot.water([1e6 + 1, 1e6 + 2])).to.be.revertedWith(
          "PaperPot: Insufficient balance"
        );
      });
      it("should fail if the potted plant does not exist", async () => {
        await signer1PaperPot.safeTransferFrom(signer1.address, signer2.address, 3, 1, BYTES_ZERO);
        const waterSupply = await paperPot.balanceOf(signer2.address, 3);
        expect(waterSupply).to.equal(1)
        await expect(signer2PaperPot.water([1e6 + 100])).to.be.revertedWith(
          "PaperPot: ineligible tokenId"
        );
      });
      it("should fail if the potted plant is not owned by the sender", async () => {
        await signer1PaperPot.safeTransferFrom(signer1.address, signer2.address, 3, 1, BYTES_ZERO);
        const waterSupply = await paperPot.balanceOf(signer2.address, 3);
        expect(waterSupply).to.equal(1)
        await expect(signer2PaperPot.water([1e6 + 1])).to.be.revertedWith(
          "PaperPot: Potted plant not owned by sender"
        );
      });
      it("should fail if the same plant is in the array twice", async () => {
        await paperPot.adminDistributeWater(signer1.address, 1);
        const waterSupply = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupply).to.equal(2);
        await expect(signer1PaperPot.water([1e6 + 1, 1e6 + 1])).to.be.revertedWith(
          "PaperPot: provided tokenIds not eligible"
        );
      });
      it("should work to water a plant if everything is there", async() => {
        const waterTx = await signer1PaperPot.water([1e6 + 1]);
        const waterTxReceipt = await waterTx.wait();
        const waterTxBlockHash = waterTxReceipt.blockHash;
        const waterTxBlock = await ethers.provider.getBlock(waterTxBlockHash);
        const waterTxTimestamp = waterTxBlock.timestamp;
        const waterSupplyAfter = await paperPot.balanceOf(signer1.address, 3);
        const plantedSeed2 = await paperPot.getPlantedSeed(1e6 + 1);
        const growthLevel2 = await paperPot.getGrowthLevel(1e6 + 1);
        const lastWatering2 = await paperPot.getLastWatering(1e6 + 1);

        const afterWaterUri = await paperPot.uri(1e6 + 1);
        const splitUri = afterWaterUri.split(',');
        expect(splitUri.length).to.equal(2);
        expect(splitUri[0]).to.equal('data:application/json;base64');
        const decodedBase64Bytes = ethers.utils.base64.decode(splitUri[1]);
        const decodedMetadata = JSON.parse(ethers.utils.toUtf8String(decodedBase64Bytes));
        expectedMetadata.attributes[3].value = growthLevel2.toNumber();
        // console.log(decodedMetadata);
        expect(decodedMetadata).to.deep.equal(expectedMetadata);

        // Case: Sad Potted Plant (100-175)
        // Case: Happy Potted Plant (200-350)
        // Case: Sad Potted Plant with Fertilizer (150-263)
        // Case: Happy Potted Plant with Fertilizer (300-525)

        // console.log(waterTxTimestamp);
        // console.log(waterTxReceipt);
        // console.log(growthLevel2);
        // console.log(lastWatering2);
        expect(waterSupplyAfter).to.equal(0);
        expect(plantedSeed2).to.equal(3);
        expect(growthLevel2).to.be.gte(200);
        expect(growthLevel2).to.be.lte(350);
        expect(lastWatering2).to.equal(waterTxTimestamp);
      });
      it("should fail to water a second time if less than eight hours have past", async () => {
        await paperPot.adminDistributeWater(signer1.address, 1);
        const waterSupply = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupply).to.equal(2);
        await signer1PaperPot.water([1e6 + 1]);
        const waterSupplyAfter = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupplyAfter).to.equal(1);
        await expect(signer1PaperPot.water([1e6 + 1])).to.be.revertedWith(
          "PaperPot: provided tokenIds not eligible"
        );
      });
      it("should fail to water a second time if more than eight hours have past but same day", async () => {
        await paperPot.adminDistributeWater(signer1.address, 1);
        const waterSupply = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupply).to.equal(2);
        const twoDaysFromNow = new Date(ethNow * 1000);
        twoDaysFromNow.setUTCDate(now.getUTCDate() + 2);
        twoDaysFromNow.setUTCHours(0,0,0,0);
        const nineHoursLater = new Date(twoDaysFromNow);
        nineHoursLater.setUTCHours(twoDaysFromNow.getUTCHours() + 9);
        await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(twoDaysFromNow)]);
        const lastBlock = await ethers.provider.getBlock('latest');
        const waterTx = await signer1PaperPot.water([1e6 + 1]);
        const growthLevel1 = await paperPot.getGrowthLevel(1e6 + 1);
        const waterSupplyAfter = await paperPot.balanceOf(signer1.address, 3);
        const waterTxTimestamp = (await ethers.provider.getBlock(waterTx.blockHash)).timestamp;
        expect(waterSupplyAfter).to.equal(1);
        expect(waterTxTimestamp).to.equal(toEthDate(twoDaysFromNow));
        // await ethers.provider.send('evm_mine', []);
        await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nineHoursLater)]);
        await expect(signer1PaperPot.water([1e6 + 1])).to.be.revertedWith(
          "PaperPot: provided tokenIds not eligible"
        );
        const growthLevel2 = await paperPot.getGrowthLevel(1e6 + 1);
        const latestTimestamp = (await ethers.provider.getBlock('latest')).timestamp;
        expect(latestTimestamp).to.equal(toEthDate(nineHoursLater));
        expect(growthLevel1).to.be.gte(200);
        expect(growthLevel1).to.be.lte(350);
        expect(growthLevel2).to.equal(growthLevel1);
      });
      it("should succeed watering a second time if more than eight hours have past and new day", async () => {
        await paperPot.adminDistributeWater(signer1.address, 1);
        const waterSupply = await paperPot.balanceOf(signer1.address, 3);
        expect(waterSupply).to.equal(2);
        const twoDaysFromNow = new Date(ethNow * 1000);
        twoDaysFromNow.setUTCDate(now.getUTCDate() + 2);
        twoDaysFromNow.setUTCHours(20,0,0,0);
        const eightHoursLater = new Date(twoDaysFromNow);
        const sevenHoursLater = new Date(twoDaysFromNow);
        eightHoursLater.setUTCHours(twoDaysFromNow.getUTCHours() + 8);
        sevenHoursLater.setUTCHours(twoDaysFromNow.getUTCHours() + 7, 59, 59);
        await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(twoDaysFromNow)]);
        const lastBlock = await ethers.provider.getBlock('latest');
        const growthLevel0 = await paperPot.getGrowthLevel(1e6 + 1);
        const waterTx = await signer1PaperPot.water([1e6 + 1]);
        const growthLevel1 = await paperPot.getGrowthLevel(1e6 + 1);
        const waterSupplyAfter = await paperPot.balanceOf(signer1.address, 3);
        const waterTxTimestamp = (await ethers.provider.getBlock(waterTx.blockHash)).timestamp;
        expect(waterSupplyAfter).to.equal(1);
        expect(waterTxTimestamp).to.equal(toEthDate(twoDaysFromNow));
        await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(sevenHoursLater)]);
        await expect(signer1PaperPot.water([1e6 + 1])).to.be.revertedWith(
          "PaperPot: provided tokenIds not eligible"
        );
        const growthLevel2 = await paperPot.getGrowthLevel(1e6 + 1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(eightHoursLater)]);
        await signer1PaperPot.water([1e6 + 1]);
        const growthLevel3 = await paperPot.getGrowthLevel(1e6 + 1);
        const latestTimestamp = (await ethers.provider.getBlock('latest')).timestamp;
        expect(latestTimestamp).to.equal(toEthDate(eightHoursLater));
        expect(growthLevel0).to.equal(0);
        expect(growthLevel1).to.be.gte(200);
        expect(growthLevel1).to.be.lte(350);
        expect(growthLevel2).to.equal(growthLevel1);
        expect(growthLevel3).to.be.gte(growthLevel1.add(200));
        expect(growthLevel3).to.be.lte(growthLevel1.add(350));
      });
      it("should grow up all the way", async () => {
        let growthLevel = ethers.constants.Zero;
        let date = new Date(ethNow * 1000);
        let count = 0;
        while (growthLevel.lt(10000)) {
          await paperPot.adminDistributeWater(signer1.address, 1);
          // increment 1 day
          date.setUTCDate(date.getUTCDate() + 1);
          await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(date)]);
          await signer1PaperPot.water([1e6 + 1]);
          count++;
          const growthLevelNew = await paperPot.getGrowthLevel(1e6 + 1);
          if (growthLevelNew.lt(10000)) {
            expect(growthLevelNew).to.be.gte(growthLevel.add(200));
            expect(growthLevelNew).to.be.lte(growthLevel.add(350));
          }
          growthLevel = growthLevelNew;
          // console.log(count, growthLevel.toNumber());
        }
        expect(growthLevel).to.equal(10000);
      });
    })
    describe("with fertilizer", async () => {
      it("should fail if there is insufficient fertilizer for 1", async () => {});
      it("should fail if there is insufficient fertilizer for 2", async () => {});
      it("should work for 1 and grow faster", async () => {});
      it("should work for 2 and grow faster", async () => {});
      it("should grow up all the way", async () => {});
    })
  });

  describe("adminSetSadSeeds", async () => {
    it("should reject for non-admin", async () => {
      await expect(
        signer1PaperPot.adminSetSadSeeds([],[])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should reject if seedTokenIds and isSads are not equal length", async () => {
      await expect(
        paperPot.adminSetSadSeeds([1, 2],[true])
      ).to.be.revertedWith("seedTokenIds and isSads must be equal length");
    });
    it("should allow owner", async () => {
      await paperPot.adminSetSadSeeds([],[])
    });
    it("should properly change a sad seed to happy and happy to sad", async () => {
      // const SAD_SEEDS = [11, 13, 15, 17, 19];
      await paperPot.adminSetSadSeeds([1, 2, 5, 15, 16, 19],[true, false, true, false, false, true]);
      const isSad1 = await paperPot.isSeedSad(1);
      const isSad2 = await paperPot.isSeedSad(2);
      const isSad5 = await paperPot.isSeedSad(5);
      const isSad11 = await paperPot.isSeedSad(11);
      const isSad15 = await paperPot.isSeedSad(15);
      const isSad16 = await paperPot.isSeedSad(16);
      const isSad19 = await paperPot.isSeedSad(19);
      expect(isSad1).to.equal(true);
      expect(isSad2).to.equal(false);
      expect(isSad5).to.equal(true);
      expect(isSad11).to.equal(true);
      expect(isSad15).to.equal(false);
      expect(isSad16).to.equal(false);
      expect(isSad19).to.equal(true);
    });
  });

  describe("harvest", async () => {});

  describe("receiveWaterFromFaucet", async () => {});

  describe("setUri", async () => {
    it("should reject for non-owner", async () => {
      await expect(
        signer1PaperPot.setURI(1, "https://testUri/one")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should work for owner", async () => {
      await paperPot.setURI(1, "https://testUri/one")
      await paperPot.setURI(3, "https://testUri/three")
      await paperPot.adminMintPot(owner.address, 1);
      await paperPot.adminDistributeWater(owner.address, 1);
      await paperPot.adminDistributeFertilizer(owner.address, 1);
      const uri1 = await paperPot.uri(1);
      const uri2 = await paperPot.uri(2);
      const uri3 = await paperPot.uri(3);
      expect(uri1).to.equal("https://testUri/one");
      expect(uri2).to.equal("http://test.xyz/2");
      expect(uri3).to.equal("https://testUri/three");
    });
  });

  describe("setMetadataGenerator", async () => {
    it("should reject for non-owner", async () => {
      await expect(
        signer1PaperPot.setMetadataGenerator(paperPotMetadata.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should reject if contract address is not a contract", async () => {
      await expect(
        paperPot.setMetadataGenerator(signer3.address)
      ).to.be.revertedWith("PaperPot: not a valid IPaperPotMetadata implementation");
    });
    it("should reject if contract address is not compliant with IPaperPotMetadata ERC-165", async () => {
      await expect(
        paperPot.setMetadataGenerator(weth.address)
      ).to.be.revertedWith("PaperPot: not a valid IPaperPotMetadata implementation");
    });
    it("should allow setting for owner", async () => {
      const metadataAddressBefore = await paperPot._metadataGenerator();
      const PaperPotMetadata = await ethers.getContractFactory("PaperPotMetadata") as PaperPotMetadata__factory;
      const paperPotMetadata2 = await PaperPotMetadata.deploy("ipfs://test1/");
      await paperPot.setMetadataGenerator(paperPotMetadata2.address);
      const metadataAddressAfter = await paperPot._metadataGenerator();
      expect(metadataAddressBefore).to.equal(paperPotMetadata.address);
      expect(metadataAddressAfter).to.equal(paperPotMetadata2.address);
    });
  });

  describe("getPlantedSeed", async () => {
    beforeEach(async () => {
      await paperPot.adminMintPot(signer1.address, 1);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        4
      );
      await signer1PaperSeed.approve(paperPot.address, 4);
      await signer1PaperPot.plant(paperSeed.address, 4);
    });
    it("should reject if token does not exist", async () => {
      await expect(
        paperPot.getPlantedSeed(1e6 + 2)
      ).to.be.revertedWith("PaperPot: query for nonexistent token");
    });
    it("should reject if tokenId is too low to be a pottedplant id", async () => {
      await expect(
        paperPot.getPlantedSeed(1e6)
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should reject if tokenId is too high to be a pottedplant id", async () => {
      await expect(
        paperPot.getPlantedSeed(2e6)
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should work for a valid token", async () => {
      const plantedSeedId = await paperPot.getPlantedSeed(1e6 + 1);
      expect(plantedSeedId).to.equal(4);
    });
  });

  describe("getGrowthLevel", async () => {
    beforeEach(async () => {
      await paperPot.adminMintPot(signer1.address, 1);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        4
      );
      await signer1PaperSeed.approve(paperPot.address, 4);
      await signer1PaperPot.plant(paperSeed.address, 4);
    });
    it("should reject if token does not exist", async () => {
      await expect(
        paperPot.getGrowthLevel(1e6 + 2)
      ).to.be.revertedWith("PaperPot: query for nonexistent token");
    });
    it("should reject if tokenId is too low to be a pottedplant id", async () => {
      await expect(
        paperPot.getGrowthLevel(1e6)
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should reject if tokenId is too high to be a pottedplant id", async () => {
      await expect(
        paperPot.getGrowthLevel(2e6)
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should work for a valid token", async () => {
      const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
      expect(growthLevel).to.equal(0);
    });
    it("should properly react to watering", async () => {
      await paperPot.adminDistributeWater(signer1.address, 1);
      const growthLevelBefore = await paperPot.getGrowthLevel(1e6 + 1);
      // await expect(signer1PaperPot.water([1e6 + 1]))
      //   .to.emit(paperPot, 'Grow');
      const receipt = await (await signer1PaperPot.water([1e6 + 1])).wait();
      const growEvent = receipt.events.find(
        (event) => event.event === "Grow"
      );
      // event Grow(uint tokenId, uint16 growthAmount, uint16 growthBps);
      expect(growEvent).to.exist;
      expect(growEvent.args.tokenId).to.equal(1e6 + 1);
      expect(growEvent.args.growthAmount).to.equal(growEvent.args.growthBps);
      const growthAmount = growEvent.args.growthAmount;
      const growthLevelAfter = await paperPot.getGrowthLevel(1e6 + 1);
      expect(growthLevelBefore).to.equal(0);
      expect(growthLevelAfter).to.equal(growthAmount);
    });
  });

  describe("getLastWatering", async () => {
    beforeEach(async () => {
      await paperPot.adminMintPot(signer1.address, 1);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        4
      );
      await signer1PaperSeed.approve(paperPot.address, 4);
      await signer1PaperPot.plant(paperSeed.address, 4);
    });
    it("should reject if token does not exist", async () => {
      await expect(
        paperPot.getLastWatering(1e6 + 2)
      ).to.be.revertedWith("PaperPot: query for nonexistent token");
    });
    it("should reject if tokenId is too low to be a pottedplant id", async () => {
      await expect(
        paperPot.getLastWatering(1e6)
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should reject if tokenId is too high to be a pottedplant id", async () => {
      await expect(
        paperPot.getLastWatering(2e6)
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should work for a valid token", async () => {
      const lastWatering = await paperPot.getLastWatering(1e6 + 1);
      expect(lastWatering).to.equal(1);
    });
    it("should properly react to watering", async () => {
      await paperPot.adminDistributeWater(signer1.address, 1);
      const lastWateringBefore = await paperPot.getLastWatering(1e6 + 1);
      const receipt = await (await signer1PaperPot.water([1e6 + 1])).wait();
      const growEvent = receipt.events.find(
        (event) => event.event === "Grow"
      );
      // event Grow(uint tokenId, uint16 growthAmount, uint16 growthBps);
      expect(growEvent).to.exist;
      expect(growEvent.args.tokenId).to.equal(1e6 + 1);
      expect(growEvent.args.growthAmount).to.equal(growEvent.args.growthBps);
      const growthAmount = growEvent.args.growthAmount;
      const waterBlockTime = (await ethers.provider.getBlock(receipt.blockHash)).timestamp;
      const lastWateringAfter = await paperPot.getLastWatering(1e6 + 1);
      expect(lastWateringBefore).to.equal(1);
      expect(lastWateringAfter).to.equal(waterBlockTime);
    });
  });

  describe("eligibleForWatering", async () => {
    beforeEach(async () => {
      await paperPot.adminMintPot(signer1.address, 3);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        2
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        4
      );
      await signer1PaperSeed.approve(paperPot.address, 2);
      await signer1PaperPot.plant(paperSeed.address, 2);
      await signer1PaperSeed.approve(paperPot.address, 3);
      await signer1PaperPot.plant(paperSeed.address, 3);
      await signer1PaperSeed.approve(paperPot.address, 4);
      await signer1PaperPot.plant(paperSeed.address, 4);
    });
    it("should reject if token does not exist", async () => {
      await expect(
        paperPot.eligibleForWatering([1e6 + 4])
      ).to.be.revertedWith("PaperPot: query for nonexistent token");
    });
    it("should reject if tokenId is too low to be a pottedplant id", async () => {
      await expect(
        paperPot.eligibleForWatering([1e6])
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should reject if tokenId is too high to be a pottedplant id", async () => {
      await expect(
        paperPot.eligibleForWatering([2e6])
      ).to.be.revertedWith("PaperPot: invalid potted plant tokenId");
    });
    it("should reject if duplicate tokenIds", async () => {
      await expect(
        paperPot.eligibleForWatering([1e6 + 1, 1e6 + 1])
      ).to.be.revertedWith("PaperPot: duplicate tokenId");
    });
    it("should reject if duplicate tokenIds - non-sequential", async () => {
      await expect(
        paperPot.eligibleForWatering([1e6 + 1, 1e6 + 2, 1e6 + 1])
      ).to.be.revertedWith("PaperPot: duplicate tokenId");
    });
    it("should work for a valid token", async () => {
      const eligible = await paperPot.eligibleForWatering([1e6 + 1]);
      expect(eligible).to.equal(true);
    });
    it("should work for many valid tokens", async () => {
      const eligible = await paperPot.eligibleForWatering([1e6 + 1, 1e6 + 2, 1e6 + 3]);
      expect(eligible).to.equal(true);
    });
    it("should properly react to watering", async () => {
      await paperPot.adminDistributeWater(signer1.address, 1);
      const eligibleBefore = await paperPot.eligibleForWatering([1e6 + 1]);
      const eligibleBeforeAll = await paperPot.eligibleForWatering([1e6 + 1, 1e6 + 2, 1e6 + 3]);
      const receipt = await (await signer1PaperPot.water([1e6 + 1])).wait();
      const growEvent = receipt.events.find(
        (event) => event.event === "Grow"
      );
      // event Grow(uint tokenId, uint16 growthAmount, uint16 growthBps);
      expect(growEvent).to.exist;
      expect(growEvent.args.tokenId).to.equal(1e6 + 1);
      expect(growEvent.args.growthAmount).to.equal(growEvent.args.growthBps);
      const eligibleAfter = await paperPot.eligibleForWatering([1e6 + 1]);
      const eligibleAfterAll = await paperPot.eligibleForWatering([1e6 + 1, 1e6 + 2, 1e6 + 3]);
      const eligibleAfterSome = await paperPot.eligibleForWatering([1e6 + 2, 1e6 + 3]);
      expect(eligibleBefore).to.equal(true);
      expect(eligibleBeforeAll).to.equal(true);
      expect(eligibleAfter).to.equal(false);
      expect(eligibleAfterAll).to.equal(false);
      expect(eligibleAfterSome).to.equal(true);
    });
  });

  describe("harvest", async () => {
    // Grow four shrubs to harvest height
    // signer1 - power (3)
    // signer2 - hope, passion (67, 667)
    // signer3 - wonder, wonder (6667, 1500)
    let signer3PaperSeed: PaperSeed;
    let signer3PaperPot: PaperPot;
    let signerInfo: {[address: string]: any}
    beforeEach(async() => {
      {
        // expectedMetadata = {
        //   name: 'Potted Plant of Power #1',
        //   description: 'created by Shrub.finance',
        //   created_by: 'Shrub.finance',
        //   image: 'ipfs://abcdefg/pottedplant-Power-0-happy',
        //   attributes: [
        //     { trait_type: 'Class', value: 'Power' },
        //     { trait_type: 'Rarity', value: 'Legendary' },
        //     { trait_type: 'DNA', value: 3 },
        //     { trait_type: 'Growth', value: 0 },
        //     { trait_type: 'Emotion', value: 'Happy' },
        //     { trait_type: 'Planted Seed', value: 'Paper Seed of Power #3' }
        //   ]
        // }
        signer3PaperSeed = paperSeed.connect(signer3);
        signer3PaperPot = paperPot.connect(signer3);
        signerInfo = {
          [signer1.address]: {signer: signer1},
          [signer2.address]: {signer: signer2},
          [signer3.address]: {signer: signer3},
        }
        for (let [address, values] of Object.entries(signerInfo)) {
          signerInfo[address].paperPot = paperPot.connect(values.signer)
        }
        await paperSeed.claimReserve(67);
        await paperSeed.claimReserve(667);
        await paperSeed.claimReserve(1500);
        await paperSeed.claimReserve(6667);
        await paperPot.adminMintPot(signer1.address, 1);
        await paperPot.adminMintPot(signer2.address, 2);
        await paperPot.adminMintPot(signer3.address, 2);
        await paperPot.adminDistributeWater(signer1.address, 1);
        await paperPot.adminDistributeWater(signer2.address, 1);
        await paperPot.adminDistributeWater(signer3.address, 1);
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer1.address,
          3
        );
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer2.address,
          67
        );
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer2.address,
          667
        );
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer3.address,
          1500
        );
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signer3.address,
          6667
        );
        await signer1PaperSeed.approve(paperPot.address, 3);
        await signer2PaperSeed.approve(paperPot.address, 67);
        await signer2PaperSeed.approve(paperPot.address, 667);
        await signer3PaperSeed.approve(paperPot.address, 1500);
        await signer3PaperSeed.approve(paperPot.address, 6667);
        await signer1PaperPot.plant(paperSeed.address, 3);
        await signer2PaperPot.plant(paperSeed.address, 67);
        await signer2PaperPot.plant(paperSeed.address, 667);
        await signer3PaperPot.plant(paperSeed.address, 1500);
        await signer3PaperPot.plant(paperSeed.address, 6667);
        let plantedSeeds: BigNumber[] = [];
        let growthLevels: BigNumber[] = [];
        let lastWaterings: BigNumber[] = [];
        for (let i = 1; i <= 5; i++) {
          plantedSeeds[i] = await paperPot.getPlantedSeed(1e6 + i);
          growthLevels[i] = await paperPot.getGrowthLevel(1e6 + i);
          lastWaterings[i] = await paperPot.getLastWatering(1e6 + i);
        }
        // const plantedSeed = await paperPot.getPlantedSeed(1e6 + 1);
        // const growthLevel = await paperPot.getGrowthLevel(1e6 + 1);
        // const lastWatering = await paperPot.getLastWatering(1e6 + 1);
        for (let signerAddress of Object.keys(signerInfo)) {
          signerInfo[signerAddress].waterSupplyBefore = await paperPot.balanceOf(signerAddress, 3)
        }
        expect(plantedSeeds[1]).to.equal(3);
        expect(plantedSeeds[2]).to.equal(67);
        expect(plantedSeeds[3]).to.equal(667);
        expect(plantedSeeds[4]).to.equal(1500);
        expect(plantedSeeds[5]).to.equal(6667);
        expect(growthLevels[1]).to.equal(0);
        expect(growthLevels[2]).to.equal(0);
        expect(growthLevels[3]).to.equal(0);
        expect(growthLevels[4]).to.equal(0);
        expect(growthLevels[5]).to.equal(0);
        expect(lastWaterings[1]).to.equal(1);
        expect(lastWaterings[2]).to.equal(1);
        expect(lastWaterings[3]).to.equal(1);
        expect(lastWaterings[4]).to.equal(1);
        expect(lastWaterings[5]).to.equal(1);
        expect(signerInfo[signer1.address].waterSupplyBefore).to.equal(1);
        expect(signerInfo[signer2.address].waterSupplyBefore).to.equal(1);
        expect(signerInfo[signer3.address].waterSupplyBefore).to.equal(1);
      }
    })
    it("should grow up all the way", async () => {
      const {Zero, One} = ethers.constants;
      let growthLevels = [Zero, Zero, Zero, Zero, Zero]
      // let growthLevel = ethers.constants.Zero;
      let date = new Date(ethNow * 1000);
      let count = 0;
      while (growthLevels.find(level => level.lt(10000))) {
        // increment 1 day
        date.setUTCDate(date.getUTCDate() + 1);
        await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(date)]);
        for (const [index, level] of Object.entries(growthLevels)) {
          if (level.eq(10000)) {
            continue;
          }
          const signerAddress = index === '0' ? signer1.address :
            ['1', '2'].includes(index) ? signer2.address : signer3.address;
          await paperPot.adminDistributeWater(signerAddress, 1);
          const paperPotInstance = signerInfo[signerAddress].paperPot;
          const tokenId = 1e6 + Number(index) + 1;
          await paperPotInstance.water([tokenId]);
          const growthLevelNew = await paperPot.getGrowthLevel(tokenId);
          if (growthLevelNew.lt(10000)) {
            // Should not allow harvesting in this case.
            await expect(paperPotInstance.harvest(tokenId)).to.be.revertedWith("PaperPot: Not eligible for harvest");
            expect(growthLevelNew).to.be.gte(growthLevels[index].add(200));
            expect(growthLevelNew).to.be.lte(growthLevels[index].add(350));
          }
          growthLevels[index] = growthLevelNew;
          // console.log(growthLevels.map(g => g.toNumber()));
        }
      //   await signer1PaperPot.water([1e6 + 1]);
      //   count++;
      //   const growthLevelNew = await paperPot.getGrowthLevel(1e6 + 1);
      //   if (growthLevelNew.lt(10000)) {
      //     expect(growthLevelNew).to.be.gte(growthLevel.add(200));
      //     expect(growthLevelNew).to.be.lte(growthLevel.add(350));
      //   }
      //   growthLevel = growthLevelNew;
      //   // console.log(count, growthLevel.toNumber());
      }
      expect(growthLevels[0]).to.equal(10000);
      expect(growthLevels[1]).to.equal(10000);
      expect(growthLevels[2]).to.equal(10000);
      expect(growthLevels[3]).to.equal(10000);
      expect(growthLevels[4]).to.equal(10000);

      // It should not allow harvesting from admin
      for (let tokenId = 1e6 + 1; tokenId <= 1e6 + 5; tokenId++) {
        await expect(paperPot.harvest(tokenId)).to.be.revertedWith("PaperPot: Potted plant not owned by sender");
      }
      // It should not allow harvesting from another signer
      await expect(signerInfo[signer2.address].paperPot.harvest(1e6 + 1)).to.be.revertedWith("PaperPot: Potted plant not owned by sender");
      await expect(signerInfo[signer1.address].paperPot.harvest(1e6 + 2)).to.be.revertedWith("PaperPot: Potted plant not owned by sender");
      await expect(signerInfo[signer3.address].paperPot.harvest(1e6 + 3)).to.be.revertedWith("PaperPot: Potted plant not owned by sender");
      await expect(signerInfo[signer1.address].paperPot.harvest(1e6 + 4)).to.be.revertedWith("PaperPot: Potted plant not owned by sender");
      await expect(signerInfo[signer2.address].paperPot.harvest(1e6 + 5)).to.be.revertedWith("PaperPot: Potted plant not owned by sender");

      // It should fail if the token does not exist
      await expect(signerInfo[signer2.address].paperPot.harvest(1e6 + 6)).to.be.revertedWith("PaperPot: Not eligible for harvest");

      const balances: BigNumber[] = [];
      const uris: any[] = [];
      balances[0] = await paperPot.balanceOf(signer1.address, 2e6 + 1);
      balances[1] = await paperPot.balanceOf(signer2.address, 2e6 + 2);
      balances[2] = await paperPot.balanceOf(signer2.address, 2e6 + 3);
      balances[3] = await paperPot.balanceOf(signer3.address, 2e6 + 4);
      balances[4] = await paperPot.balanceOf(signer3.address, 2e6 + 5);
      expect(balances).to.deep.equal([Zero, Zero, Zero, Zero, Zero]);

      // Harvest the power shrub
      await signerInfo[signer1.address].paperPot.harvest(1e6 + 1);
      // Harvest the hope shrub
      await signerInfo[signer2.address].paperPot.harvest(1e6 + 2);
      // Harvest the passion shrub
      await signerInfo[signer2.address].paperPot.harvest(1e6 + 3);
      // Harvest a wonder shrub
      await signerInfo[signer3.address].paperPot.harvest(1e6 + 4);
      // Harvest a wonder shrub
      await signerInfo[signer3.address].paperPot.harvest(1e6 + 5);
      
      balances[0] = await paperPot.balanceOf(signer1.address, 2e6 + 1);
      balances[1] = await paperPot.balanceOf(signer2.address, 2e6 + 2);
      balances[2] = await paperPot.balanceOf(signer2.address, 2e6 + 3);
      balances[3] = await paperPot.balanceOf(signer3.address, 2e6 + 4);
      balances[4] = await paperPot.balanceOf(signer3.address, 2e6 + 5);
      expect(balances).to.deep.equal([One, One, One, One, One]);

      uris[0] = await paperPot.uri(2e6 + 1);
      uris[1] = await paperPot.uri(2e6 + 2);
      uris[2] = await paperPot.uri(2e6 + 3);
      uris[3] = await paperPot.uri(2e6 + 4);
      uris[4] = await paperPot.uri(2e6 + 5);
      expect(uris[0]).to.equal('http://test.xyz/power');
      expect(uris[1]).to.equal('http://test.xyz/hope');
      expect(uris[2]).to.equal('http://test.xyz/passion');
      expect(uris[3]).to.equal('http://test.xyz/wonder');
      expect(uris[4]).to.equal('http://test.xyz/wonder');

      // Update 2 of the uris and expect that they update but not the rest
      await paperPot.setURI(2e6 + 2, "http://test.xyz/67")
      await paperPot.setURI(2e6 + 4, "http://test.xyz/1500")

      uris[0] = await paperPot.uri(2e6 + 1);
      uris[1] = await paperPot.uri(2e6 + 2);
      uris[2] = await paperPot.uri(2e6 + 3);
      uris[3] = await paperPot.uri(2e6 + 4);
      uris[4] = await paperPot.uri(2e6 + 5);
      expect(uris[0]).to.equal('http://test.xyz/power');
      expect(uris[1]).to.equal('http://test.xyz/67');
      expect(uris[2]).to.equal('http://test.xyz/passion');
      expect(uris[3]).to.equal('http://test.xyz/1500');
      expect(uris[4]).to.equal('http://test.xyz/wonder');

      // Change the rest and revert the other two
      await paperPot.setURI(2e6 + 1, "http://test.xyz/3")
      await paperPot.setURI(2e6 + 2, "")
      await paperPot.setURI(2e6 + 3, "http://test.xyz/667")
      await paperPot.setURI(2e6 + 4, "")
      await paperPot.setURI(2e6 + 5, "http://test.xyz/6667")
      uris[0] = await paperPot.uri(2e6 + 1);
      uris[1] = await paperPot.uri(2e6 + 2);
      uris[2] = await paperPot.uri(2e6 + 3);
      uris[3] = await paperPot.uri(2e6 + 4);
      uris[4] = await paperPot.uri(2e6 + 5);
      expect(uris[0]).to.equal('http://test.xyz/3');
      expect(uris[1]).to.equal('http://test.xyz/hope');
      expect(uris[2]).to.equal('http://test.xyz/667');
      expect(uris[3]).to.equal('http://test.xyz/wonder');
      expect(uris[4]).to.equal('http://test.xyz/6667');

      // Change them all to custom
      await paperPot.setURI(2e6 + 2, "http://test.xyz/67b")
      await paperPot.setURI(2e6 + 4, "http://test.xyz/1500b")
      uris[0] = await paperPot.uri(2e6 + 1);
      uris[1] = await paperPot.uri(2e6 + 2);
      uris[2] = await paperPot.uri(2e6 + 3);
      uris[3] = await paperPot.uri(2e6 + 4);
      uris[4] = await paperPot.uri(2e6 + 5);
      expect(uris[0]).to.equal('http://test.xyz/3');
      expect(uris[1]).to.equal('http://test.xyz/67b');
      expect(uris[2]).to.equal('http://test.xyz/667');
      expect(uris[3]).to.equal('http://test.xyz/1500b');
      expect(uris[4]).to.equal('http://test.xyz/6667');

    });
  });

  describe("uri", async () => {
    // Default uri for 1-3
    // set the uri for 1-3 and see that they change
    // see that potted plant uri is generated
    // override the potted plant uri
    // harvest a shrub
    // uri for harvested should be default (test for all four types)
    // override the uri for the harvested shrubs and ensure that they look correct

  });

});
