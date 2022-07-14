import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  PaperPot,
  PaperPot__factory,
  PaperPotMetadata,
  PaperPotMetadata__factory,
  PaperSeed,
  PaperSeed__factory,
  WaterFaucet,
  WaterFaucet__factory,
} from '../types'
import { beforeEach, describe } from 'mocha'
import hre from 'hardhat';

const BYTES_ZERO = ethers.utils.toUtf8Bytes('');

function toEthDate(date: Date) {
  return Math.round(Number(date) / 1000);
}

describe("WaterFaucet", () => {
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
  let paperSeed: PaperSeed;
  let paperPot: PaperPot;
  let paperPotMetadata: PaperPotMetadata;
  let waterFaucet: WaterFaucet;
  let waterFaucetOwner: WaterFaucet;
  let signer1WaterFaucet: WaterFaucet;
  let signer2WaterFaucet: WaterFaucet;
  const SAD_SEEDS = [11, 13, 15, 17, 19, 6667];
  const RESOURCE_URIS: [string, string, string] = [
    'http://test.xyz/1',
    'http://test.xyz/2',
    'http://test.xyz/3'
  ];

  before(async () => {
    await hre.network.provider.send('hardhat_reset');
  })

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
    const imageBaseUri = "ipfs://abcdefg/";
    const shrubDefaultImageUris: [string, string, string, string] = [
      'ipfs://wonder.png',
      'ipfs://passion.png',
      'ipfs://hope.png',
      'ipfs://power.png'
    ]
    const PaperPotMetadata = await ethers.getContractFactory("PaperPotMetadata") as PaperPotMetadata__factory;
    paperPotMetadata = await PaperPotMetadata.deploy(imageBaseUri, shrubDefaultImageUris);
    const PaperPot = await ethers.getContractFactory("PaperPot") as PaperPot__factory;
    paperPot = await PaperPot.deploy(
      [paperSeed.address],
      SAD_SEEDS,
      RESOURCE_URIS,
      paperPotMetadata.address
    );
    const WaterFaucet = await ethers.getContractFactory("WaterFaucet") as WaterFaucet__factory;
    waterFaucetOwner = await WaterFaucet.deploy(paperPot.address);
    waterFaucet = waterFaucetOwner.connect(ethers.provider);
    signer1WaterFaucet = waterFaucet.connect(signer1);
    signer2WaterFaucet = waterFaucet.connect(signer2);

    ethNow = (await ethers.provider.getBlock('latest')).timestamp;
    signer1PaperSeed = paperSeed.connect(signer1);
    signer2PaperSeed = paperSeed.connect(signer2);
    signer1PaperPot = paperPot.connect(signer1);
    signer2PaperPot = paperPot.connect(signer2);
    signer3PaperPot = paperPot.connect(signer3);
    signer4PaperPot = paperPot.connect(signer4);
  });

  describe("Deploy Contract", async () => {
    it("should deploy", async () => {});
  });

  describe("setCutoffTimes", async () => {
    it("cutoffTimes should be all 0 to start", async () => {
      const cutoffTimes = await waterFaucet.getCutoffTimes();
      expect(cutoffTimes.startTime1).to.equal(0);
      expect(cutoffTimes.endTime1).to.equal(0);
      expect(cutoffTimes.startTime2).to.equal(0);
      expect(cutoffTimes.endTime2).to.equal(0);
    });
    it("should not be able to set cutoffTimes as non owner", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(100),
        endTime1: ethers.BigNumber.from(300),
        startTime2: ethers.BigNumber.from(600),
        endTime2: ethers.BigNumber.from(700)
      }
      await expect(
        signer1WaterFaucet.setCutoffTimes(newCutoffTimes)
      ).to.be.revertedWith("AdminControl: caller is not an admin");
    });
    it("reject if startTime1 is invalid", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(86401),
        endTime1: ethers.BigNumber.from(300),
        startTime2: ethers.BigNumber.from(600),
        endTime2: ethers.BigNumber.from(700)
      }
      await expect(
        waterFaucetOwner.setCutoffTimes(newCutoffTimes)
      ).to.be.revertedWith("WaterFaucet: invalid startTime1");
    });
    it("reject if startTime2 is invalid", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(101),
        endTime1: ethers.BigNumber.from(300),
        startTime2: ethers.BigNumber.from(86405),
        endTime2: ethers.BigNumber.from(700)
      }
      await expect(
        waterFaucetOwner.setCutoffTimes(newCutoffTimes)
      ).to.be.revertedWith("WaterFaucet: invalid startTime2");
    });
    it("reject if endTime1 is invalid", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(101),
        endTime1: ethers.BigNumber.from(86401),
        startTime2: ethers.BigNumber.from(600),
        endTime2: ethers.BigNumber.from(700)
      }
      await expect(
        waterFaucetOwner.setCutoffTimes(newCutoffTimes)
      ).to.be.revertedWith("WaterFaucet: invalid endTime1");
    });
    it("reject if endTime2 is invalid", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(0),
        endTime1: ethers.BigNumber.from(300),
        startTime2: ethers.BigNumber.from(600),
        endTime2: ethers.BigNumber.from(90000)
      }
      await expect(
        waterFaucetOwner.setCutoffTimes(newCutoffTimes)
      ).to.be.revertedWith("WaterFaucet: invalid endTime2");
    });
    it("owner should be able to set cutoffTimes", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(3600),
        endTime1: ethers.BigNumber.from(46800),
        startTime2: ethers.BigNumber.from(0),
        endTime2: ethers.BigNumber.from(0)
      }
      await waterFaucetOwner.setCutoffTimes(newCutoffTimes);
      const ct = await waterFaucet.getCutoffTimes();
      expect(ct.startTime1).to.equal(3600);  // 01:00a
      expect(ct.endTime1).to.equal(46800);   // 13:00a
      expect(ct.startTime2).to.equal(0);
      expect(ct.endTime2).to.equal(0);
    });
    it("owner should be able to set all cutoffTimes", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(3600 * 18),
        endTime1: ethers.BigNumber.from(3600 * 24),
        startTime2: ethers.BigNumber.from(0),
        endTime2: ethers.BigNumber.from(3600 * 6)
      }
      await waterFaucetOwner.setCutoffTimes(newCutoffTimes);
      const ct = await waterFaucet.getCutoffTimes();
      expect(ct.startTime1).to.equal(64800);  // 06:00p
      expect(ct.endTime1).to.equal(86400);    // 12:00a
      expect(ct.startTime2).to.equal(0);      // 12:00a
      expect(ct.endTime2).to.equal(21600);    // 06:00a
    });
  })

  describe("claim", async () => {
    let now;
    let nextMidnight;
    let nextBlockTime;
    beforeEach(async () => {
      // Set various dates
      now = new Date();
      nextMidnight = new Date(now);
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      nextMidnight.setUTCHours(0,0,0,0);

      // reset the clock
      await paperPot.adminMintPot(signer1.address, 2);
      await paperSeed.claimReserve(1);
      await paperSeed.claimReserve(2);
      await paperSeed.claimReserve(3);
      await paperSeed.claimReserve(4);
      await paperSeed["safeTransferFrom(address,address,uint256)"](
        owner.address,
        signer1.address,
        1
      );
      await signer1PaperSeed.approve(paperPot.address, 1);
      await signer1PaperPot.plant(paperSeed.address, 1);
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(3600 * 18),  // 06:00p
        endTime1: ethers.BigNumber.from(3600 * 24),    // 12:00a
        startTime2: ethers.BigNumber.from(0),          // 12:00a
        endTime2: ethers.BigNumber.from(3600 * 6)      // 06:00a
      }
      await waterFaucetOwner.setCutoffTimes(newCutoffTimes);
    });
    it("Should not work if token does not exist", async () => {
      await expect(
        signer1WaterFaucet.claim([1e6 + 5])
      ).to.be.revertedWith("WaterFaucet: query for nonexistent token");
    });
    it("Should not work if token is not owned by caller", async () => {
      await expect(
        signer2WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: account not owner of token");
    });
    it("Should not work if token is a pot", async () => {
      await expect(
        signer1WaterFaucet.claim([1])
      ).to.be.revertedWith("WaterFaucet: invalid potted plant tokenId");
    });
    it("Should not work if time has not been set - even at midnight", async () => {
      const newCutoffTimes = {
        startTime1: ethers.BigNumber.from(0),
        endTime1: ethers.BigNumber.from(0),
        startTime2: ethers.BigNumber.from(0),
        endTime2: ethers.BigNumber.from(0)
      }
      await waterFaucetOwner.setCutoffTimes(newCutoffTimes);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextMidnight)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
    });
    it("Should not work if time is not in either of the ranges", async () => {
      nextBlockTime = new Date(nextMidnight);
      nextBlockTime.setUTCHours(17,0,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
    });
    it("Should not work if waterFaucet has not been set as admin", async () => {
      nextBlockTime.setUTCHours(18,1,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("AdminControl: caller is not an admin");
    });
    it("Should not work if same tokenId is duplicated", async () => {
      nextBlockTime.setUTCHours(18,2,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1, 1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
    });
    it("Should work if within range 1 (beginning)", async () => {
      // 6:00p
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(18,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should work if within range 1 (end)", async () => {
      // 12:00a
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(0,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should work if within range 2 (end)", async () => {
      // 5:59:59a
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(5,59,59,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should not work at end of range 2 (end)", async () => {
      // 6:00a
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(6,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
    });
    it("Should not work if was already claimed this period", async () => {
      // 6:00p
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(18,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      nextBlockTime.setUTCHours(19,0,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should not work if was already claimed this period - even on a different day", async () => {
      // 6:00p
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(18,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      nextBlockTime.setUTCHours(28,0,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should allow claiming in the next period after claiming in first period", async () => {
      // 5:00a
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(5,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      nextBlockTime.setUTCHours(19,0,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const tx2 = await signer1WaterFaucet.claim([1e6 + 1]);
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(2);
    });
    it("Should not allow claiming in the next period after removing admin", async () => {
      // 5:00a
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(5,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      nextBlockTime.setUTCHours(19,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, false);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("AdminControl: caller is not an admin");
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should allow claiming many", async () => {
      await paperPot.adminMintPot(signer1.address, 2);
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
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(5,59,59,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1, 1e6 + 2, 1e6 + 4, 1e6 + 3]);
      const receipt = await tx.wait();
      const waitEvent = receipt.events.find(r => r.event === 'Claim');
      expect(waitEvent).to.not.equal(undefined);
      expect(waitEvent.args.account).to.equal(signer1.address);
      expect(waitEvent.args.amount).to.equal(4);
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(4);
    });
    it("Should not allow if later token is invalid", async () => {
      await paperPot.adminMintPot(signer1.address, 2);
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
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(5,59,59,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore = await paperPot.balanceOf(signer1.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 4]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1, 1e6 + 2, 1e6 + 4, 1e6 + 3])
      ).to.be.revertedWith("WaterFaucet: not eligible");
      const waterAfter = await paperPot.balanceOf(signer1.address, 3);
      expect(waterBefore).to.equal(0);
      expect(waterAfter).to.equal(1);
    });
    it("Should not allow a new user to claim if already claimed in period - but should allow next period", async () => {
      // 6:00p
      nextBlockTime.setUTCDate(nextBlockTime.getUTCDate() + 1);
      nextBlockTime.setUTCHours(18,0,0,0);
      await paperPot.setAdmin(waterFaucet.address, true);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      const waterBefore1 = await paperPot.balanceOf(signer1.address, 3);
      const waterBefore2 = await paperPot.balanceOf(signer2.address, 3);
      const tx = await signer1WaterFaucet.claim([1e6 + 1]);
      await signer1PaperPot.safeTransferFrom(signer1.address, signer2.address, 1e6 + 1, 1, BYTES_ZERO);
      nextBlockTime.setUTCHours(28,0,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: account not owner of token");
      await expect(
        signer2WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: not eligible");
      nextBlockTime.setUTCHours(19,0,0,0);
      await ethers.provider.send('evm_setNextBlockTimestamp', [toEthDate(nextBlockTime)]);
      await expect(
        signer1WaterFaucet.claim([1e6 + 1])
      ).to.be.revertedWith("WaterFaucet: account not owner of token");
      const tx2 = await signer2WaterFaucet.claim([1e6 + 1])
      const waterAfter1 = await paperPot.balanceOf(signer1.address, 3);
      const waterAfter2 = await paperPot.balanceOf(signer2.address, 3);
      expect(waterBefore1).to.equal(0);
      expect(waterBefore2).to.equal(0);
      expect(waterAfter1).to.equal(1);
      expect(waterAfter2).to.equal(1);
    });
  })
});
