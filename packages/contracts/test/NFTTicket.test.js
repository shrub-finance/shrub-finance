const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { Zero, One } = ethers.constants;

function toEthDate(date) {
  // return ethers.BigNumber.from(Math.round(Number(date) / 1000));
  return Math.round(Number(date) / 1000);
}

function fromEthDate(ethDate) {
  return new Date(ethDate * 1000);
}

describe("NFTTicket", () => {
  let owner, signer1, signer2, signer3, signer4;
  let weth, nftTicket;
  let signer1NftTicket, signer1Weth;
  let signer2NftTicket, signer2Weth;
  let signer3NftTicket, signer3Weth;
  let signer4NftTicket, signer4Weth;
  let now = new Date();
  let baseTicketData;
  let oneDayAgo = new Date(new Date().setUTCDate(now.getUTCDate() - 1));
  let oneDayFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 1));
  let twoDaysFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 2));
  let threeDaysFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 3));
  // let signer1PaperSeed, signer2PaperSeed;
  // let signer1PaperPot, signer2PaperPot, signer3PaperPot, signer4PaperPot;
  // let paperSeed;
  // let paperPot;
  // let paperPotMetadata;
  const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";
  const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    signer1 = signers[1];
    signer2 = signers[2];
    signer3 = signers[3];
    signer4 = signers[4];
    baseTicketData = {
      controller: signer1.address,
      recipient: signer2.address,
      contractAddress: signer3.address,
      startDate: toEthDate(now),
      endDate: toEthDate(oneDayFromNow),
      mintStartDate: toEthDate(twoDaysFromNow),
      mintEndDate: toEthDate(threeDaysFromNow),
      mintPrice: ethers.constants.WeiPerEther.mul(10).div(1000),
      maxMintAmountPlusOne: 11,
      redeemPrice: ethers.constants.WeiPerEther.mul(15).div(1000),
      maxSupply: 1000,
      active: false,
      paused: false,
    };
    const NFTTicket = await ethers.getContractFactory("NFTTicket");
    const WETH = await ethers.getContractFactory("ERC20Token");
    weth = await WETH.deploy(
      "Wrapped Ether",
      "WETH",
      ethers.constants.WeiPerEther.mul(100)
    );
    nftTicket = await NFTTicket.deploy(weth.address);
    signer1Weth = weth.connect(signer1);
    signer1NftTicket = nftTicket.connect(signer1);
    signer2Weth = weth.connect(signer2);
    signer2NftTicket = nftTicket.connect(signer2);
    signer3Weth = weth.connect(signer3);
    signer3NftTicket = nftTicket.connect(signer3);
    signer4Weth = weth.connect(signer4);
    signer4NftTicket = nftTicket.connect(signer4);
  });

  // Tests
  // Deploy Contract
  // AdminMint
  // Mint

  describe("Deploy Contract", async () => {
    it("should deploy", async () => {
      const ownerWethBalance = await weth.balanceOf(owner.address);
      expect(ownerWethBalance).to.equal(ethers.constants.WeiPerEther.mul(100));
    });
  });

  describe("initializeTicket", async () => {
    let ticketData_;

    beforeEach(() => {
      ticketData_ = baseTicketData;
    });
    // supports 2106-02-07T06:28:16.000Z max
    // supports 65536 tickets max
    // supports 7.92e+28 max

    it("should not allow non-owner to call", async () => {
      await expect(
        signer1NftTicket.initializeTicket(ticketData_)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should reject if startDate is out of range", async () => {
      ticketDataNew = {
        ...ticketData_,
        startDate: toEthDate(new Date("2107-01-01")),
      };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should not reject if startDate is within range", async () => {
      ticketDataNew = {
        ...ticketData_,
        startDate: toEthDate(new Date("2006-02-07")),
      };
      await nftTicket.initializeTicket(ticketDataNew);
    });
    it("should reject if endDate is out of range", async () => {
      ticketDataNew = {
        ...ticketData_,
        endDate: toEthDate(new Date("2107-01-01")),
      };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should reject if mintStartDate is out of range", async () => {
      ticketDataNew = {
        ...ticketData_,
        mintStartDate: toEthDate(new Date("2107-01-01")),
      };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should reject if mintEndDate is out of range", async () => {
      ticketDataNew = {
        ...ticketData_,
        mintEndDate: toEthDate(new Date("2107-01-01")),
      };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should reject if maxSupply is out of range", async () => {
      ticketDataNew = { ...ticketData_, maxSupply: 70000 };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should not reject if tickets is near the max", async () => {
      ticketDataNew = { ...ticketData_, maxSupply: 65535 };
      await nftTicket.initializeTicket(ticketDataNew);
    });
    it("should reject if mintPrice is out of range", async () => {
      ticketDataNew = {
        ...ticketData_,
        mintPrice: ethers.constants.WeiPerEther.mul(80e9),
      };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should not reject if mintPrice is near the max", async () => {
      ticketDataNew = {
        ...ticketData_,
        mintPrice: ethers.constants.WeiPerEther.mul(79e9),
      };
      await nftTicket.initializeTicket(ticketDataNew);
    });
    it("should reject if redeemPrice is out of range", async () => {
      ticketDataNew = {
        ...ticketData_,
        redeemPrice: ethers.constants.WeiPerEther.mul(80e9),
      };
      await expect(nftTicket.initializeTicket(ticketDataNew)).to.be.reverted;
    });
    it("should allow owner to call", async () => {
      await nftTicket.initializeTicket(ticketData_);
      const returnedTicketData = await nftTicket.getTicketData(1);
      expect(returnedTicketData.controller).to.equal(signer1.address);
      expect(returnedTicketData.recipient).to.equal(signer2.address);
      expect(returnedTicketData.contractAddress).to.equal(signer3.address);
      expect(returnedTicketData.startDate).to.equal(toEthDate(now));
      expect(returnedTicketData.endDate).to.equal(toEthDate(oneDayFromNow));
      expect(returnedTicketData.mintStartDate).to.equal(
        toEthDate(twoDaysFromNow)
      );
      expect(returnedTicketData.mintEndDate).to.equal(
        toEthDate(threeDaysFromNow)
      );
      expect(returnedTicketData.mintPrice).to.equal(
        ethers.constants.WeiPerEther.mul(10).div(1000)
      );
      expect(returnedTicketData.redeemPrice).to.equal(
        ethers.constants.WeiPerEther.mul(15).div(1000)
      );
      expect(returnedTicketData.maxSupply).to.equal(
        ethers.BigNumber.from(1000)
      );
      expect(returnedTicketData.active).to.equal(false);
      expect(returnedTicketData.paused).to.equal(false);
    });
  });

  describe("controllerMint", async () => {
    let ticketData_, ticketData2_;

    beforeEach(async () => {
      ticketData_ = { ...baseTicketData, active: true };
      ticketData2_ = {
        ...baseTicketData,
        controller: signer3.address,
        recipient: signer3.address,
        mintPrice: ethers.constants.WeiPerEther.mul(20).div(1000),
        redeemPrice: ethers.constants.WeiPerEther.mul(25).div(1000),
        maxSupply: 2000,
      };
      await nftTicket.initializeTicket(ticketData_);
      await nftTicket.initializeTicket(ticketData2_);
    });
    it("should reject if not the controller", async () => {
      await expect(
        signer2NftTicket.controllerMint(1, [signer1.address], [1])
      ).to.be.revertedWith(
        "NFTTicket: caller is not the controller of this ticket"
      );
    });
    it("should reject if owner calls and is not the controller", async () => {
      await expect(
        nftTicket.controllerMint(1, [signer1.address], [1])
      ).to.be.revertedWith(
        "NFTTicket: caller is not the controller of this ticket"
      );
    });
    it("should reject if ticket is not active", async () => {
      await signer1NftTicket.updateActive(1, false);
      await expect(
        signer1NftTicket.controllerMint(1, [signer1.address], [1])
      ).to.be.revertedWith("NFTTicket: not active");
    });
    it("should reject if ticket does not exist", async () => {
      await expect(
        signer1NftTicket.controllerMint(3, [signer1.address], [1])
      ).to.be.revertedWith("NFTTicket: tokenId does not exist");
    });
    it("should reject if addresses has a shorter length than amounts", async () => {
      await expect(
        signer1NftTicket.controllerMint(1, [signer1.address], [1, 2])
      ).to.be.revertedWith(
        "NFTTicket: addresses length must equal amounts length"
      );
    });
    it("should reject if addresses has a longer length than amounts", async () => {
      await expect(
        signer1NftTicket.controllerMint(
          1,
          [signer1.address, signer2.address, signer3.address],
          [1, 2]
        )
      ).to.be.revertedWith(
        "NFTTicket: addresses length must equal amounts length"
      );
    });
    it("should reject if amount would cause an overage in maxSupply", async () => {
      await signer1NftTicket.updateMaxSupply(1, 20);
      await expect(
        signer1NftTicket.controllerMint(
          1,
          [signer1.address, signer2.address, signer3.address],
          [8, 7, 6]
        )
      ).to.be.revertedWith("NFTTicket: exceeds maxSupply");
    });
    it("should allow if amount would equal maxSupply", async () => {
      await signer1NftTicket.updateMaxSupply(1, 21);
      const ticketData = await nftTicket.getTicketData(1);
      expect(ticketData.maxSupply).to.equal(21);
      const supplyBefore = await nftTicket.getSupply(1);
      const balance1Before = await nftTicket.balanceOf(signer1.address, 1);
      const balance2Before = await nftTicket.balanceOf(signer2.address, 1);
      const balance3Before = await nftTicket.balanceOf(signer3.address, 1);
      await signer1NftTicket.controllerMint(
        1,
        [signer1.address, signer2.address, signer3.address],
        [8, 7, 6]
      );
      const supplyAfter = await nftTicket.getSupply(1);
      const balance1After = await nftTicket.balanceOf(signer1.address, 1);
      const balance2After = await nftTicket.balanceOf(signer2.address, 1);
      const balance3After = await nftTicket.balanceOf(signer3.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance1Before).to.equal(0);
      expect(balance2Before).to.equal(0);
      expect(balance3Before).to.equal(0);
      expect(supplyAfter).to.equal(21);
      expect(balance1After).to.equal(8);
      expect(balance2After).to.equal(7);
      expect(balance3After).to.equal(6);
    });
    it("should allow minting one to self if the controller", async () => {
      const supplyBefore = await nftTicket.getSupply(1);
      const balance1Before = await nftTicket.balanceOf(signer1.address, 1);
      await signer1NftTicket.controllerMint(1, [signer1.address], [1]);
      const supplyAfter = await nftTicket.getSupply(1);
      const balance1After = await nftTicket.balanceOf(signer1.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance1Before).to.equal(0);
      expect(supplyAfter).to.equal(1);
      expect(balance1After).to.equal(1);
    });
    it("should allow minting many to self if the controller", async () => {
      const supplyBefore = await nftTicket.getSupply(1);
      const balance1Before = await nftTicket.balanceOf(signer1.address, 1);
      await signer1NftTicket.controllerMint(1, [signer1.address], [13]);
      const supplyAfter = await nftTicket.getSupply(1);
      const balance1After = await nftTicket.balanceOf(signer1.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance1Before).to.equal(0);
      expect(supplyAfter).to.equal(13);
      expect(balance1After).to.equal(13);
    });
    it("should allow minting one to many addresses if the controller", async () => {
      const supplyBefore = await nftTicket.getSupply(1);
      const balance1Before = await nftTicket.balanceOf(signer1.address, 1);
      const balance2Before = await nftTicket.balanceOf(signer2.address, 1);
      const balance3Before = await nftTicket.balanceOf(signer3.address, 1);
      await signer1NftTicket.controllerMint(
        1,
        [signer1.address, signer2.address, signer3.address],
        [1, 1, 1]
      );
      const supplyAfter = await nftTicket.getSupply(1);
      const balance1After = await nftTicket.balanceOf(signer1.address, 1);
      const balance2After = await nftTicket.balanceOf(signer2.address, 1);
      const balance3After = await nftTicket.balanceOf(signer3.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance1Before).to.equal(0);
      expect(balance2Before).to.equal(0);
      expect(balance3Before).to.equal(0);
      expect(supplyAfter).to.equal(3);
      expect(balance1After).to.equal(1);
      expect(balance2After).to.equal(1);
      expect(balance3After).to.equal(1);
    });
    it("should allow minting many to many addresses if the controller", async () => {
      const supplyBefore = await nftTicket.getSupply(1);
      const balance1Before = await nftTicket.balanceOf(signer1.address, 1);
      const balance2Before = await nftTicket.balanceOf(signer2.address, 1);
      const balance3Before = await nftTicket.balanceOf(signer3.address, 1);
      await signer1NftTicket.controllerMint(
        1,
        [signer1.address, signer2.address, signer3.address],
        [4, 6, 3]
      );
      const supplyAfter = await nftTicket.getSupply(1);
      const balance1After = await nftTicket.balanceOf(signer1.address, 1);
      const balance2After = await nftTicket.balanceOf(signer2.address, 1);
      const balance3After = await nftTicket.balanceOf(signer3.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance1Before).to.equal(0);
      expect(balance2Before).to.equal(0);
      expect(balance3Before).to.equal(0);
      expect(supplyAfter).to.equal(13);
      expect(balance1After).to.equal(4);
      expect(balance2After).to.equal(6);
      expect(balance3After).to.equal(3);
    });
  });

  describe("mint", async () => {
    let ticketData_, ticketData2_;

    beforeEach(async () => {
      ticketData_ = {
        ...baseTicketData,
        active: true,
        paused: false,
        maxMintAmountPlusOne: 11,
        mintStartDate: toEthDate(now),
        mintEndDate: toEthDate(oneDayFromNow),
        mintPrice: ethers.constants.WeiPerEther.mul(100).div(1000),
      };
      // await nftTicket.initializeTicket(ticketData_);
      // await nftTicket.initializeTicket(ticketData2_);
    });
    // require(_exists(tokenId_), "NFTTicket: tokenId does not exist");
    // require(totalSupply[tokenId_] + amount <= ticketData.maxSupply, "NFTTicket: exceeds maxSupply");
    // require(block.timestamp > ticketData.mintStartDate, "NFTTicket: minting has not begun");
    // require(block.timestamp < ticketData.mintEndDate, "NFTTicket: minting has ended");
    // require(ticketData.active && !ticketData.paused, "NFTTicket: minting is not active");
    // require(amount < ticketData.maxMintAmountPlusOne, "NFTTicket: exceeds maxMintAmount");
    // // mint efficiently
    // require(
    //   _WETH.transferFrom(
    //     _msgSender(),
    //     ticketData.recipient,
    //     amount * ticketData.mintPrice
    //   ),
    //   'NFTTicket: payment failed'
    // );
    it("should reject if tokenId does not exist", async () => {
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "NFTTicket: tokenId does not exist"
      );
    });
    it("should reject if minting would exceed maxSupply", async () => {
      await nftTicket.initializeTicket({ ...ticketData_, maxSupply: 5 });
      await expect(signer4NftTicket.mint(1, 6)).to.be.revertedWith(
        "NFTTicket: exceeds maxSupply"
      );
    });
    it("should reject if mintStartDate has not past", async () => {
      await nftTicket.initializeTicket({
        ...ticketData_,
        mintStartDate: toEthDate(oneDayFromNow),
      });
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "NFTTicket: minting has not begun"
      );
    });
    it("should reject if mintEndDate is past", async () => {
      await nftTicket.initializeTicket({
        ...ticketData_,
        mintStartDate: toEthDate(oneDayAgo),
        mintEndDate: toEthDate(now),
      });
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "NFTTicket: minting has ended"
      );
    });
    it("should reject if ticket is not active", async () => {
      await nftTicket.initializeTicket({ ...ticketData_, active: false });
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "NFTTicket: minting is not active"
      );
    });
    it("should reject if ticket is paused", async () => {
      await nftTicket.initializeTicket({ ...ticketData_, paused: true });
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "NFTTicket: minting is not active"
      );
    });
    it("should reject if the mint amount exceeds the maxMintAmount", async () => {
      await nftTicket.initializeTicket(ticketData_);
      await expect(signer4NftTicket.mint(1, 11)).to.be.revertedWith(
        "NFTTicket: exceeds maxMintAmount"
      );
    });
    it("should reject if insufficient allowance", async () => {
      await nftTicket.initializeTicket(ticketData_);
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      );
    });
    it("should reject if insufficient funds", async () => {
      await nftTicket.initializeTicket(ticketData_);
      await signer4Weth.approve(
        nftTicket.address,
        ethers.constants.WeiPerEther.mul(100).div(1000)
      );
      await expect(signer4NftTicket.mint(1, 1)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
    });
    it("should be able to mint 1", async () => {
      await nftTicket.initializeTicket(ticketData_);
      await signer4Weth.approve(
        nftTicket.address,
        ethers.constants.WeiPerEther.mul(100).div(1000)
      );
      await weth.transfer(signer4.address, ethers.constants.WeiPerEther);
      const signer4WethBalanceBefore = await weth.balanceOf(signer4.address);
      const supplyBefore = await nftTicket.getSupply(1);
      const balance4Before = await nftTicket.balanceOf(signer4.address, 1);
      await signer4NftTicket.mint(1, 1);
      const signer4WethBalanceAfter = await weth.balanceOf(signer4.address);
      const supplyAfter = await nftTicket.getSupply(1);
      const balance4After = await nftTicket.balanceOf(signer4.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance4Before).to.equal(0);
      expect(supplyAfter).to.equal(1);
      expect(balance4After).to.equal(1);
      expect(signer4WethBalanceBefore).to.equal(ethers.constants.WeiPerEther);
      expect(signer4WethBalanceAfter).to.equal(
        ethers.constants.WeiPerEther.mul(900).div(1000)
      );
    });
    it("should be able to mint the max", async () => {
      await nftTicket.initializeTicket(ticketData_);
      await signer4Weth.approve(
        nftTicket.address,
        ethers.constants.WeiPerEther
      );
      await weth.transfer(signer4.address, ethers.constants.WeiPerEther);
      const signer4WethBalanceBefore = await weth.balanceOf(signer4.address);
      const supplyBefore = await nftTicket.getSupply(1);
      const balance4Before = await nftTicket.balanceOf(signer4.address, 1);
      await signer4NftTicket.mint(1, 10);
      const signer4WethBalanceAfter = await weth.balanceOf(signer4.address);
      const supplyAfter = await nftTicket.getSupply(1);
      const balance4After = await nftTicket.balanceOf(signer4.address, 1);
      expect(supplyBefore).to.equal(0);
      expect(balance4Before).to.equal(0);
      expect(supplyAfter).to.equal(10);
      expect(balance4After).to.equal(10);
      expect(signer4WethBalanceBefore).to.equal(ethers.constants.WeiPerEther);
      expect(signer4WethBalanceAfter).to.equal(0);
    });
    it("should be able to mint for many users", async () => {});
    it("should reject if minting would exceed maxSupply after multiple successful mints", async () => {});
  });
});
