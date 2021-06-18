import { ethers } from "ethers";
import { ShrubExchangeAbi } from "@shrub/contracts";
import { FakeTokenAbi } from "@shrub/contracts";
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

declare let window: any;

console.log(process.env);
const SHRUB_CONTRACT_ADDRESS = process.env.REACT_APP_SHRUB_ADDRESS || "";
const FK_TOKEN_ADDRESS = process.env.REACT_APP_FK_TOKEN_ADDRESS || "";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
if (!SHRUB_CONTRACT_ADDRESS || !FK_TOKEN_ADDRESS) {
  throw new Error(
    "Missing configuration. Please add REACT_APP_SHRUB_ADDRESS and REACT_APP_FK_TOKEN_ADDRESS to your .env file"
  );
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

export async function getSignerAddress() {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const from = await signer.getAddress();
  return from;
}

export async function signOrder(unsignedOrder: UnsignedOrder) {
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  const order = {
    ...unsignedOrder,
    optionType: unsignedOrder.optionType === OptionType.CALL ? 1 : 0,
  };
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // TODO: change this to sign with ethers to enable EIP712 metamask view
  // Sign with shrubInterface
  const web3 = new Web3(window.ethereum);
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    signer
  );
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

export async function getDecimalsFor(token: string) {
  const decimals = 18;
  if (token === Currencies.ETH.address) {
    return decimals;
  }

  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const erc20Contract = new ethers.Contract(token, FakeTokenAbi, signer);
  return erc20Contract.decimals();
}

export async function getWalletBalance(address: string) {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  let bigBalance;
  let decimals = 18;
  if (address === Currencies.ETH.address) {
    // Basically it is ETH
    bigBalance = await provider.getBalance(signer.getAddress());
  } else {
    // ERC-20 token logic
    const erc20contract = new ethers.Contract(address, FakeTokenAbi, signer);
    bigBalance = await erc20contract.balanceOf(signer.getAddress());
    decimals = await erc20contract.decimals();
  }
  return bigBalance / Math.pow(10, decimals);
}

export async function depositEth(amount: ethers.BigNumber) {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    signer
  );
  return shrubContract.deposit(ZERO_ADDRESS, amount, { value: amount });
}

export async function depositToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber
) {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    signer
  );
  const fakeTokenContract = new ethers.Contract(
    FK_TOKEN_ADDRESS,
    FakeTokenAbi,
    signer
  );
  const allowance = await fakeTokenContract.allowance(
    signer.getAddress(),
    SHRUB_CONTRACT_ADDRESS
  );
  if (allowance.lt(amount)) {
    throw new Error("need to approve");
  }
  return shrubContract.deposit(tokenContractAddress, amount);
}

export async function approveToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber
) {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const bigAmount = amount;
  const erc20Contract = new ethers.Contract(
    tokenContractAddress,
    FakeTokenAbi,
    signer
  );
  const allowance = await erc20Contract.allowance(
    signer.getAddress(),
    SHRUB_CONTRACT_ADDRESS
  );
  if (allowance.gte(bigAmount)) {
    throw new Error("allowance is sufficient - no need to approve");
  }
  const approved = await erc20Contract.approve(
    SHRUB_CONTRACT_ADDRESS,
    bigAmount
  );
  return approved;
}

export async function withdraw(
  tokenContractAddress: string,
  amount: ethers.BigNumber
) {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    signer
  );
  const availableBalance = await shrubContract.getAvailableBalance(
    signer.getAddress(),
    tokenContractAddress
  );
  if (amount.gt(availableBalance)) {
    throw new Error(`insufficient available balance: ${availableBalance}`);
  }
  return shrubContract.withdraw(tokenContractAddress, amount);
}

export async function getAvailableSignerBalance(tokenContractAddress: string) {
  const address = await getSignerAddress();
  const bigBalance = await getAvailableBalance({
    address,
    tokenContractAddress,
  });
  return Number(bigBalance.div(ethers.BigNumber.from(10).pow(18)).toString());
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

export async function getAddressFromSignedOrder(order: IOrder) {
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  const sig = iOrderToSig(order);
  const smallOrder = shrubInterface.toSmallOrder(order);
  const commonOrder = shrubInterface.toCommon(order);

  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    provider
  );
  const orderAddress = await shrubContract.getAddressFromSignedOrder(
    smallOrder,
    commonOrder,
    sig
  );
  return orderAddress;
}

export async function validateOrderAddress(order: IOrder) {
  const { address } = order;
  const derivedAddress = await getAddressFromSignedOrder(order);
  return address === derivedAddress;
}

export async function getUserNonce(
  params: Pick<IOrder, "address" | "quoteAsset" | "baseAsset">
) {
  const { address, quoteAsset, baseAsset } = params;
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    provider
  );
  const bigNonce = (await shrubContract.getCurrentNonce(
    address,
    quoteAsset,
    baseAsset
  )) as ethers.BigNumber;
  const nonce = bigNonce.toNumber();
  // if (!nonce) {
  //   return 1;
  // }
  return nonce;
}

export async function getAvailableBalance(params: {
  address: string;
  tokenContractAddress: string;
}) {
  const { address, tokenContractAddress } = params;
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    provider
  );
  const bigBalance = (await shrubContract.getAvailableBalance(
    address,
    tokenContractAddress
  )) as ethers.BigNumber;
  return bigBalance;
}

// function matchOrder(SmallOrder memory sellOrder, SmallOrder memory buyOrder, OrderCommon memory common, Signature memory sellSig, Signature memory buySig) orderMatches(sellOrder, buyOrder, common) public {

export async function matchOrder(params: {
  signedBuyOrder: IOrder;
  signedSellOrder: IOrder;
}) {
  const { signedBuyOrder, signedSellOrder } = params;
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  const sellOrder = shrubInterface.toSmallOrder(signedSellOrder);
  const buyOrder = shrubInterface.toSmallOrder(signedBuyOrder);
  const common = shrubInterface.toCommon(signedBuyOrder);
  const sellSig = iOrderToSig(signedSellOrder);
  const buySig = iOrderToSig(signedBuyOrder);

  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const shrubContract = new ethers.Contract(
    SHRUB_CONTRACT_ADDRESS,
    ShrubExchangeAbi,
    signer
  );

  //  All of the validations that the smart contract does
  const seller = await getAddressFromSignedOrder(signedSellOrder);
  const buyer = await getAddressFromSignedOrder(signedBuyOrder);
  const { quoteAsset, baseAsset } = common;
  const sellerNonce = await getUserNonce({
    address: seller,
    quoteAsset,
    baseAsset,
  });
  const buyerNonce = await getUserNonce({
    address: buyer,
    quoteAsset,
    baseAsset,
  });
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
    });
    console.log(`quoteAsset: ${quoteAsset}`);
    console.log(`seller: ${seller}`);
    console.log(`buyer: ${buyer}`);
    console.log(`sellerQuoteAssetBalance: ${sellerQuoteAssetBalance}`);
    console.log(`sellOrder.size: ${sellOrder.size}`);
    if (sellerQuoteAssetBalance.lt(sellOrder.size)) {
      throw new Error(
        `sellerQuoteAssetBalance: ${sellerQuoteAssetBalance} must be larger than the sellOrder size: ${sellOrder.size}`
      );
    }
    const buyerBaseAssetBalance = await getAvailableBalance({
      address: buyer,
      tokenContractAddress: common.baseAsset,
    });
    console.log(`buyerBaseAssetBalance: ${buyerBaseAssetBalance}`);
    console.log(`sellOrder.price: ${sellOrder.price}`);
    console.log(`buyOrder.size: ${buyOrder.size}`);
  } else {
    //  PUT OPTION
  }

  console.log({ sellOrder, buyOrder, common, sellSig, buySig });
  console.log(await signer.getAddress());
  console.log(signedSellOrder);
  const addressFromSell = await validateOrderAddress(signedSellOrder);
  console.log(addressFromSell);
  const addressFromBuy = await validateOrderAddress(signedBuyOrder);
  console.log(addressFromBuy);
  const result = await shrubContract.matchOrder(
    sellOrder,
    buyOrder,
    common,
    sellSig,
    buySig
  );
  return result;
}
