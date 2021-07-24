import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {ethers, waffle} from "hardhat";
import {FakeToken, ShrubExchange} from "../types/ethers-v5";
import {Contract, Wallet} from 'ethers';
import {MockProvider} from "ethereum-waffle";

const {provider, createFixtureLoader, deployContract} = waffle;
const loadFixture = createFixtureLoader(provider.getWallets(), provider);
const {WeiPerEther, AddressZero, Zero, One} = ethers.constants

use(chaiAsPromised);


describe('ShrubExchange', async function() {
  let shrubExchange: ShrubExchange;
  let fakeToken: FakeToken;
  let deployer: Wallet;
  let acct1: Wallet;
  let acct2: Wallet;

  async function fixture(_wallets: Wallet[], _mockProvider: MockProvider) {
    console.log('running fixture');
    const [deployer, acct1, acct2] = _wallets;

    const ShrubExchangeFactory = await ethers.getContractFactory('ShrubExchange', deployer);
    const FakeTokenFactory = await ethers.getContractFactory('FakeToken', deployer);
    shrubExchange = (await ShrubExchangeFactory.deploy()) as ShrubExchange;
    fakeToken = (await FakeTokenFactory.deploy()) as FakeToken;
    return {shrubExchange, fakeToken, deployer, acct1, acct2}
  }

  beforeEach(async function() {
    ({shrubExchange, fakeToken, deployer, acct1, acct2} = await loadFixture(fixture));
  });
  describe('depositEth', async function() {
    let shrubExchangeAcct1: ShrubExchange;
    beforeEach(async function() {
      shrubExchangeAcct1 = shrubExchange.connect(acct1);
    })
    it('acct1 should have an initial ETH balance of 0', async function() {
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
    });
    it('acct1 should have an initial FK balance of 0', async function() {
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
    });
    it('should revert if value sent is 0', async function () {
      const deposit = shrubExchangeAcct1.depositEth()
      expect(deposit).to.be.revertedWith('Value must be positive');
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
    });
    it('should fail if insufficient funds', async function() {
      const acct1Balance = await acct1.getBalance();
      const overBalance = acct1Balance.add(One);
      const deposit = shrubExchangeAcct1.depositEth({value: overBalance})
      expect(deposit).to.be.rejected;
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
    });
    it('should succeed if sending 1 ETH which account has', async function() {
      const acct1Balance = await acct1.getBalance();
      expect(acct1Balance.gt(WeiPerEther)).to.be.true;
      const deposit = shrubExchangeAcct1.depositEth({value: WeiPerEther})
      expect(deposit).to.be.fulfilled;
      expect(deposit).to.emit(shrubExchange, 'Deposit').withArgs(acct1.address, AddressZero, WeiPerEther);
      const tx = await deposit;
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
      const { gasPrice } = tx;
      const receipt = await tx.wait();
      const { gasUsed } = receipt;
      const txFee = gasUsed.mul(gasPrice);
      await expect(acct1.getBalance()).to.eventually.equal(acct1Balance.sub(txFee).sub(WeiPerEther));
    });
    it('should succeed if sending 1 ETH which account has', async function() {
      const acct1Balance = await acct1.getBalance();
      expect(acct1Balance.gt(WeiPerEther)).to.be.true;
      const deposit = shrubExchangeAcct1.depositEth({value: WeiPerEther})
      expect(deposit).to.be.fulfilled;
      expect(deposit).to.emit(shrubExchange, 'Deposit').withArgs(acct1.address, AddressZero, WeiPerEther);
      const tx = await deposit;
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
      const { gasPrice } = tx;
      const receipt = await tx.wait();
      const { gasUsed } = receipt;
      const txFee = gasUsed.mul(gasPrice);
      await expect(acct1.getBalance()).to.eventually.equal(acct1Balance.sub(txFee).sub(WeiPerEther));
    });
  });
  describe('depositToken', async function() {
    let shrubExchangeAcct1: ShrubExchange;
    before(async function() {
      shrubExchangeAcct1 = shrubExchange.connect(acct1);
    })
    it('deployer should have an initial FK balance of 10000', async function() {
      await expect(fakeToken.balanceOf(deployer.address)).to.eventually.equal(WeiPerEther.mul(10000));
    });
    it('acct1 should have an initial FK balance of 0', async function() {
      await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(0);
    });
    it('acct1 should have an initial ETH balance of 0', async function() {
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
    });
    it('acct1 should have an initial FK balance of 0', async function() {
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
    });
    it('should revert if amount is 0', async function() {
      const deposit = shrubExchangeAcct1.depositToken(fakeToken.address, 0);
      expect(deposit).to.be.revertedWith('amount must be positive');
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
    });
    it('should revert if insufficient token balance', async function() {
      const deposit = shrubExchangeAcct1.depositToken(fakeToken.address, WeiPerEther);
      expect(deposit).to.be.revertedWith('ERC20: transfer amount exceeds balance');
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(Zero);
    });
    it('should succeed if sending 10 FK which account has', async function() {
      await fakeToken.transfer(acct1.address, WeiPerEther.mul(100));
      await expect(fakeToken.balanceOf(deployer.address)).to.eventually.equal(WeiPerEther.mul(9900));
      await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(100));
      const fakeTokenAcct1 = fakeToken.connect(acct1);
      const approve = fakeTokenAcct1.approve(shrubExchange.address, WeiPerEther.mul(10000));
      expect(approve).to.be.fulfilled;
      await approve;
      const deposit = shrubExchangeAcct1.depositToken(fakeToken.address, WeiPerEther.mul(10));
      await deposit;
      expect(deposit).to.be.fulfilled;
      expect(deposit).to.emit(shrubExchange, 'Deposit').withArgs(acct1.address, fakeToken.address, WeiPerEther.mul(10));
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(Zero);
      await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(10));
      await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(90));
    });
  });
  describe('withdraw', async function() {
    describe('withdraw ETH', async function() {
      let shrubExchangeAcct1: ShrubExchange;
      let fakeTokenAcct1: FakeToken;
      beforeEach(async function() {
        shrubExchangeAcct1 = shrubExchange.connect(acct1);
        fakeTokenAcct1 = fakeToken.connect(acct1);
        await fakeToken.transfer(acct1.address, WeiPerEther.mul(1000));
        await shrubExchangeAcct1.depositEth({value: WeiPerEther.mul(10)})
        await fakeTokenAcct1.approve(shrubExchange.address, WeiPerEther.mul(10000));
        await shrubExchangeAcct1.depositToken(fakeToken.address, WeiPerEther.mul(100));
      })
      it('should have expected initial balances', async function () {
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
      });
      it('should revert if amount is 0', async function() {
        const withdraw = shrubExchangeAcct1.withdraw(AddressZero, Zero);
        await expect(withdraw).to.be.revertedWith('amount must be positive');
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
      });
      it('should revert if insufficient balance', async function() {
        const withdraw = shrubExchangeAcct1.withdraw(AddressZero, WeiPerEther.mul(11));
        await expect(withdraw).to.be.revertedWith('Cannot withdraw more than available balance');
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
      });
      it('should succeed if withdrawing a partial amount', async function() {
        const ethWalletBalance = await acct1.getBalance();
        const withdraw = shrubExchangeAcct1.withdraw(AddressZero, WeiPerEther.mul(4));
        await expect(withdraw).to.be.fulfilled;
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(6));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
        const tx = await withdraw;
        const reciept = await tx.wait();
        const totalFee = reciept.gasUsed.mul(tx.gasPrice);
        await expect(acct1.getBalance()).to.eventually.equal(ethWalletBalance.sub(totalFee).add(WeiPerEther.mul(4)));
      });
      it('should succeed if withdrawing the full amount', async function() {
        const ethWalletBalance = await acct1.getBalance();
        const withdraw = shrubExchangeAcct1.withdraw(AddressZero, WeiPerEther.mul(10));
        await expect(withdraw).to.be.fulfilled;
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(0));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
        const tx = await withdraw;
        const reciept = await tx.wait();
        const totalFee = reciept.gasUsed.mul(tx.gasPrice);
        await expect(acct1.getBalance()).to.eventually.equal(ethWalletBalance.sub(totalFee).add(WeiPerEther.mul(10)));
      });
    })
    describe('withdraw FK', async function() {
      let shrubExchangeAcct1: ShrubExchange;
      let fakeTokenAcct1: FakeToken;
      beforeEach(async function() {
        shrubExchangeAcct1 = shrubExchange.connect(acct1);
        fakeTokenAcct1 = fakeToken.connect(acct1);
        await fakeToken.transfer(acct1.address, WeiPerEther.mul(1000));
        await shrubExchangeAcct1.depositEth({value: WeiPerEther.mul(10)})
        await fakeTokenAcct1.approve(shrubExchange.address, WeiPerEther.mul(10000));
        await shrubExchangeAcct1.depositToken(fakeToken.address, WeiPerEther.mul(100));
      })
      it('should have expected initial balances', async function () {
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
      });
      it('should revert if amount is 0', async function() {
        const withdraw = shrubExchangeAcct1.withdraw(fakeToken.address, Zero);
        await expect(withdraw).to.be.revertedWith('amount must be positive');
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
      });
      it('should revert if insufficient balance', async function() {
        const withdraw = shrubExchangeAcct1.withdraw(fakeToken.address, WeiPerEther.mul(100).add(1));
        await expect(withdraw).to.be.revertedWith('Cannot withdraw more than available balance');
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(100));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(900));
      });
      it('should succeed if withdrawing a partial amount', async function() {
        const ethWalletBalance = await acct1.getBalance();
        const fkWalletBalance = await fakeToken.balanceOf(acct1.address);
        const withdraw = shrubExchangeAcct1.withdraw(fakeToken.address, WeiPerEther.mul(40));
        await expect(withdraw).to.be.fulfilled;
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(60));
        const tx = await withdraw;
        const reciept = await tx.wait();
        const totalFee = reciept.gasUsed.mul(tx.gasPrice);
        await expect(acct1.getBalance()).to.eventually.equal(ethWalletBalance.sub(totalFee));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(940));
      });
      it('should succeed if withdrawing the full amount', async function() {
        const ethWalletBalance = await acct1.getBalance();
        const withdraw = shrubExchangeAcct1.withdraw(fakeToken.address, WeiPerEther.mul(100));
        await expect(withdraw).to.be.fulfilled;
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, AddressZero)).to.eventually.equal(WeiPerEther.mul(10));
        await expect(shrubExchangeAcct1.userTokenBalances(acct1.address, fakeToken.address)).to.eventually.equal(WeiPerEther.mul(0));
        const tx = await withdraw;
        const reciept = await tx.wait();
        const totalFee = reciept.gasUsed.mul(tx.gasPrice);
        await expect(acct1.getBalance()).to.eventually.equal(ethWalletBalance.sub(totalFee));
        await expect(fakeToken.balanceOf(acct1.address)).to.eventually.equal(WeiPerEther.mul(1000));
      });
    })
  });
  describe('matchOrder', async function() {
    /*
    * Reasons for orders to not match checkOrderMatches:
    *   sellOrder not isBuy=false
    *   buyOrder not isBuy=true
    *   buyOrder price not >= sellOrder price
    *   sellOrder expired
    *   buyOrder expired
    *
    * doPartialMatch
    *   seller and buyer not different
    *   nonce incorrect (sell, buy)
    *   sufficient collateral (sell, buy)
    *
    * */
    it('should revert if sellOrder is not isBuy=false', async function() {});
    it('should revert if buyOrder is not isBuy=true', async function() {});
    it('should revert if buyOrder price not greater than sellOrder price', async function() {});
    it('should revert if sellOrder is expired', async function() {});
    it('should revert if buyOrder is expired', async function() {});
    it('should revert if seller and buyer are the same', async function() {});
    it('should revert if sellOrder nonce does not match', async function() {});
    it('should revert if buyOrder nonce does not match', async function() {});
    it('should revert if seller does not have sufficient collateral', async function() {});
    it('should revert if buyer does not have sufficient funds', async function() {});
    it('should succeed if orders perfectly match', async function() {});
    it('should succeed if buy order is larger than sell order', async function() {});
    it('should succeed if buy order is smaller than sell order', async function() {});
  });
  describe('matchOrders', async function() {});
  describe('depositAndMatch', async function() {});
  describe('depositAndMatchMany', async function() {});
  describe('execute', async function() {});
})
