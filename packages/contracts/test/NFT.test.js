const PaperSeed = artifacts.require("PaperSeed");

const { expect } = require("chai");
const { ethers } = require("hardhat");

const merkleData = {
  merkleRoot:
    "0x618ddd3b36d40f8d9b942cf72c5e92615e6594b3e8b537082310ae48e51cd059",
  tokenTotal: "0x0a",
  claims: {
    "0x31F837c2608143fC3A96aea05dc71AC8D6130c8a": {
      index: 0,
      amount: "0x04",
      proof: [
        "0x8c04a75065a5d10799ff50cf0e52baf2950cff47056f6e9287fc0e4f49374a5a",
        "0x49dac8941ba9bb1d705f0c148760e0b5a1da76b8726eaa9d9cddda4ef8106188",
      ],
    },
    "0x926D1de308513378fe5aFEbFaC77eaE14922bE98": {
      index: 1,
      amount: "0x01",
      proof: [
        "0xcb1815201ba88f8c779c33976cda40061a90f8e10f2106d9426152fde2dfda6a",
        "0x89b3a4652f32c078ccf97ba89bb125437209d862ffc34e63eb2fb667764350bd",
      ],
    },
    "0x9B8ea3F3F5eb77134CE2B821535b80F2852299d6": {
      index: 2,
      amount: "0x02",
      proof: [
        "0x92a6e4c532b8b56829091226ec11c446997c71f802311542cab4e25a73c129e6",
        "0x89b3a4652f32c078ccf97ba89bb125437209d862ffc34e63eb2fb667764350bd",
      ],
    },
    "0xa57D516331B3E7e4A3De905a24464353A380944F": {
      index: 3,
      amount: "0x03",
      proof: [
        "0x842fd73fe9a7995eddc968b0d9e8a4b87ed8521e048e5b86ee798dd214ab70cc",
        "0x49dac8941ba9bb1d705f0c148760e0b5a1da76b8726eaa9d9cddda4ef8106188",
      ],
    },
  },
};

describe("PaperSeed", () => {
  const maxIndex = 4;
  const merkleRoot =
    "0x618ddd3b36d40f8d9b942cf72c5e92615e6594b3e8b537082310ae48e51cd059";
  const baseUri = "https://shrub.finance/";
  let signer0, signer1, signer2, signer3, signer4;
  let paperSeed;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    signer0 = signers[0];
    signer1 = signers[1];
    signer2 = signers[2];
    signer3 = signers[3];
    signer4 = signers[4];
    const PaperSeed = await ethers.getContractFactory("PaperSeed");
    paperSeed = await PaperSeed.deploy(maxIndex, merkleRoot, baseUri);
    await paperSeed.deployed();
  });

  it("should deploy", async () => {
    const currentCount = await paperSeed.currentCount();
    const reserveCount = await paperSeed.reserveCount();
    const maxIndex = await paperSeed.MAX_INDEX();
    const merkleRoot = await paperSeed.merkleRoot();
    expect(currentCount).to.equal(0);
    expect(reserveCount).to.equal(0);
    expect(maxIndex).to.equal(4);
    expect(merkleRoot).to.equal(
      "0x618ddd3b36d40f8d9b942cf72c5e92615e6594b3e8b537082310ae48e51cd059"
    );

    const mint = await paperSeed.claimReserve(0);
    const tokenIndex = await mint.wait();
    const tokenUri = await paperSeed.tokenURI(0);
    expect(tokenUri).to.equal("https://shrub.finance/0");
  });

  it("owner should be able to set the contractURI", async () => {
    const ownerPaperSeed = paperSeed.connect(signer0);
    const oldContractURI = await paperSeed.contractURI();
    expect(oldContractURI).to.equal("");
    await ownerPaperSeed.setContractURI("ipfs://XYZ");
    const newContractURI = await paperSeed.contractURI();
    expect(newContractURI).to.equal("ipfs://XYZ");
  });

  it("non-owner should not be able to set the contractURI", async () => {
    const signer1PaperSeed = paperSeed.connect(signer1);
    const oldContractURI = await paperSeed.contractURI();
    expect(oldContractURI).to.equal("");
    await expect(
      signer1PaperSeed.setContractURI("ipfs://XYZ")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should mint for a valid merkleProof", async () => {
    const { index, amount, proof } = merkleData.claims[signer1.address];
    const signer1PaperSeed = paperSeed.connect(signer1);
    await signer1PaperSeed.claim(index, amount, proof);
    const ownerOf = await paperSeed.ownerOf(amount);
    expect(ownerOf).to.equal(signer1.address);
  });

  it("should not allow minting for another user but allow for whitelisted user", async () => {
    const { index, amount, proof } = merkleData.claims[signer4.address];
    for (let signer of [signer0, signer1, signer2, signer3]) {
      const signerXPaperSeed = paperSeed.connect(signer);
      await expect(
        signerXPaperSeed.claim(index, amount, proof)
      ).to.be.revertedWith("MerkleDistributor: Invalid proof.");
    }
    const signer4PaperSeed = paperSeed.connect(signer4);
    await signer4PaperSeed.claim(index, amount, proof);
    const ownerOf = await paperSeed.ownerOf(amount);
    expect(ownerOf).to.equal(signer4.address);
  });

  it("should not claiming twice", async () => {
    const { index, amount, proof } = merkleData.claims[signer4.address];
    const signer4PaperSeed = paperSeed.connect(signer4);
    await signer4PaperSeed.claim(index, amount, proof);
    const ownerOf = await paperSeed.ownerOf(amount);
    expect(ownerOf).to.equal(signer4.address);
    await expect(
      signer4PaperSeed.claim(index, amount, proof)
    ).to.be.revertedWith("MerkleDistributor: Drop already claimed.");
  });

  it("should claim for all accounts", async () => {
    await expect(paperSeed.ownerOf(1)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(paperSeed.ownerOf(2)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(paperSeed.ownerOf(3)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(paperSeed.ownerOf(4)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    for (let signer of [signer1, signer2, signer3, signer4]) {
      const { index, amount, proof } = merkleData.claims[signer.address];
      const signerXPaperSeed = paperSeed.connect(signer);
      await signerXPaperSeed.claim(index, amount, proof);
    }
    const ownerOf1 = await paperSeed.ownerOf(1);
    const ownerOf2 = await paperSeed.ownerOf(2);
    const ownerOf3 = await paperSeed.ownerOf(3);
    const ownerOf4 = await paperSeed.ownerOf(4);
    expect(ownerOf1).to.equal("0x926D1de308513378fe5aFEbFaC77eaE14922bE98");
    expect(ownerOf2).to.equal("0x9B8ea3F3F5eb77134CE2B821535b80F2852299d6");
    expect(ownerOf3).to.equal("0xa57D516331B3E7e4A3De905a24464353A380944F");
    expect(ownerOf4).to.equal("0x31F837c2608143fC3A96aea05dc71AC8D6130c8a");
  });

  it("other user should not be able to transfer ownership", async () => {
    const { index, amount, proof } = merkleData.claims[signer1.address];
    const tokenId = amount;
    const signer1PaperSeed = paperSeed.connect(signer1);
    const signer2PaperSeed = paperSeed.connect(signer2);
    await signer1PaperSeed.claim(index, tokenId, proof);
    const ownerOf = await paperSeed.ownerOf(tokenId);
    expect(ownerOf).to.equal(signer1.address);
    await expect(
      signer2PaperSeed["safeTransferFrom(address,address,uint256)"](
        signer1.address,
        signer2.address,
        tokenId
      )
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });

  it("user should be able to transfer ownership", async () => {
    const { index, amount, proof } = merkleData.claims[signer1.address];
    const tokenId = amount;
    const signer1PaperSeed = paperSeed.connect(signer1);
    await signer1PaperSeed.claim(index, tokenId, proof);
    const ownerOf = await paperSeed.ownerOf(tokenId);
    expect(ownerOf).to.equal(signer1.address);
    await signer1PaperSeed["safeTransferFrom(address,address,uint256)"](
      signer1.address,
      signer2.address,
      tokenId
    );
    const ownerOfAfter = await paperSeed.ownerOf(tokenId);
    expect(ownerOfAfter).to.equal(signer2.address);
  });

  it("owner should be able to claimReserve", async () => {
    const ownerPaperSeed = paperSeed.connect(signer0);
    await ownerPaperSeed.claimReserve(1);
    const ownerOf = await paperSeed.ownerOf(1);
    expect(ownerOf).to.equal(signer0.address);
  });

  it("owner should be able to claimReserve for the last index, but not the index after", async () => {
    const ownerPaperSeed = paperSeed.connect(signer0);
    await ownerPaperSeed.claimReserve(3);
    await ownerPaperSeed.claimReserve(4);
    const ownerOf3 = await paperSeed.ownerOf(3);
    const ownerOf4 = await paperSeed.ownerOf(3);
    await expect(ownerPaperSeed.claimReserve(5)).to.be.revertedWith(
      "ClaimReserve: index out of range"
    );
    const reserveCount = await paperSeed.reserveCount();
    expect(ownerOf3).to.equal(signer0.address);
    expect(ownerOf4).to.equal(signer0.address);
    expect(reserveCount).to.equal(2);
  });

  it("owner should not be able to claimReserve twice for same token", async () => {
    const ownerPaperSeed = paperSeed.connect(signer0);
    await ownerPaperSeed.claimReserve(1);
    await expect(ownerPaperSeed.claimReserve(1)).to.be.revertedWith(
      "MerkleDistributor: Drop already claimed."
    );
  });

  it("owner should not be able to claimReserve for an already claimed token", async () => {
    const { index, amount, proof } = merkleData.claims[signer1.address];
    const tokenId = amount;
    const signer1PaperSeed = paperSeed.connect(signer1);
    await signer1PaperSeed.claim(index, tokenId, proof);
    const ownerOf = await paperSeed.ownerOf(tokenId);
    expect(ownerOf).to.equal(signer1.address);
    const ownerPaperSeed = paperSeed.connect(signer0);
    await expect(ownerPaperSeed.claimReserve(1)).to.be.revertedWith(
      "MerkleDistributor: Drop already claimed."
    );
  });

  it("non owner should not be able to claimReserve", async () => {
    const signer1PaperSeed = paperSeed.connect(signer1);
    await expect(signer1PaperSeed.claimReserve(1)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });
});
