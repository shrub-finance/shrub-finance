import { ethers } from "ethers";
import {FakeToken__factory} from "@shrub/contracts/types/ethers-v5";
import {ShrubExchange__factory} from "@shrub/contracts/types/ethers-v5";
import { Currencies } from "../constants/currencies";
import {
  IOrder,
  OptionType,
  OrderCommon,
  Signature,
  SmallOrder,
  UnsignedOrder,
} from "../types";
import { Shrub712 } from "./EIP712";
import Web3 from "web3";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {toWei} from 'ethjs-unit';

declare let window: any;

const SHRUB_CONTRACT_ADDRESS = process.env.REACT_APP_SHRUB_ADDRESS || "";
const FK_TOKEN_ADDRESS = process.env.REACT_APP_FK_TOKEN_ADDRESS || "";
const ZERO_ADDRESS = ethers.constants.AddressZero;
if (!SHRUB_CONTRACT_ADDRESS || !FK_TOKEN_ADDRESS) {
  throw new Error(
    "Missing configuration. Please add REACT_APP_SHRUB_ADDRESS and REACT_APP_FK_TOKEN_ADDRESS to your .env file"
  );
}

export function useGetProvider() {
  const { library: provider, active } = useWeb3React();
  if (!active) {
    return false;
  }
  return provider;
}

export function extractRSV(signature: string) {
  const sig = signature.slice(2);
  const r = "0x" + sig.substr(0, 64);
  const s = "0x" + sig.substr(64, 64);
  const v = parseInt("0x" + sig.substr(128, 2), 16) + 27;
  return { r, s, v };
}

export function toEthDate(date: Date) {
  return Math.round(Number(date) / 1000);
}

export async function signOrder(unsignedOrder: UnsignedOrder, provider: Web3Provider) {
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  const order = {
    ...unsignedOrder,
    optionType: unsignedOrder.optionType === OptionType.CALL ? 1 : 0,
  };
  const signer = provider.getSigner();

  // TODO: change this to sign with ethers to enable EIP712 metamask view
  // Sign with shrubInterface
  const web3 = new Web3(window.ethereum);
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer)
  const orderTypeHash = await shrubContract.ORDER_TYPEHASH();
  const address = await signer.getAddress();
  const { order: resOrder, sig } = await shrubInterface.signOrderWithWeb3(
    web3,
    orderTypeHash,
    order,
    address
  );
  const signedOrder: IOrder = { ...resOrder, ...sig, address };
  return signedOrder;

  // Sign with ethers
  /*
    const domain = shrubInterface.domain;
    const types = { Order: shrubInterface.types.Order };
    const signature = await signer._signTypedData(domain, types, order);
    const sig = signature.slice(2);
    const r = "0x" + sig.substr(0, 64);
    const s = "0x" + sig.substr(64, 64);
    const v = parseInt("0x" + sig.substr(128, 2));
    return { order, sig: { v, r, s } };
  */

  // Sign with ethereum API
  /*
  const from = await signer.getAddress();
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    signer
  );
  const orderTypeHash = await shrubContract.ORDER_TYPEHASH();
  console.log(order);
  window.shrubInterface = shrubInterface;
  const td = {
    ...shrubInterface.template,
    primaryType: 'Order',
    message: order
  }
  console.log(td);
  const typedData = JSON.stringify(td);
  console.log(typedData);
  const signature: string = await window.ethereum.request({
    method: "eth_signTypedData_v4",
    params: [from, typedData],
    from,
  });
  const sig = signature.slice(2);
  const r = "0x" + sig.substr(0, 64);
  const s = "0x" + sig.substr(64, 64);
  const v = parseInt("0x" + sig.substr(128, 2));
  return { order, sig: { v, r, s } };
*/
}

export async function getDecimalsFor(token: string, provider: Web3Provider) {
  const decimals = 18;
  if (token === ethers.constants.AddressZero) {
    return decimals;
  }

  const erc20Contract = FakeToken__factory.connect(token, provider)
  return erc20Contract.decimals();
}

export async function getSymbolFor(token: string, provider: Web3Provider) {
  if (token === ethers.constants.AddressZero) {
    return 'ETH';
  }
  const erc20Contract = FakeToken__factory.connect(token, provider);
  return erc20Contract.symbol();
}

export async function getWalletBalance(address: string, provider: Web3Provider) {
  const signer = provider.getSigner();
  let bigBalance;
  let decimals = 18;
  if (address === Currencies.ETH.address) {
    // Basically it is ETH
    bigBalance = await provider.getBalance(signer.getAddress());
  } else {
    // ERC-20 token logic
    const erc20Contract = FakeToken__factory.connect(address, provider)
    const signerAddress = await signer.getAddress();
    bigBalance = await erc20Contract.balanceOf(signerAddress);
    decimals = await erc20Contract.decimals();
  }
  return ethers.utils.formatUnits(bigBalance, decimals);
}

export async function depositEth(amount: ethers.BigNumber, provider: Web3Provider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer)
  return shrubContract.deposit(ZERO_ADDRESS, amount, { value: amount });
}

export async function depositToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: Web3Provider,
) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer)
  const erc20Contract = FakeToken__factory.connect(tokenContractAddress, provider)
  const signerAddress = await signer.getAddress();
  const allowance = await erc20Contract.allowance(signerAddress, SHRUB_CONTRACT_ADDRESS);
  if (allowance.lt(amount)) {
    throw new Error("need to approve");
  }
  return shrubContract.deposit(tokenContractAddress, amount);
}

export function ethToWei(value: number, unitString = 'ether') {
  return ethers.BigNumber.from(toWei(value, unitString).toString())
}

export async function approveToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: Web3Provider
) {
  const signer = provider.getSigner();
  const bigAmount = amount;
  const erc20Contract = FakeToken__factory.connect(tokenContractAddress, provider);
  const signerAddress = await signer.getAddress();
  const allowance = await erc20Contract.allowance(signerAddress, SHRUB_CONTRACT_ADDRESS);
  if (allowance.gte(bigAmount)) {
    throw new Error("allowance is sufficient - no need to approve");
  }
  return erc20Contract.approve(SHRUB_CONTRACT_ADDRESS, bigAmount);
}

export async function withdraw(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: Web3Provider
) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const signerAddress = await signer.getAddress();
  const availableBalance = await shrubContract.getAvailableBalance(signerAddress, tokenContractAddress);
  if (amount.gt(availableBalance)) {
    throw new Error(`insufficient available balance: ${availableBalance}`);
  }
  return shrubContract.withdraw(tokenContractAddress, amount);
}

export function iOrderToSmall(order: IOrder) {
  const { size, isBuy, nonce, price, offerExpire, fee } = order;
  return {
    size,
    isBuy,
    nonce,
    price,
    offerExpire,
    fee,
  } as SmallOrder;
}

export function iOrderToCommon(order: IOrder) {
  const { baseAsset, quoteAsset, expiry, strike, optionType } = order;
  return {
    baseAsset,
    quoteAsset,
    expiry,
    strike,
    optionType,
  } as OrderCommon;
}

export function iOrderToSig(order: IOrder) {
  const { v, r, s } = order;
  return {
    v,
    r,
    s,
  } as Signature;
}

export async function getAddressFromSignedOrder(order: IOrder, provider: Web3Provider) {
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  const sig = iOrderToSig(order);
  const smallOrder = shrubInterface.toSmallOrder(order);
  const commonOrder = shrubInterface.toCommon(order);

  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  return shrubContract.getAddressFromSignedOrder(smallOrder, commonOrder, sig);
}

export async function validateOrderAddress(order: IOrder, provider: Web3Provider) {
  const { address } = order;
  const derivedAddress = await getAddressFromSignedOrder(order, provider);
  return address === derivedAddress;
}

export async function getUserNonce(
  params: Pick<IOrder, "address" | "quoteAsset" | "baseAsset">,
  provider: Web3Provider
) {
  const { address, quoteAsset, baseAsset } = params;
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const bigNonce = await shrubContract.getCurrentNonce(address, quoteAsset, baseAsset);
  return bigNonce.toNumber();
}

export async function getAvailableBalance(params: {
  address: string,
  tokenContractAddress: string,
  provider: Web3Provider
}) {
  const { address, tokenContractAddress, provider } = params;
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  return shrubContract.getAvailableBalance(address, tokenContractAddress)
}

export async function matchOrder(params: {
  signedBuyOrder: IOrder;
  signedSellOrder: IOrder;
}, provider: Web3Provider) {
  const { signedBuyOrder, signedSellOrder } = params;
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  const sellOrder = shrubInterface.toSmallOrder(signedSellOrder);
  const buyOrder = shrubInterface.toSmallOrder(signedBuyOrder);
  const common = shrubInterface.toCommon(signedBuyOrder);
  const sellSig = iOrderToSig(signedSellOrder);
  const buySig = iOrderToSig(signedBuyOrder);

  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);

  //  All of the validations that the smart contract does
  const seller = await getAddressFromSignedOrder(signedSellOrder, provider);
  const buyer = await getAddressFromSignedOrder(signedBuyOrder, provider);
  const { quoteAsset, baseAsset } = common;
  const sellerNonce = await getUserNonce({ address: seller, quoteAsset, baseAsset }, provider);
  const buyerNonce = await getUserNonce({ address: buyer, quoteAsset, baseAsset }, provider);
  if (sellOrder.nonce - 1 !== sellerNonce) {
    throw new Error(
      `sellerNonce: ${sellerNonce} must be 1 less than the sell order nonce: ${sellOrder.nonce}`
    );
  }
  if (buyOrder.nonce - 1 !== buyerNonce) {
    throw new Error(
      `buyerNonce: ${buyerNonce} must be 1 less than the buy order nonce: ${buyOrder.nonce}`
    );
  }
  if (common.optionType === 1) {
    //  CALL OPTION
    const sellerQuoteAssetBalance = await getAvailableBalance({
      address: seller,
      tokenContractAddress: common.quoteAsset,
      provider
    });
    if (sellerQuoteAssetBalance.lt(sellOrder.size)) {
      throw new Error(
        `sellerQuoteAssetBalance: ${sellerQuoteAssetBalance} must be larger than the sellOrder size: ${sellOrder.size}`
      );
    }
  } else {
    //  PUT OPTION
  }

  console.log({ sellOrder, buyOrder, common, sellSig, buySig });
  return shrubContract.matchOrder(sellOrder, buyOrder, common, sellSig, buySig);
}

export async function getFilledOrders(
    address: string,
    provider: Web3Provider,
    fromBlock: ethers.providers.BlockTag = 0,
    toBlock: ethers.providers.BlockTag = "latest",
) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const openOrders = {} as any;
  const sellFilter = shrubContract.filters.OrderMatched(address);
  const buyFilter = shrubContract.filters.OrderMatched(null, address);
  const sellOrdersMatched = await shrubContract.queryFilter(sellFilter, fromBlock, toBlock);
  const buyOrdersMatched = await shrubContract.queryFilter(buyFilter, fromBlock, toBlock);
  const matchedOrders = [...sellOrdersMatched, ...buyOrdersMatched];
  for (const event of matchedOrders) {
    if (!event) {
      continue;
    }
    const { positionHash, common } = event.args;
    const { baseAsset, quoteAsset, strike, expiry, optionType } = common;
    const dateExpiry = new Date(expiry.toNumber() * 1000);
    if (!openOrders[positionHash]) {
      const amount = await userOptionPosition(address, positionHash, provider);
      openOrders[positionHash] = {
        baseAsset,
        quoteAsset,
        pair: getPair(baseAsset, quoteAsset),
        strike: strike.toString(),
        expiry: dateExpiry.toISOString().substr(0,10),
        optionType: optionType === 1 ? 'CALL' : 'PUT',
        amount
      };
    }
  }
  return openOrders;
}

export function getPair(baseAsset: string, quoteAsset: string) {
  return `${addressToLabel(quoteAsset)}/${addressToLabel(baseAsset)}`;
}

export function addressToLabel(address: string) {
  if (address === ZERO_ADDRESS) {
    return 'ETH';
  }
  if (process.env.REACT_APP_FK_TOKEN_ADDRESS && address.toLowerCase() === process.env.REACT_APP_FK_TOKEN_ADDRESS.toLowerCase()) {
    return 'FK';
  }
  return 'XXX'
}

export async function userOptionPosition(address: string, positionHash: string, provider: Web3Provider) {
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const bigBalance = await shrubContract.userOptionPosition(address, positionHash);
  return bigBalance.toNumber();
}
