const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { Zero, One } = ethers.constants;

describe("PaperPot", () => {
  let owner, signer1, signer2, signer3, signer4;
  let signer1PaperSeed, signer2PaperSeed;
  let signer1PaperPot, signer2PaperPot, signer3PaperPot, signer4PaperPot;
  let paperSeed;
  let paperPot;
  const SAD_SEEDS = [11, 13, 15, 17, 19];
  const BASE_URI = "http://test.xyz";
  const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";
  const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    signer1 = signers[1];
    signer2 = signers[2];
    signer3 = signers[3];
    signer4 = signers[4];
    const maxIndex = 20;
    const merkleRoot =
      "0x618ddd3b36d40f8d9b942cf72c5e92615e6594b3e8b537082310ae48e51cd059";
    const baseUri = "https://shrub.finance/";
    const PaperSeed = await ethers.getContractFactory("PaperSeed");
    paperSeed = await PaperSeed.deploy(maxIndex, merkleRoot, baseUri);
    await paperSeed.deployed();
    await paperSeed.claimReserve(1);
    await paperSeed.claimReserve(2);
    await paperSeed.claimReserve(3);
    await paperSeed.claimReserve(4);
    const PaperPot = await ethers.getContractFactory("PaperPot");
    paperPot = await PaperPot.deploy([paperSeed.address], SAD_SEEDS, BASE_URI);

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

  describe("plant", async () => {
    beforeEach(async () => {
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        3
      );
    });
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
      expect(lastWatering).to.equal(0);
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
      expect(lastWateringOne).to.equal(0);
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
      expect(lastWateringOne).to.equal(0);
      expect(plantedSeedTwo).to.equal(4);
      expect(growthLevelTwo).to.equal(0);
      expect(lastWateringTwo).to.equal(0);
    });
  });
});
