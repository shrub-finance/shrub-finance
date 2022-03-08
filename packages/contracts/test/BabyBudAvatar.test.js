const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { Zero, One } = ethers.constants;

describe("BabyBudAvatar", () => {
  let owner, signer1, signer2, signer3, signer4;
  let babyBudAvatar;
  let signer1BabyBudAvatar, signer2BabyBudAvatar;
  let signer1PaperSeed, signer2PaperSeed;
  let signer1PaperPot, signer2PaperPot, signer3PaperPot, signer4PaperPot;
  let paperSeed;
  let paperPot;
  const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";
  const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    signer1 = signers[1];
    signer2 = signers[2];
    signer3 = signers[3];
    signer4 = signers[4];
    const BabyBudAvatar = await ethers.getContractFactory("BabyBudAvatar");
    babyBudAvatar = await BabyBudAvatar.deploy();
    signer1BabyBudAvatar = babyBudAvatar.connect(signer1);
    signer2BabyBudAvatar = babyBudAvatar.connect(signer2);
  });

  describe("Deploy Contract", async () => {
    it("should deploy", async () => {
      const name = await babyBudAvatar.name();
      const symbol = await babyBudAvatar.symbol();
      expect(name).to.equal("Baby Bud Avatars");
      expect(symbol).to.equal("BBA");
    });

    it("owner should be able to set the contractURI", async () => {
      const oldContractURI = await babyBudAvatar.contractURI();
      expect(oldContractURI).to.equal("");
      await babyBudAvatar.setContractURI("ipfs://XYZ");
      const newContractURI = await babyBudAvatar.contractURI();
      expect(newContractURI).to.equal("ipfs://XYZ");
    });

    it("non-owner should not be able to set the contractURI", async () => {
      const signer1BabyBudAvatar = babyBudAvatar.connect(signer1);
      const oldContractURI = await babyBudAvatar.contractURI();
      expect(oldContractURI).to.equal("");
      await expect(
        signer1BabyBudAvatar.setContractURI("ipfs://XYZ")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Admin Mint", async () => {
    let oneUri;
    let twoUris;
    let thressUris;
    let oneAddress;
    let twoAddresses;
    let threeAddress;
    beforeEach(() => {
      oneUri = ["uri1"];
      twoUris = ["uri1", "uri2"];
      thressUris = ["uri1", "uri2", "uri3"];
      oneAddress = [signer1.address];
      twoAddresses = [signer1.address, signer2.address];
      threeAddress = [signer1.address, signer2.address, signer3.address];
    });

    it("non-owner should not be able to mint", async () => {
      await expect(
        signer1BabyBudAvatar.adminMint(oneAddress, oneUri)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      const tokenIndex = await babyBudAvatar.tokenIndex();
      expect(tokenIndex).to.equal(0);
    });
    it("should not be able to mint with more uris than addresses", async () => {
      await expect(
        babyBudAvatar.adminMint(oneAddress, twoUris)
      ).to.be.revertedWith("Invalid input");
      const tokenIndex = await babyBudAvatar.tokenIndex();
      expect(tokenIndex).to.equal(0);
    });
    it("should not be able to mint with more addresses than uris", async () => {
      await expect(
        babyBudAvatar.adminMint(twoAddresses, oneUri)
      ).to.be.revertedWith("Invalid input");
      const tokenIndex = await babyBudAvatar.tokenIndex();
      expect(tokenIndex).to.equal(0);
    });
    it("should not be able to mint if the first uri is empty", async () => {
      await expect(
        babyBudAvatar.adminMint(threeAddress, ["", "uri2", "uri3"])
      ).to.be.revertedWith("invalid uri");
      const tokenIndex = await babyBudAvatar.tokenIndex();
      expect(tokenIndex).to.equal(0);
    });
    it("should not be able to mint if the second uri is empty", async () => {
      await expect(
        babyBudAvatar.adminMint(threeAddress, ["uri1", "", "uri3"])
      ).to.be.revertedWith("invalid uri");
      const tokenIndex = await babyBudAvatar.tokenIndex();
      expect(tokenIndex).to.equal(0);
    });
    it("should able to mint one", async () => {
      await babyBudAvatar.adminMint(oneAddress, oneUri);
      const tokenIndex = await babyBudAvatar.tokenIndex();
      const ownerOf = await babyBudAvatar.ownerOf(1);
      const tokenUri = await babyBudAvatar.tokenURI(1);
      expect(tokenIndex).to.equal(1);
      expect(ownerOf).to.equal(signer1.address);
      expect(tokenUri).to.equal("uri1");
    });
    it("should able to mint many", async () => {
      await babyBudAvatar.adminMint(threeAddress, thressUris);
      const tokenIndex = await babyBudAvatar.tokenIndex();
      const ownerOfOne = await babyBudAvatar.ownerOf(1);
      const ownerOfTwo = await babyBudAvatar.ownerOf(2);
      const ownerOfThree = await babyBudAvatar.ownerOf(3);
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      const tokenUriThree = await babyBudAvatar.tokenURI(3);
      expect(tokenIndex).to.equal(3);
      expect(ownerOfOne).to.equal(signer1.address);
      expect(ownerOfTwo).to.equal(signer2.address);
      expect(ownerOfThree).to.equal(signer3.address);
      expect(tokenUriOne).to.equal("uri1");
      expect(tokenUriTwo).to.equal("uri2");
      expect(tokenUriThree).to.equal("uri3");
    });
    it("should able to mint one and then many", async () => {
      await babyBudAvatar.adminMint(oneAddress, oneUri);
      await babyBudAvatar.adminMint(threeAddress, thressUris);
      const tokenIndex = await babyBudAvatar.tokenIndex();
      const ownerOfOne = await babyBudAvatar.ownerOf(1);
      const ownerOfTwo = await babyBudAvatar.ownerOf(2);
      const ownerOfThree = await babyBudAvatar.ownerOf(3);
      const ownerOfFour = await babyBudAvatar.ownerOf(4);
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      const tokenUriThree = await babyBudAvatar.tokenURI(3);
      const tokenUriFour = await babyBudAvatar.tokenURI(4);
      expect(tokenIndex).to.equal(4);
      expect(ownerOfOne).to.equal(signer1.address);
      expect(ownerOfTwo).to.equal(signer1.address);
      expect(ownerOfThree).to.equal(signer2.address);
      expect(ownerOfFour).to.equal(signer3.address);
      expect(tokenUriOne).to.equal("uri1");
      expect(tokenUriTwo).to.equal("uri1");
      expect(tokenUriThree).to.equal("uri2");
      expect(tokenUriFour).to.equal("uri3");
    });
  });

  describe("setTokenUris", async () => {
    let oneUri;
    let twoUris;
    let thressUris;
    let oneAddress;
    let twoAddresses;
    let threeAddress;
    beforeEach(async () => {
      oneUri = ["uri10"];
      twoUris = ["uri10", "uri20"];
      thressUris = ["uri10", "uri20", "uri30"];
      origThressUris = ["uri1", "uri2", "uri3"];
      oneAddress = [signer1.address];
      twoAddresses = [signer1.address, signer2.address];
      threeAddress = [signer1.address, signer2.address, signer3.address];
      await babyBudAvatar.adminMint(threeAddress, origThressUris);
    });
    it("non-owner should not be able to set token uris", async () => {
      await expect(
        signer1BabyBudAvatar.setTokenURIs([1], oneUri)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      expect(tokenUriOne).to.equal("uri1");
    });
    it("should not be able to set token uris with more uris than tokenIds", async () => {
      await expect(babyBudAvatar.setTokenURIs([1], twoUris)).to.be.revertedWith(
        "Invalid input"
      );
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      expect(tokenUriOne).to.equal("uri1");
    });
    it("should not be able to set token uris with more tokenIds than uris", async () => {
      await expect(
        babyBudAvatar.setTokenURIs([1, 2], oneUri)
      ).to.be.revertedWith("Invalid input");
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      expect(tokenUriOne).to.equal("uri1");
      expect(tokenUriTwo).to.equal("uri2");
    });
    it("should not be able to set token uris if the first uri is empty", async () => {
      await expect(
        babyBudAvatar.setTokenURIs([1, 2], ["", "uri20"])
      ).to.be.revertedWith("invalid uri");
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      expect(tokenUriOne).to.equal("uri1");
      expect(tokenUriTwo).to.equal("uri2");
    });
    it("should not be able to set token uris if the second uri is empty", async () => {
      await expect(
        babyBudAvatar.setTokenURIs([1, 2], ["uri10", ""])
      ).to.be.revertedWith("invalid uri");
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      expect(tokenUriOne).to.equal("uri1");
      expect(tokenUriTwo).to.equal("uri2");
    });
    it("should able to set one token uri", async () => {
      await babyBudAvatar.setTokenURIs([2], ["uri20"]);
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      const tokenUriThree = await babyBudAvatar.tokenURI(3);
      expect(tokenUriOne).to.equal("uri1");
      expect(tokenUriTwo).to.equal("uri20");
      expect(tokenUriThree).to.equal("uri3");
    });
    it("should able to set many token uris", async () => {
      await babyBudAvatar.setTokenURIs([1, 2, 3], ["uri10", "uri20", "uri30"]);
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      const tokenUriThree = await babyBudAvatar.tokenURI(3);
      expect(tokenUriOne).to.equal("uri10");
      expect(tokenUriTwo).to.equal("uri20");
      expect(tokenUriThree).to.equal("uri30");
    });
    it("should able to set the same token uri multiple times", async () => {
      await babyBudAvatar.setTokenURIs([1, 2, 3], ["uri10", "uri20", "uri30"]);
      const tokenUriOne = await babyBudAvatar.tokenURI(1);
      const tokenUriTwo = await babyBudAvatar.tokenURI(2);
      const tokenUriThree = await babyBudAvatar.tokenURI(3);
      expect(tokenUriOne).to.equal("uri10");
      expect(tokenUriTwo).to.equal("uri20");
      expect(tokenUriThree).to.equal("uri30");
      await babyBudAvatar.setTokenURIs([3], ["uri33"]);
      const tokenUriOneNext = await babyBudAvatar.tokenURI(1);
      const tokenUriTwoNext = await babyBudAvatar.tokenURI(2);
      const tokenUriThreeNext = await babyBudAvatar.tokenURI(3);
      expect(tokenUriOneNext).to.equal("uri10");
      expect(tokenUriTwoNext).to.equal("uri20");
      expect(tokenUriThreeNext).to.equal("uri33");
    });
  });

  describe("burn", async () => {
    beforeEach(async () => {
      const origThressUris = ["uri1", "uri2", "uri3"];
      const threeAddress = [signer1.address, signer2.address, signer3.address];
      await babyBudAvatar.adminMint(threeAddress, origThressUris);
    });
    it("should not allow even the contract owner to burn if not the token holder", async () => {
      await expect(babyBudAvatar.burn(1)).to.be.revertedWith(
        "ERC721Burnable: caller is not owner nor approved"
      );
      const ownerOfOne = await babyBudAvatar.ownerOf(1);
      expect(ownerOfOne).to.equal(signer1.address);
    });
    it("should allow the token holder to burn", async () => {
      await signer1BabyBudAvatar.burn(1);
      await expect(babyBudAvatar.ownerOf(1)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
    });
  });

  describe("general", async () => {
    beforeEach(async () => {
      const origThressUris = ["uri1", "uri2", "uri3"];
      const threeAddress = [signer1.address, signer2.address, signer3.address];
      await babyBudAvatar.adminMint(threeAddress, origThressUris);
    });
    it("non-token holder should not be able to transfer", async () => {
      await expect(
        babyBudAvatar["safeTransferFrom(address,address,uint256)"](
          signer1.address,
          signer2.address,
          1
        )
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
      const ownerOfOne = await babyBudAvatar.ownerOf(1);
      expect(ownerOfOne).to.equal(signer1.address);
    });
    it("token holder should be able to transfer", async () => {
      await signer1BabyBudAvatar["safeTransferFrom(address,address,uint256)"](
        signer1.address,
        signer2.address,
        1
      );
      const ownerOfOne = await babyBudAvatar.ownerOf(1);
      expect(ownerOfOne).to.equal(signer2.address);
    });
    it("non-token holder should not be able to approve", async () => {
      await expect(
        babyBudAvatar.approve(signer2.address, 1)
      ).to.be.revertedWith(
        "ERC721: approve caller is not owner nor approved for all"
      );
      const approved = await babyBudAvatar.getApproved(1);
      expect(approved).to.equal(ethers.constants.AddressZero);
    });
    it("token holder should be able to approve", async () => {
      await signer1BabyBudAvatar.approve(signer2.address, 1);
      const approved = await babyBudAvatar.getApproved(1);
      expect(approved).to.equal(signer2.address);
    });
    it("token holder should be able to set approval for all", async () => {
      await signer1BabyBudAvatar.setApprovalForAll(signer2.address, true);
      const isApprovedForAll = await babyBudAvatar.isApprovedForAll(
        signer1.address,
        signer2.address
      );
      expect(isApprovedForAll).to.equal(true);
    });
  });
});
