import {BytesLike, ethers} from "ethers";
import {
  SUSDToken__factory,
  ShrubExchange,
  ERC20__factory,
  TokenFaucet__factory,
} from '@shrub/contracts/types/ethers-v5'
import {ShrubExchange__factory, HashUtil__factory} from "@shrub/contracts/types/ethers-v5";
import { Currencies } from "../constants/currencies";
import {
  ApiOrder,
  AppOrder,
  AppOrderSigned,
  IndexedAppOrderSigned,
  IOrder, LastOrders,
  OrderCommon,
  PostOrder,
  SellBuy,
  Signature,
  SmallOrder,
  UnsignedOrder,
} from '../types'
import { Shrub712 } from "./EIP712";
import Web3 from "web3";
import {useWeb3React} from "@web3-react/core";
import {JsonRpcProvider} from "@ethersproject/providers";


const SHRUB_CONTRACT_ADDRESS = process.env.REACT_APP_SHRUB_ADDRESS || "";
const HASH_UTIL_CONTRACT_ADDRESS = process.env.REACT_APP_HASH_UTIL_ADDRESS || "";
const SUSD_TOKEN_ADDRESS = process.env.REACT_APP_SUSD_TOKEN_ADDRESS || "";
const FAUCET_CONTRACT_ADDRESS = process.env.REACT_APP_FAUCET_ADDRESS || "";
const ZERO_ADDRESS = ethers.constants.AddressZero;
const { Zero } = ethers.constants;
const COMMON_TYPEHASH = ethers.utils.id('OrderCommon(address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)');
const ORDER_TYPEHASH = ethers.utils.id('Order(uint size, address signer, bool isBuy, uint nonce, uint price, uint offerExpire, uint fee, address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)');
const MAX_SCAN_BLOCKS = Number(process.env.REACT_APP_MAX_SCAN_BLOCKS);
if (!SHRUB_CONTRACT_ADDRESS) {
  throw new Error(
    "Missing configuration. Please add REACT_APP_SHRUB_ADDRESS to your .env file"
  );
}
if (!HASH_UTIL_CONTRACT_ADDRESS) {
  throw new Error(
    "Missing configuration. Please add REACT_APP_HASH_UTIL_ADDRESS to your .env file"
  );
}
if (!SUSD_TOKEN_ADDRESS) {
  throw new Error(
    "Missing configuration. Please add REACT_APP_SUSD_TOKEN_ADDRESS to your .env file"
  );
}

let _shrubContract: ShrubExchange | undefined

function getShrubContract(provider: JsonRpcProvider) {
  if (!_shrubContract) {
    _shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  }
  return _shrubContract;
}


export function getAddress(provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  return signer.getAddress();
}

export function useGetProvider() {
  const { library: provider, active, account } = useWeb3React();
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
  const web3 = new Web3(window.ethereum as any);
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer)
  const orderTypeHash = await shrubContract.ORDER_TYPEHASH();
  const address = await signer.getAddress();
  const { order: resOrder, sig } = await shrubInterface.signOrderWithWeb3(
    web3,
    orderTypeHash,
    {
      ...unsignedOrder,
      fee: unsignedOrder.fee.toString(),
      price: unsignedOrder.price.toString(),
      size: unsignedOrder.size.toString(),
      strike: unsignedOrder.strike.toString(),
    },
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

  const erc20Contract = SUSDToken__factory.connect(token, provider)
  return erc20Contract.decimals();
}

export async function getSymbolFor(token: string, provider: JsonRpcProvider) {
  if (token === ethers.constants.AddressZero) {
    return 'MATIC';
  }
  const erc20Contract = SUSDToken__factory.connect(token, provider);
  return erc20Contract.symbol();
}

export async function getBigWalletBalance(address: string, provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  let bigBalance;
  let decimals = 18;
  if (address === Currencies.MATIC.address) {
    // Basically it is MATIC
    bigBalance = await provider.getBalance(signer.getAddress());
  } else {
    // ERC-20 token logic
    const erc20Contract = SUSDToken__factory.connect(address, provider)
    const signerAddress = await signer.getAddress();
    bigBalance = await erc20Contract.balanceOf(signerAddress);
    decimals = await erc20Contract.decimals();
  }
  return { bigBalance, decimals };
}

export async function getWalletBalance(address: string, provider: JsonRpcProvider) {
  const { bigBalance, decimals } = await getBigWalletBalance(address, provider);
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
  const erc20Contract = SUSDToken__factory.connect(tokenContractAddress, signer);
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
  const erc20Contract = SUSDToken__factory.connect(tokenContractAddress, signer);
  const allowance = await getAllowance(tokenContractAddress, provider);
  const {bigBalance: ethBalance} = await getBigWalletBalance(ethers.constants.AddressZero, provider);
  if(ethBalance.eq(ethers.constants.Zero)) {
    throw new Error("Looks like you don't have any MATIC in this account. You need that to pay for gas.");
  }

  if (allowance.gte(bigAmount) && allowance.gt(ethers.constants.Zero)) {
    throw new Error("Allowance is sufficient. You don't need to approve.");
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
    throw new Error(`Not enough balance. You have ${ethers.utils.formatUnits(availableBalance, 18)}` );
  }
  return shrubContract.withdraw(tokenContractAddress, amount);
}

export async function buyFromFaucet(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const tokenContract = ERC20__factory.connect(tokenContractAddress, signer);
  const faucetContract = TokenFaucet__factory.connect(FAUCET_CONTRACT_ADDRESS, signer);
  const signerAddress = await signer.getAddress();
  const maticBalance = await provider.getBalance(signerAddress);
  const rate = await faucetContract.tokenRates(tokenContractAddress);
  if (amount.gt(maticBalance)) {
    throw new Error(`Only ${ethers.utils.formatUnits(maticBalance, 18)} MATIC detected in your wallet. Try increasing the MATIC balance.` );
  }
  return faucetContract.buyFromFaucet(tokenContractAddress, { value: amount })
};

export async function sellToFaucet() {}

export async function getAddressFromSignedOrder(order: IOrder, provider: JsonRpcProvider) {
  const sig = iOrderToSig(order);
  const smallOrder = iOrderToSmall(order);
  const commonOrder = iOrderToCommon(order);

  // const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const hashUtil = HashUtil__factory.connect(HASH_UTIL_CONTRACT_ADDRESS, provider);
  return hashUtil.getAddressFromSignedOrder(smallOrder, commonOrder, sig);
}

export async function validateOrderAddress(order: IOrder, provider: JsonRpcProvider) {
  const { address } = order;
  const derivedAddress = await getAddressFromSignedOrder(order, provider);
  return address === derivedAddress;
}

export async function getUserNonce(
  address: string,
  common: OrderCommon,
  provider: JsonRpcProvider
) {
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const bigNonce = await shrubContract.getCurrentNonce(address, common);
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

// export async function matchOrder(params: {
//   signedBuyOrder: IOrder;
//   signedSellOrder: IOrder;
// }, provider: JsonRpcProvider) {
//   const { signedBuyOrder, signedSellOrder } = params;
//   const shrubInterface = new Shrub712(1337, SHRUB_CONTRACT_ADDRESS);
//   const sellOrder: SmallOrder = shrubInterface.toSmallOrder(signedSellOrder);
//   const buyOrder = shrubInterface.toSmallOrder(signedBuyOrder);
//   const common = shrubInterface.toCommon(signedBuyOrder);
//   const sellSig = iOrderToSig(signedSellOrder);
//   const buySig = iOrderToSig(signedBuyOrder);
//
//   const signer = provider.getSigner();
//   const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
//
//   //  All of the validations that the smart contract does
//   const seller = await getAddressFromSignedOrder(signedSellOrder, provider);
//   const buyer = await getAddressFromSignedOrder(signedBuyOrder, provider);
//   const sellerNonce = await getUserNonce(seller, common, provider);
//   const buyerNonce = await getUserNonce(buyer, common, provider);
//   if (sellOrder.nonce - 1 !== sellerNonce) {
//     throw new Error(
//       `SellerNonce: ${sellerNonce} must be 1 less than the sell order nonce: ${sellOrder.nonce}`
//     );
//   }
//   if (buyOrder.nonce - 1 !== buyerNonce) {
//     throw new Error(
//       `BuyerNonce: ${buyerNonce} must be 1 less than the buy order nonce: ${buyOrder.nonce}`
//     );
//   }
//   if (common.optionType === 1) {
//     //  CALL OPTION
//     const sellerQuoteAssetBalance = await getAvailableBalance({
//       address: seller,
//       tokenContractAddress: common.quoteAsset,
//       provider
//     });
//     if (sellerQuoteAssetBalance.lt(sellOrder.size)) {
//       throw new Error(
//         `SellerQuoteAssetBalance: ${sellerQuoteAssetBalance} must be larger than the sellOrder size: ${sellOrder.size}`
//       );
//     }
//   } else {
//     //  PUT OPTION
//   }
//
//   console.log({ sellOrder, buyOrder, common, sellSig, buySig });
//   return shrubContract.matchOrder(sellOrder, buyOrder, common, sellSig, buySig);
// }

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

  // TODO: Add some validation on here like there was for matchOrder

  return shrubContract.matchOrders(sellOrders, buyOrders, commons, sellSigs, buySigs);
}

function validateBlockRange(fromBlock: ethers.providers.BlockTag, toBlock: ethers.providers.BlockTag) {
  if (isNaN(Number(fromBlock))) {
    throw new Error(`fromBlock must be a number: ${fromBlock}-${toBlock}`);
  }
  if (toBlock === 'latest') {
    if (fromBlock < -1 * MAX_SCAN_BLOCKS) {
      throw new Error(`fromBlock out of range from "latest": ${fromBlock}-${toBlock}`);
    }
    if (fromBlock >= 0) {
      throw new Error(`fromBlock must be relative to latest if toBlock is "latest": ${fromBlock}-${toBlock}`);
    }
  } else if (isNaN(Number(toBlock))) {
    throw new Error(`toBlock must either be a number or "latest": ${fromBlock}-${toBlock}`);
  }
  if (Number(toBlock) - Number(fromBlock) > MAX_SCAN_BLOCKS) {
    throw new Error(`fromBlock to toBlock range exceeds ${MAX_SCAN_BLOCKS}: ${fromBlock}-${toBlock}`);
  }
}

export function getMatchEvents({buyerAddress, sellerAddress, positionHash, provider, fromBlock = -1 * MAX_SCAN_BLOCKS, toBlock = 'latest'}: {
  buyerAddress?: string,
  sellerAddress?: string,
  positionHash?: string,
  provider: JsonRpcProvider,
  fromBlock: ethers.providers.BlockTag,
  toBlock: ethers.providers.BlockTag
}) {
  validateBlockRange(fromBlock, toBlock);
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const filter = shrubContract.filters.OrderMatched(sellerAddress, buyerAddress);
  return shrubContract.queryFilter(filter, fromBlock, toBlock);
}

export async function announceOrder(signedOrder: IOrder, provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const common = iOrderToCommon(signedOrder);
  const smallOrder = iOrderToSmall(signedOrder);
  const sig = iOrderToSig(signedOrder);
  return shrubContract.announce(smallOrder, common, sig);
}

export function cancelOrder(order: IOrder, provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  return shrubContract.cancel(order);
}

export function getAnnouncedEvents({provider, positionHash, user, fromBlock = -1 * MAX_SCAN_BLOCKS, toBlock = 'latest'}: {
  provider: JsonRpcProvider,
  positionHash?: BytesLike,
  user?: string,
  fromBlock?: ethers.providers.BlockTag,
  toBlock?: ethers.providers.BlockTag
}) {
  validateBlockRange(fromBlock, toBlock);
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const filter = shrubContract.filters.OrderAnnounce(null, positionHash, user);
  return shrubContract.queryFilter(filter, fromBlock, toBlock)
}

export async function getAnnouncedEvent(provider: JsonRpcProvider, positionHash: BytesLike, user: string, blockNumber: number): Promise<AppOrderSigned[] | null> {
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, provider);
  const filter = shrubContract.filters.OrderAnnounce(null, positionHash, user);
  const matchingEvents = await shrubContract.queryFilter(filter, blockNumber, blockNumber);
  if (!matchingEvents || !matchingEvents[0] || !matchingEvents[0].args) {
    return null;
  }
  const appOrdersSigned: IndexedAppOrderSigned[] = [];
  for (const matchingEvent of matchingEvents) {
    const { transactionHash, args: event } = matchingEvent;
    const {common, order, sig} = event;
    const { baseAsset, quoteAsset, strike } = common;
    const { size, fee } = order;
    const { r, s, v } = sig;

    const expiry = fromEthDate(common.expiry.toNumber());
    const optionType = optionTypeToString(common.optionType);
    const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
    const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike
    const nonce = order.nonce.toNumber();
    const formattedSize = ethers.utils.formatUnits(size, 18);
    const optionAction = isBuyToOptionAction(order.isBuy);
    const totalPrice = ethers.BigNumber.from(order.price);
    const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
    const offerExpire = fromEthDate(order.offerExpire.toNumber());
    const formattedFee = ethers.utils.formatUnits(fee, 18);
    const appOrderSigned: IndexedAppOrderSigned = {
      baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, r, s, v, transactionHash
    }
    const address = user;
    appOrderSigned.address = address;
    appOrdersSigned.push(appOrderSigned);
  }
  return appOrdersSigned;
}

export function subscribeToAnnouncements(provider: JsonRpcProvider, positionHash: BytesLike | null, user: string | null, callback: any) {
  const shrubContract = getShrubContract(provider);
  const filter = shrubContract.filters.OrderAnnounce(null, positionHash, user);
  shrubContract.on(filter, (common,positionHash,user, order,sig,eventInfo) => callback({common, positionHash, user, order, sig, eventInfo}));
}

export function unsubscribeFromAnnouncements(provider: JsonRpcProvider) {
  const shrubContract = getShrubContract(provider);
  return shrubContract.removeAllListeners()
}

// Only searches back 1000 blocks - in future we can search back further for options where no last is found
export async function getLastOrders(provider: JsonRpcProvider) {
  const lastOrders: LastOrders = {}
  const matchEvents = await getMatchEvents({
    provider,
    fromBlock: -1 * MAX_SCAN_BLOCKS,
    toBlock: 'latest'
  });
  for (const event of matchEvents) {
    const { positionHash, buyOrder } = event.args;
    const { size, price } = buyOrder;
    const unitPrice = Number(ethers.utils.formatUnits(price, 18)) / Number(ethers.utils.formatUnits(size, 18));
    if (!lastOrders[positionHash] || lastOrders[positionHash] < unitPrice) {
      lastOrders[positionHash] = unitPrice;
    }
  }
  return lastOrders;
}

export async function getMatchedOrders(
  address: string,
  provider: JsonRpcProvider,
  fromBlock: ethers.providers.BlockTag = 0,
  toBlock: ethers.providers.BlockTag = "latest",
) {
  const sellOrdersMatched = await getMatchEvents({provider, sellerAddress: address, fromBlock, toBlock})
  const buyOrdersMatched = await getMatchEvents({provider, buyerAddress: address, fromBlock, toBlock})
  return [...sellOrdersMatched, ...buyOrdersMatched];
}

export async function getFilledOrders(
    address: string,
    provider: JsonRpcProvider,
    fromBlock: ethers.providers.BlockTag = 0,
    toBlock: ethers.providers.BlockTag = "latest",
) {
  const openOrders = {} as any;
  const matchedOrders = await getMatchedOrders(address, provider, fromBlock, toBlock);
  for (const event of matchedOrders) {
    if (!event) {
      continue;
    }
    const { positionHash, common, buyOrder, seller } = event.args;
    const { baseAsset, quoteAsset, strike, expiry, optionType } = common;
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
        expiry: formatDate(expiry.toNumber()),
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
    return 'MATIC';
  }
  if (process.env.REACT_APP_SUSD_TOKEN_ADDRESS && address.toLowerCase() === process.env.REACT_APP_SUSD_TOKEN_ADDRESS.toLowerCase()) {
    return 'SUSD';
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
  const executed = await shrubContract.exercise(buyOrder.size, common);
  return executed;
}

export async function exerciseLight(common: OrderCommon, size: ethers.BigNumber, provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const shrubContract = ShrubExchange__factory.connect(SHRUB_CONTRACT_ADDRESS, signer);
  const executed = await shrubContract.exercise(size, common);
  return executed;
}

export function hashOrderCommon(common: OrderCommon) {
  const { baseAsset, quoteAsset, expiry, strike, optionType } = common;
  return ethers.utils.solidityKeccak256(['bytes32', 'address', 'address', 'uint', 'uint', 'uint8'],[COMMON_TYPEHASH, baseAsset, quoteAsset, expiry, strike, optionType]);
}

export function unboundToBoundOptionType(unboundOptionType: number): 0 | 1 {
  return unboundOptionType ? 1 : 0;
}

export function optionTypeToString(numericOptionType: number) {
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
  return Number(ethers.utils.formatUnits(strike, 6)).toFixed(2);
}

export function formatDate(date: number | Date) {
  if (date instanceof Date) {
    return date.toLocaleDateString('en-us', {month: "short", day: "numeric"})
  }
  return fromEthDate(date).toLocaleDateString('en-us', {month: "short", day: "numeric"})
}

export function formatTime(date: number | Date) {
  if (date instanceof Date) {
    return date.toLocaleTimeString('en-us', {hour: "numeric", minute: "2-digit"})
  }
  return fromEthDate(date).toLocaleTimeString('en-us', {hour: "numeric", minute: "2-digit"})
}

export function shortOptionName(order: Pick<AppOrder, 'optionAction' | 'formattedSize' | 'optionType' | 'formattedStrike' | 'formattedExpiry'>) {
  const {optionAction, formattedSize, optionType, formattedStrike, formattedExpiry} = order;
  return `${optionAction} ${formattedSize} ${optionType} ${formattedExpiry} $${formattedStrike}`
}

export function orderStatus(order: AppOrderSigned, userPairNonce: number, matchedOrders: any, date?: Date): 'expired'|'cancelled'|'completed'|'active' {
  if (!date) {
    date = new Date();
  }
  const { baseAsset, quoteAsset, fee, expiry, optionType, strike, nonce, offerExpire, totalPrice, size, optionAction } = order
  const matchArr: AppOrder[] = optionAction === 'BUY' ? matchedOrders.buy : matchedOrders.sell;
  if (matchArr.find((o) => {
    return baseAsset === o.baseAsset &&
      quoteAsset === o.quoteAsset &&
      fee.eq(o.fee) &&
      expiry.getTime() === o.expiry.getTime() &&
      optionType === o.optionType &&
      strike.eq(o.strike) &&
      nonce === o.nonce &&
      offerExpire.getTime() === o.offerExpire.getTime() &&
      totalPrice.eq(o.totalPrice) &&
      size.eq(o.size) &&
      optionAction === o.optionAction;
  })) {
    return 'completed'
  }
  if (order.offerExpire < date) {
    return 'expired';
  }
  console.log(nonce, userPairNonce);
  if (nonce <= userPairNonce) {
    return 'cancelled';
  }
  return 'active';
}

export function getBlockNumber(provider: JsonRpcProvider) {
  return provider.getBlockNumber();
}

function cleanupDecimalString(decimalString: string, decimals: number) {
  const splitArr = decimalString.split('.');
  const integerPart = splitArr[0];
  const decimalPart = splitArr[splitArr.length - 1];
  const cutDecimalPart = decimalPart.slice(0, decimals);
  return [integerPart, cutDecimalPart].join('.');
}

export function getOrderStack(userOptionResult: any) {
  const { balance, option, buyOrders, sellOrders } = userOptionResult;
  const lastPrice = cleanupDecimalString(option.lastPrice, 18);
  const bigLastPrice = ethers.utils.parseUnits(lastPrice, 18);
  let runningBalance = Zero;
  const orderStack = [];
  const matches = [];
  for (const buyOrder of buyOrders) {
    for (const match of buyOrder.matches) {
      matches.push({...match, type: 'buy'})
    }
  }
  for (const sellOrder of sellOrders) {
    for (const match of sellOrder.matches) {
      matches.push({...match, type: 'sell'})
    }
  }
  const sortedMatches = matches.sort((a: any, b:any) => a.block - b.block);
  for (const match of sortedMatches) {
    const { totalFee, type, block, id: matchId } = match;
    const size = cleanupDecimalString(match.size, 6);
    const finalPrice = cleanupDecimalString(match.finalPrice, 18);
    const finalPricePerContract = cleanupDecimalString(match.finalPricePerContract, 18);
    let remainingSize = ethers.utils.parseUnits(size, 6);
    let remainingFinalPrice = ethers.utils.parseUnits(finalPrice, 18);
    if (type === 'sell') {
      remainingSize = remainingSize.mul(-1);
      remainingFinalPrice = remainingFinalPrice.mul(-1);
    }
    if (
      (type === 'sell' && runningBalance.gt(0)) ||
      (type === 'buy' && runningBalance.lt(0))
    ) {
      // If type is sell and runningBalance is positive or
      // if type is buy and runningBalance is negative then
      // the order should be used to work through the stack in a FIFO manner to realize gains/losses
      // any remainder of this should be added to a new stack

      const unrealizedStack = orderStack.filter(o => !o.unrealizedSize.eq(Zero));
      for (const stackElem of unrealizedStack) {
        if (stackElem.unrealizedSize.abs().lte(remainingSize.abs())) {
          // Case: stackElem will become fully realized
          const amount = stackElem.unrealizedSize;
          const partialCostBasis = amount.mul(stackElem.pricePerContract).div(1e6);
          const partialSalePrice = amount.mul(ethers.utils.parseUnits(finalPricePerContract,18)).div(1e6);
          const realizedGain = type === 'buy' ? partialCostBasis.sub(partialSalePrice): partialSalePrice.sub(partialCostBasis);
          stackElem.realizedSize = type === 'buy' ? stackElem.realizedSize.sub(amount) : stackElem.realizedSize.add(amount);
          stackElem.unrealizedSize = Zero;
          stackElem.realizedGain = stackElem.realizedGain.add(realizedGain);
          stackElem.unrealizedGain = Zero;
          stackElem.realizedCostBasis = stackElem.realizedCostBasis.add(partialCostBasis);
          stackElem.realizedMatches.push(matchId);
          remainingSize = remainingSize.sub(amount);
          remainingFinalPrice = remainingFinalPrice.sub(partialSalePrice);
          runningBalance = runningBalance.sub(amount)
        } else {
          // Case: stackElem will be partially realized - match totally consumed
          const partialCostBasis = remainingSize.mul(stackElem.pricePerContract).div(1e6)
          const realizedGain = type === 'buy' ? partialCostBasis.sub(remainingFinalPrice) : remainingFinalPrice.sub(partialCostBasis);
          stackElem.realizedSize = type === 'buy' ? stackElem.realizedSize.sub(remainingSize) : stackElem.realizedSize.add(remainingSize);
          stackElem.unrealizedSize = type === 'buy' ? stackElem.unrealizedSize.add(remainingSize) : stackElem.unrealizedSize.sub(remainingSize);
          stackElem.realizedGain = stackElem.realizedGain.add(realizedGain);
          stackElem.unrealizedGain = Zero // This is to be filled in at the end;
          stackElem.realizedCostBasis = stackElem.realizedCostBasis.add(partialCostBasis);
          stackElem.realizedMatches.push(matchId);
          remainingSize = Zero;
          runningBalance = runningBalance.add(remainingSize);
          break;
        }
      }
    }
    // if there is remainingSize - a new record should be added to the stack
    if (remainingSize.eq(Zero)) {
      break;
    }
    runningBalance = runningBalance.add(remainingSize)
    orderStack.push({
      blockNumber: block,
      size: remainingSize,
      totalPrice: remainingFinalPrice,
      pricePerContract: ethers.utils.parseUnits(finalPricePerContract, 18),
      realizedSize: Zero,
      realizedGain: Zero,
      realizedCostBasis: Zero,
      unrealizedSize: remainingSize,
      unrealizedGain: Zero, // This is to be filled in at the end
      realizedMatches: ['']
    })
  }
  // Calculate unrealized gain/loss
  let totalRealizedCostBasis = Zero;
  let totalUnrealizedCostBasis = Zero;
  let totalRealizedGain = Zero;
  let totalUnrealizedGain = Zero;
  let totalValue = balance * Number(lastPrice);
  for (const stackElem of orderStack) {
    if (!stackElem.unrealizedSize.eq(Zero)) {
      const unrealizedCostBasis = stackElem.totalPrice.abs().sub(stackElem.realizedCostBasis);
      const lastValue = stackElem.unrealizedSize.mul(bigLastPrice).div(1e6)
      stackElem.unrealizedGain = stackElem.unrealizedSize.gt(0) ? lastValue.sub(unrealizedCostBasis) : unrealizedCostBasis.add(lastValue);
      totalUnrealizedCostBasis = totalUnrealizedCostBasis.add(unrealizedCostBasis);
      totalUnrealizedGain = totalUnrealizedGain.add(stackElem.unrealizedGain);
    }
    totalRealizedCostBasis = totalRealizedCostBasis.add(stackElem.realizedCostBasis);
    totalRealizedGain = totalRealizedGain.add(stackElem.realizedGain);
  }

  return {
    totalRealizedCostBasis: ethers.utils.formatUnits(totalRealizedCostBasis, 18),
    totalRealizedGain: ethers.utils.formatUnits(totalRealizedGain, 18),
    totalUnrealizedCostBasis: ethers.utils.formatUnits(totalUnrealizedCostBasis, 18),
    totalUnrealizedGain: Number(ethers.utils.formatUnits(totalUnrealizedGain, 18)),
    amount: balance,
    lastPrice: Number(lastPrice),
    totalValue,
    orderStack
  };
}

// Order Conversion

export function matchEventToAppOrder(userEvent: any, orderType: SellBuy) {
  const { args } = userEvent;
  const { common, user: address } = args;
  const order = orderType === 'BUY' ? args.buyOrder : args.sellOrder;
  const { baseAsset, quoteAsset, strike } = common;
  const { size, fee } = order;
  const expiry = fromEthDate(common.expiry.toNumber());
  const optionType = optionTypeToString(common.optionType);
  const formattedExpiry = expiry.toLocaleDateString('en-us', {month: "short", day: "numeric"});
  const formattedStrike = ethers.utils.formatUnits(strike, 6);  // Need to divide by 1M to get the actual strike
  const nonce = order.nonce.toNumber();
  const formattedSize = ethers.utils.formatUnits(size, 18);
  const optionAction = isBuyToOptionAction(order.isBuy);
  const totalPrice = ethers.BigNumber.from(order.price);
  const unitPrice = Number(ethers.utils.formatUnits(totalPrice, 18)) / Number(formattedSize);
  const offerExpire = fromEthDate(order.offerExpire.toNumber());
  const formattedFee = ethers.utils.formatUnits(fee, 18);
  const appOrderSignedNumbered: AppOrder = {
    baseAsset, quoteAsset, expiry, strike, optionType, formattedExpiry, formattedStrike, formattedSize, optionAction, nonce, unitPrice, offerExpire, fee, size, totalPrice, formattedFee, address
  }
  return appOrderSignedNumbered;
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

// End Order Conversion
