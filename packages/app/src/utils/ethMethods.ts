import {ethers} from "ethers";
import {FakeToken__factory} from "@shrub/contracts/types/ethers-v5";
import {ShrubExchange__factory} from "@shrub/contracts/types/ethers-v5";
import { Currencies } from "../constants/currencies";
import {
  ApiOrder,
AppOrderSigned,
  IOrder,
  OrderCommon, PostOrder,
  Signature,
  SmallOrder,
  UnsignedOrder,
} from "../types";
import { Shrub712 } from "./EIP712";
import Web3 from "web3";
import {useWeb3React} from "@web3-react/core";
import {JsonRpcProvider} from "@ethersproject/providers";

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

export function fromEthDate(ethDate: number) {
  return new Date(ethDate * 1000);
}

export function orderWholeUnitsToBaseUnits(unsignedOrder: UnsignedOrder) {
  const { size, price, fee } = unsignedOrder;
  return {
    ...unsignedOrder,
    size: ethers.utils.parseUnits(size.toString()).toString(),
    price: ethers.utils.parseUnits(price.toString()).toString(),
    fee: ethers.utils.parseUnits(fee.toString()).toString(),
  };

}

export async function signOrder(unsignedOrder: UnsignedOrder, provider: JsonRpcProvider) {
  const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
  // const order = {
  //   ...unsignedOrder,
  // };
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
    unsignedOrder,
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

export async function getDecimalsFor(token: string, provider: JsonRpcProvider) {
  const decimals = 18;
  if (token === ethers.constants.AddressZero) {
    return decimals;
  }

  const erc20Contract = FakeToken__factory.connect(token, provider)
  return erc20Contract.decimals();
}

export async function getSymbolFor(token: string, provider: JsonRpcProvider) {
  if (token === ethers.constants.AddressZero) {
    return 'ETH';
  }
  const erc20Contract = FakeToken__factory.connect(token, provider);
  return erc20Contract.symbol();
}

export async function getWalletBalance(address: string, provider: JsonRpcProvider) {
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

export async function depositEth(amount: ethers.BigNumber, provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer)
  return shrubContract.deposit(ZERO_ADDRESS, amount, { value: amount });
}

export async function getAllowance(
    tokenContractAddress: string,
    provider: JsonRpcProvider,
) {
  const signer = provider.getSigner();
  const erc20Contract = FakeToken__factory.connect(tokenContractAddress, signer);
  const signerAddress = await signer.getAddress();
  return await erc20Contract.allowance(signerAddress, SHRUB_CONTRACT_ADDRESS);
}

export async function depositToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: JsonRpcProvider,
) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const allowance = await getAllowance(tokenContractAddress, provider);
  if (allowance.lt(amount)) {
    throw new Error("Looks like you need to approve first.");
  }
  return shrubContract.deposit(tokenContractAddress, amount);
}

export async function approveToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const bigAmount = amount;
  const erc20Contract = FakeToken__factory.connect(tokenContractAddress, signer);
  const allowance = await getAllowance(tokenContractAddress, provider);
  if (allowance.gte(bigAmount)) {
    throw new Error("Allowance is sufficient. You don't need to approve");
  }
  return erc20Contract.approve(SHRUB_CONTRACT_ADDRESS, ethers.constants.WeiPerEther.mul(1000000000));
}

export async function withdraw(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const signerAddress = await signer.getAddress();
  const availableBalance = await shrubContract.getAvailableBalance(signerAddress, tokenContractAddress);
  if (amount.gt(availableBalance)) {
    throw new Error(`Not enough balance. You have ${availableBalance}.` );
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

export async function getAddressFromSignedOrder(order: IOrder, provider: JsonRpcProvider) {
  const sig = iOrderToSig(order);
  const smallOrder = iOrderToSmall(order);
  const commonOrder = iOrderToCommon(order);

  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  return shrubContract.getAddressFromSignedOrder(smallOrder, commonOrder, sig);
}

export async function validateOrderAddress(order: IOrder, provider: JsonRpcProvider) {
  const { address } = order;
  const derivedAddress = await getAddressFromSignedOrder(order, provider);
  return address === derivedAddress;
}

export async function getUserNonce(
  params: Pick<IOrder, "address" | "quoteAsset" | "baseAsset">,
  provider: JsonRpcProvider
) {
  const { address, quoteAsset, baseAsset } = params;
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const bigNonce = await shrubContract.getCurrentNonce(address, quoteAsset, baseAsset);
  return bigNonce.toNumber();
}

export async function getAvailableBalance(params: {
  address: string,
  tokenContractAddress: string,
  provider: JsonRpcProvider
}) {
  const { address, tokenContractAddress, provider } = params;
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  return shrubContract.getAvailableBalance(address, tokenContractAddress)
}

export function getLockedBalance(address: string, tokenContractAddress: string, provider: JsonRpcProvider) {
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  return shrubContract.userTokenLockedBalance(address, tokenContractAddress);
}

export async function matchOrder(params: {
  signedBuyOrder: IOrder;
  signedSellOrder: IOrder;
}, provider: JsonRpcProvider) {
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
      `SellerNonce: ${sellerNonce} must be 1 less than the sell order nonce: ${sellOrder.nonce}`
    );
  }
  if (buyOrder.nonce - 1 !== buyerNonce) {
    throw new Error(
      `BuyerNonce: ${buyerNonce} must be 1 less than the buy order nonce: ${buyOrder.nonce}`
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
        `SellerQuoteAssetBalance: ${sellerQuoteAssetBalance} must be larger than the sellOrder size: ${sellOrder.size}`
      );
    }
  } else {
    //  PUT OPTION
  }

  console.log({ sellOrder, buyOrder, common, sellSig, buySig });
  return shrubContract.matchOrder(sellOrder, buyOrder, common, sellSig, buySig);
}

export async function matchOrders(signedBuyOrders: IOrder[], signedSellOrders: IOrder[], provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);

  const buyOrders: SmallOrder[] = [];
  const sellOrders: SmallOrder[] = [];
  const commons: OrderCommon[] = [];
  const buySigs: Signature[] = [];
  const sellSigs: Signature[] = [];

  for (const signedBuyOrder of signedBuyOrders) {
    buyOrders.push(iOrderToSmall(signedBuyOrder));
    buySigs.push(iOrderToSig(signedBuyOrder));
  }
  for (const signedSellOrder of signedSellOrders) {
    sellOrders.push(iOrderToSmall(signedSellOrder));
    sellSigs.push(iOrderToSig(signedSellOrder));
    commons.push(iOrderToCommon(signedSellOrder));
  }

  return shrubContract.matchOrders(sellOrders, buyOrders, commons, sellSigs, buySigs);
}


export async function getFilledOrders(
    address: string,
    provider: JsonRpcProvider,
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
    const { positionHash, common, buyOrder, seller } = event.args;
    const { baseAsset, quoteAsset, strike, expiry, optionType } = common;
    const dateExpiry = new Date(expiry.toNumber() * 1000);
    if (!openOrders[positionHash]) {
      const amount = await userOptionPosition(address, positionHash, provider);
      openOrders[positionHash] = {
        common,
        buyOrder,
        seller,
        baseAsset,
        quoteAsset,
        pair: getPair(baseAsset, quoteAsset),
        strike: ethers.utils.formatUnits(strike, 6),  // Divide out the base shift of 1M
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

export async function userOptionPosition(address: string, positionHash: string, provider: JsonRpcProvider) {
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const bigBalance = await shrubContract.userOptionPosition(address, positionHash);
  return ethers.utils.formatUnits(bigBalance);
}

export async function exercise(order: IOrder, seller: string, provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const buyOrder = iOrderToSmall(order);
  const common = iOrderToCommon(order);
  const buySig = iOrderToSig(order);
  const executed = await shrubContract.execute(buyOrder,common,seller,buySig);
  return executed;
}

export function iOrderToPostOrder(order: IOrder): PostOrder {
  const { strike, size, price, fee } = order;
  return {
    ...order,
    strike: strike.toString(),
    size: size.toString(),
    price: price.toString(),
    fee: fee.toString(),
  }
}

export function optionTypeToString(numericOptionType: 0 | 1) {
  return numericOptionType ? 'CALL' : 'PUT';
}

export function optionTypeToNumber(stringOptionType: 'CALL' | 'PUT') {
  return stringOptionType === 'CALL' ? 1 : 0;
}

export function isBuyToOptionAction(isBuy: boolean) {
  return isBuy ? 'BUY' : 'SELL';
}

export function optionActionToIsBuy(optionAction: 'BUY' | 'SELL') {
  return optionAction === 'BUY'
}

export function formatStrike(strike: ethers.BigNumber) {
  return Number(ethers.utils.formatUnits(strike, 6)).toFixed(0);
}

export function formatDate(date: number | Date) {
  if (date instanceof Date) {
    return date.toLocaleDateString('en-us', {month: "short", day: "numeric"})
  }
  return fromEthDate(date).toLocaleDateString('en-us', {month: "short", day: "numeric"})
}

export function transformOrderApiApp(order: ApiOrder): AppOrderSigned {
  const { baseAsset, quoteAsset, nonce, address, r, s, v } = order;
  const expiry = fromEthDate(order.expiry);
  const strike = ethers.BigNumber.from(order.strike.$numberDecimal);
  const optionType = optionTypeToString(order.optionType);
  const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
  const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike

  const size = ethers.BigNumber.from(order.size.$numberDecimal);
  const formattedSize = ethers.utils.formatUnits(size, 18);
  const optionAction = isBuyToOptionAction(order.isBuy);
  const totalPrice = ethers.BigNumber.from(order.price.$numberDecimal);
  const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
  const offerExpire = fromEthDate(order.offerExpire);
  const fee = ethers.BigNumber.from(order.fee.$numberDecimal);
  const formattedFee = ethers.utils.formatUnits(fee, 18);
  return {
    baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, address
  };
}

export function transformOrderAppChain(order: AppOrderSigned): IOrder {
  const { baseAsset, quoteAsset, address, size, expiry, strike, optionType, optionAction, fee, totalPrice, offerExpire, nonce, r, s, v} = order;
  return {
    baseAsset,
    quoteAsset,
    expiry: toEthDate(expiry),
    strike,
    optionType: optionTypeToNumber(optionType),
    s,
    v,
    r,
    price: totalPrice,
    fee,
    size,
    isBuy: optionActionToIsBuy(optionAction),
    nonce,
    offerExpire: toEthDate(offerExpire),
    address: address || ''
  }
}
