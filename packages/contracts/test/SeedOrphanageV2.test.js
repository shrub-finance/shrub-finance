const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

describe("SeedOrphanage", () => {
  let owner, signer1, signer2, signer3, signer4;
  let signer1SeedOrphanage,
    signer2SeedOrphanage,
    signer3SeedOrphanage,
    signer4SeedOrphanage;
  let signer1PaperSeed, signer2PaperSeed;
  let paperSeed, seedOrphanage;

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
    const SeedOrphanage = await ethers.getContractFactory("SeedOrphanageV2");
    seedOrphanage = await SeedOrphanage.deploy(paperSeed.address);
    await seedOrphanage.deployed();
    signer1PaperSeed = paperSeed.connect(signer1);
    signer2PaperSeed = paperSeed.connect(signer2);
    signer1SeedOrphanage = seedOrphanage.connect(signer1);
    signer2SeedOrphanage = seedOrphanage.connect(signer2);
    signer3SeedOrphanage = seedOrphanage.connect(signer3);
    signer4SeedOrphanage = seedOrphanage.connect(signer4);
  });

  describe("registering", async () => {
    it("should block registering if user does not have a seed nft", async () => {
      await expect(signer1SeedOrphanage.register()).to.be.revertedWith(
        "Account holds no seed NFTs"
      );
      const isRegistered = await seedOrphanage.isRegistered(signer1.address);
      expect(isRegistered).to.equal(false);
    });
    it("should allow registering if user does have a seed nft for non-owner", async () => {
      const isRegisteredBefore = await seedOrphanage.isRegistered(
        signer1.address
      );
      expect(isRegisteredBefore).to.equal(false);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      const registerTx = await signer1SeedOrphanage.register();
      const registerReceipt = await registerTx.wait();
      const registerEvent = registerReceipt.events.find(
        (event) => event.event === "Register"
      );
      expect(registerEvent).to.exist;
      expect(registerEvent.args.user).to.equal(signer1.address);
      const isRegisteredAfter = await seedOrphanage.isRegistered(
        signer1.address
      );
      expect(isRegisteredAfter).to.equal(true);
    });
    it("should not allow registering multiple times", async () => {
      const isRegisteredBefore = await seedOrphanage.isRegistered(
        signer1.address
      );
      expect(isRegisteredBefore).to.equal(false);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      await signer1SeedOrphanage.register();
      await expect(signer1SeedOrphanage.register()).to.be.revertedWith(
        "Account already registered"
      );
      const isRegisteredAfter = await seedOrphanage.isRegistered(
        signer1.address
      );
      expect(isRegisteredAfter).to.equal(true);
    });
    it("should not allow register to be cleared by non-owner", async () => {
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer2.address,
        2
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer3.address,
        4
      );
      await signer1SeedOrphanage.register();
      await signer2SeedOrphanage.register();
      await signer3SeedOrphanage.register();
      const registeredListBefore = await seedOrphanage.getRegister();
      expect(registeredListBefore.length).to.equal(3);
      await expect(signer1SeedOrphanage.clearRegister()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      const registeredListAfter = await seedOrphanage.getRegister();
      expect(registeredListAfter.length).to.equal(3);
    });
    it("should allow register to be cleared by owner", async () => {
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer2.address,
        2
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer3.address,
        4
      );
      await signer1SeedOrphanage.register();
      await signer2SeedOrphanage.register();
      await signer3SeedOrphanage.register();
      const registeredListBefore = await seedOrphanage.getRegister();
      expect(registeredListBefore.length).to.equal(3);
      let isRegistered1 = await seedOrphanage.isRegistered(signer1.address);
      let isRegistered2 = await seedOrphanage.isRegistered(signer2.address);
      let isRegistered3 = await seedOrphanage.isRegistered(signer3.address);
      expect(isRegistered1).to.equal(true);
      expect(isRegistered2).to.equal(true);
      expect(isRegistered3).to.equal(true);
      const clearTx = await seedOrphanage.clearRegister();
      const clearReceipt = await clearTx.wait();
      const clearEvent = clearReceipt.events.find(
        (event) => event.event === "ClearRegister"
      );
      expect(clearEvent).to.exist;
      const registeredListAfter = await seedOrphanage.getRegister();
      expect(registeredListAfter.length).to.equal(0);
      isRegistered1 = await seedOrphanage.isRegistered(signer1.address);
      isRegistered2 = await seedOrphanage.isRegistered(signer2.address);
      isRegistered3 = await seedOrphanage.isRegistered(signer3.address);
      expect(isRegistered1).to.equal(false);
      expect(isRegistered2).to.equal(false);
      expect(isRegistered3).to.equal(false);
    });
  });

  describe("seed management", async () => {
    beforeEach(async () => {
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
    });
    it("should not allow non-owner to add a seed", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await signer1PaperSeed.setApprovalForAll(seedOrphanage.address, true);
      await expect(signer1SeedOrphanage.addSeed(1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(0);
    });
    it("should not allow owner to add a seed he does not control", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await expect(seedOrphanage.addSeed(1)).to.be.revertedWith(
        "ERC721: transfer caller is not owner nor approved"
      );
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(0);
    });
    it("should not allow owner to add the same seed without approving transaction", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await expect(seedOrphanage.addSeed(2)).to.be.revertedWith(
        "ERC721: transfer caller is not owner nor approved"
      );
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(0);
    });
    it("should allow owner to add a seed", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      const addTx = await seedOrphanage.addSeed(2);
      const addReceipt = await addTx.wait();
      const addEvent = addReceipt.events.find((event) => event.event === "Add");
      expect(addEvent).to.exist;
      expect(addEvent.args.tokenId).to.equal(2);
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(1);
    });
    it("should not allow owner to add the same seed multiple times", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await seedOrphanage.addSeed(2);
      await expect(seedOrphanage.addSeed(2)).to.be.revertedWith(
        "ERC721: transfer of token that is not own"
      );
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(1);
    });
    it("should allow owner to add many seeds with subsequent calls", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await seedOrphanage.addSeed(2);
      await seedOrphanage.addSeed(3);
      await seedOrphanage.addSeed(4);
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(3);
    });
    it("should not allow removal of non-present seeds", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await seedOrphanage.addSeed(2);
      await seedOrphanage.addSeed(3);
      await seedOrphanage.addSeed(4);
      await expect(seedOrphanage.removeSeed(1)).to.be.revertedWith(
        "NFT not present in orphanage"
      );
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(3);
    });
    it("should not allow non-owner to remove seeds", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await seedOrphanage.addSeed(2);
      await seedOrphanage.addSeed(3);
      await seedOrphanage.addSeed(4);
      await expect(signer1SeedOrphanage.removeSeed(2)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(3);
    });
    it("should allow owner to remove seeds", async () => {
      const seedsBefore = await seedOrphanage.getSeeds();
      expect(seedsBefore.length).to.equal(0);
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await seedOrphanage.addSeed(2);
      await seedOrphanage.addSeed(3);
      await seedOrphanage.addSeed(4);
      const removeTx = await seedOrphanage.removeSeed(2);
      const removeReceipt = await removeTx.wait();
      const removeEvent = removeReceipt.events.find(
        (event) => event.event === "Remove"
      );
      expect(removeEvent).to.exist;
      expect(removeEvent.args.tokenId).to.equal(2);
      const seedsAfter = await seedOrphanage.getSeeds();
      expect(seedsAfter.length).to.equal(2);
      await seedOrphanage.removeSeed(3);
      await seedOrphanage.removeSeed(4);
      const seedsAfterAfter = await seedOrphanage.getSeeds();
      expect(seedsAfterAfter.length).to.equal(0);
      const ownerOfTwo = await paperSeed.ownerOf(2);
      const ownerOfThree = await paperSeed.ownerOf(3);
      expect(ownerOfTwo).to.equal(owner.address);
      expect(ownerOfThree).to.equal(owner.address);
    });
  });

  describe("delivery", async () => {
    beforeEach(async () => {
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      await seedOrphanage.addSeed(1);
      await seedOrphanage.addSeed(2);
      await seedOrphanage.addSeed(3);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer2.address,
        4
      );
      await signer2SeedOrphanage.register();
    });
    it("should not allow deliver to be called by a non-owner", async () => {
      await expect(
        signer1SeedOrphanage.deliver(1, signer2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should not allow deliver to a non-registered address", async () => {
      await expect(
        seedOrphanage.deliver(1, signer1.address)
      ).to.be.revertedWith("account is not on the registration list");
    });
    it("should not allow deliver to an address with no seed nfts", async () => {
      await signer2PaperSeed["safeTransferFrom(address,address,uint256)"](
        signer2.address,
        signer3.address,
        4
      );
      await expect(
        seedOrphanage.deliver(1, signer2.address)
      ).to.be.revertedWith("Account holds no seed NFTs");
    });
    it("should allow deliver to a valid address", async () => {
      const beforeOwner = await paperSeed.ownerOf(1);
      expect(beforeOwner).to.equal(seedOrphanage.address);
      const deliverTx = await seedOrphanage.deliver(1, signer2.address);
      const deliverReceipt = await deliverTx.wait();
      const deliverEvent = deliverReceipt.events.find(
        (event) => event.event === "Deliver"
      );
      expect(deliverEvent).to.exist;
      expect(deliverEvent.args.tokenId).to.equal(1);
      expect(deliverEvent.args.user).to.equal(signer2.address);
      const afterOwner = await paperSeed.ownerOf(1);
      expect(afterOwner).to.equal(signer2.address);
    });
  });

  describe("view", async () => {
    it("should have constant gas at scale", async () => {
      const signers = await ethers.getSigners();
      for (let i = 5; i < 20; i++) {
        await paperSeed.claimReserve(i);
      }
      for (let i = 1; i < 20; i++) {
        await paperSeed["safeTransferFrom(address,address,uint256)"](
          owner.address,
          signers[i].address,
          i
        );
        const signerSeedOrphanage = seedOrphanage.connect(signers[i]);
        await signerSeedOrphanage.register();
      }
      const register = await seedOrphanage.getRegister();
      expect(register.length).to.equal(19);
    });
    it("getRegister should work", async () => {
      let register = await seedOrphanage.getRegister();
      expect(register).to.deep.equal([]);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer2.address,
        2
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer3.address,
        3
      );
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer4.address,
        4
      );
      await signer1SeedOrphanage.register();
      register = await seedOrphanage.getRegister();
      expect(register).to.deep.equal([signer1.address]);
      await signer3SeedOrphanage.register();
      register = await seedOrphanage.getRegister();
      expect(register).to.deep.equal([signer1.address, signer3.address]);
      await signer2SeedOrphanage.register();
      register = await seedOrphanage.getRegister();
      expect(register).to.deep.equal([
        signer1.address,
        signer3.address,
        signer2.address,
      ]);
      await signer4SeedOrphanage.register();
      await seedOrphanage.clearRegister();
      register = await seedOrphanage.getRegister();
      expect(register).to.deep.equal([]);
    });
    it("getSeeds should work", async () => {
      await paperSeed.setApprovalForAll(seedOrphanage.address, true);
      let seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([]);
      // transfer seed
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      // register
      await signer1SeedOrphanage.register();
      // add seed
      await seedOrphanage.addSeed(3);
      seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([BigNumber.from(3)]);
      // add another seed
      await seedOrphanage.addSeed(2);
      seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([BigNumber.from(3), BigNumber.from(2)]);
      await seedOrphanage.addSeed(4);
      seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([
        BigNumber.from(3),
        BigNumber.from(2),
        BigNumber.from(4),
      ]);
      // remove seed
      await seedOrphanage.removeSeed(3);
      seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([BigNumber.from(4), BigNumber.from(2)]);
      // add seed
      await seedOrphanage.addSeed(3);
      seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([
        BigNumber.from(4),
        BigNumber.from(2),
        BigNumber.from(3),
      ]);
      // deliver seed
      await seedOrphanage.deliver(2, signer1.address);
      seeds = await seedOrphanage.getSeeds();
      expect(seeds).to.deep.equal([BigNumber.from(4), BigNumber.from(3)]);
    });
  });
});
