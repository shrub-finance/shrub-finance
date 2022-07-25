import { BytesLike, ethers } from "ethers";
import {
  SUSDToken__factory,
  PaperSeed__factory,
  SeedOrphanage__factory,
  PotNFTTicket__factory,
  ERC1155__factory,
  ERC721__factory,
  PaperPot__factory,
  PaperPotMint__factory,
  WaterFaucet__factory,
} from "@shrub/contracts/types";
import { Currencies } from "../constants/currencies";
import { OrderCommon, UnsignedOrder } from "../types";
import { useWeb3React } from "@web3-react/core";
import { JsonRpcProvider } from "@ethersproject/providers";

const PAPERSEED_CONTRACT_ADDRESS =
  process.env.REACT_APP_PAPERSEED_ADDRESS || "";
const ORPHANAGE_CONTRACT_ADDRESS =
  process.env.REACT_APP_ORPHANAGE_ADDRESS || "";
const NFT_TICKET_ADDRESS = process.env.REACT_APP_NFT_TICKET_ADDRESS || "";
const PAPER_POT_ADDRESS = process.env.REACT_APP_PAPER_POT_ADDRESS || "";
const PAPERPOTMINT_ADDRESS = process.env.REACT_APP_PAPERPOTMINT_ADDRESS || "";
const WATER_FAUCET_ADDRESS = process.env.REACT_APP_WATER_FAUCET_ADDRESS || "";

const ZERO_ADDRESS = ethers.constants.AddressZero;
const COMMON_TYPEHASH = ethers.utils.id(
  "OrderCommon(address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)"
);

export function getAddress(provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  return signer.getAddress();
}

export function useGetProvider() {
  const { library: provider, active } = useWeb3React();
  if (!active) {
    return false;
  }
  return provider;
}

export function floorGroupNumber(n: number, amount: number) {
  return Math.floor(n / amount) * amount;
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

export async function getDecimalsFor(token: string, provider: JsonRpcProvider) {
  const decimals = 18;
  if (token === ethers.constants.AddressZero) {
    return decimals;
  }

  const erc20Contract = SUSDToken__factory.connect(token, provider);
  return erc20Contract.decimals();
}

export function getChecksumAddress(address: string) {
  return ethers.utils.getAddress(address);
}

export async function getSymbolFor(token: string, provider: JsonRpcProvider) {
  if (token === ethers.constants.AddressZero) {
    return "MATIC";
  }
  const erc20Contract = SUSDToken__factory.connect(token, provider);
  return erc20Contract.symbol();
}

export async function getBigWalletBalance(
  address: string,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  let bigBalance;
  let decimals = 18;
  if (address === Currencies.MATIC.address) {
    // Basically it is MATIC
    bigBalance = await provider.getBalance(signer.getAddress());
  } else {
    // ERC-20 token logic
    const erc20Contract = SUSDToken__factory.connect(address, provider);
    const signerAddress = await signer.getAddress();
    bigBalance = await erc20Contract.balanceOf(signerAddress);
    decimals = await erc20Contract.decimals();
  }
  return { bigBalance, decimals };
}

export async function getWalletBalance(
  address: string,
  provider: JsonRpcProvider
) {
  const { bigBalance, decimals } = await getBigWalletBalance(address, provider);
  return ethers.utils.formatUnits(bigBalance, decimals);
}

export async function claimNFT(
  index: ethers.BigNumberish,
  tokenID: ethers.BigNumberish,
  proof: BytesLike[],
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperseedContract = PaperSeed__factory.connect(
    PAPERSEED_CONTRACT_ADDRESS,
    signer
  );
  // @ts-ignore
  const tx = await paperseedContract["claim(uint256,uint256,bytes32[])"](
    index,
    tokenID,
    proof
  );
  return tx;
}

export async function registerForAdoption(provider: JsonRpcProvider) {
  const signer = provider.getSigner();
  const orphanageContract = SeedOrphanage__factory.connect(
    ORPHANAGE_CONTRACT_ADDRESS,
    signer
  );
  return orphanageContract.register();
}

export async function getRegisterForAdoption(provider: JsonRpcProvider) {
  const orphanageContract = SeedOrphanage__factory.connect(
    ORPHANAGE_CONTRACT_ADDRESS,
    provider
  );
  return orphanageContract.getRegister();
}

export async function isRegisteredForAdoption(
  provider: JsonRpcProvider,
  address: string
) {
  const orphanageContract = SeedOrphanage__factory.connect(
    ORPHANAGE_CONTRACT_ADDRESS,
    provider
  );
  return orphanageContract.isRegistered(address);
}

export async function seedBalanceOf(
  provider: JsonRpcProvider,
  address: string
) {
  const paperseedContract = PaperSeed__factory.connect(
    PAPERSEED_CONTRACT_ADDRESS,
    provider
  );
  return paperseedContract.balanceOf(address);
}

export async function getTokenUri(
  tokenID: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperseedContract = PaperSeed__factory.connect(
    PAPERSEED_CONTRACT_ADDRESS,
    signer
  );
  const uri = await paperseedContract.tokenURI(tokenID);
  return uri;
}

export async function accountWL(
  tokenID: ethers.BigNumberish,
  address: string,
  provider: JsonRpcProvider
) {
  const potTicketContract = PotNFTTicket__factory.connect(
    NFT_TICKET_ADDRESS,
    provider
  );
  return potTicketContract.accountWl(tokenID, address);
}

export async function getWLMintPrice(
  tokenID: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const potTicketContract = PotNFTTicket__factory.connect(
    NFT_TICKET_ADDRESS,
    provider
  );
  return potTicketContract.wlMintPrice(tokenID);
}

export async function getTicketData(
  tokenID: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const potTicketContract = PotNFTTicket__factory.connect(
    NFT_TICKET_ADDRESS,
    provider
  );
  return potTicketContract.getTicketData(tokenID);
}

export async function redeemNFTTicket(
  tokenID: ethers.BigNumberish,
  amount: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const potTicketContract = PotNFTTicket__factory.connect(
    NFT_TICKET_ADDRESS,
    signer
  );
  return potTicketContract.redeem(tokenID, amount);
}

export async function mintWL(
  tokenID: ethers.BigNumberish,
  amount: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const potTicketContract = PotNFTTicket__factory.connect(
    NFT_TICKET_ADDRESS,
    signer
  );
  return potTicketContract.mintWL(tokenID, amount, { gasLimit: 200000 });
}

export async function mint(
  tokenID: ethers.BigNumberish,
  amount: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const potTicketContract = PotNFTTicket__factory.connect(
    NFT_TICKET_ADDRESS,
    signer
  );
  return potTicketContract.mint(tokenID, amount, { gasLimit: 200000 });
}

export async function mintPot(
  amount: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const potContract = PaperPotMint__factory.connect(
    PAPERPOTMINT_ADDRESS,
    signer
  );
  return potContract.mint(amount);
}

export async function balanceOfErc1155(
  tokenContractAddress: string,
  tokenID: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const NFTContract = ERC1155__factory.connect(tokenContractAddress, provider);
  const account = await getAddress(provider);
  return NFTContract.balanceOf(account, tokenID);
}

export async function isApprovedErc721(
  tokenContractAddress: string,
  owner: string,
  tokenId: ethers.BigNumberish,
  spender: string,
  provider: JsonRpcProvider
) {
  // return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
  const isApprovedForAll = await isApprovedForAllErc721(
    tokenContractAddress,
    owner,
    spender,
    provider
  );
  if (isApprovedForAll) {
    return true;
  }
  const erc721 = ERC721__factory.connect(tokenContractAddress, provider);
  const getApproved = await erc721.getApproved(tokenId);
  return (
    ethers.utils.getAddress(spender) === ethers.utils.getAddress(getApproved)
  );
}

export async function isApprovedForAllErc721(
  tokenContractAddress: string,
  owner: string,
  spender: string,
  provider: JsonRpcProvider
) {
  const erc721 = ERC721__factory.connect(tokenContractAddress, provider);
  return await erc721.isApprovedForAll(owner, spender);
}

export async function approveAllErc721(
  tokenContractAddress: string,
  spender: string,
  approved: boolean,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const erc721 = ERC721__factory.connect(tokenContractAddress, signer);
  return erc721.setApprovalForAll(spender, approved);
}

export async function water(
  tokenIds: ethers.BigNumberish[],
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperPot = PaperPot__factory.connect(PAPER_POT_ADDRESS, signer);
  const gasEstimate = await paperPot.estimateGas.water(tokenIds);
  const gasLimit = gasEstimate.mul(1150).div(1000);
  return paperPot.water(tokenIds, { gasLimit });
}

export async function waterWithFertilizer(
  tokenIds: ethers.BigNumberish[],
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperPot = PaperPot__factory.connect(PAPER_POT_ADDRESS, signer);
  const gasEstimate = await paperPot.estimateGas.waterWithFertilizer(tokenIds);
  const gasLimit = gasEstimate.mul(1150).div(1000);
  return paperPot.waterWithFertilizer(tokenIds, { gasLimit });
}

export async function harvestShrub(
  tokenId: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperPot = PaperPot__factory.connect(PAPER_POT_ADDRESS, signer);
  return paperPot.harvest(tokenId);
}

export async function plant(
  seedTokenId: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperPot = PaperPot__factory.connect(PAPER_POT_ADDRESS, signer);
  return paperPot.plant(PAPERSEED_CONTRACT_ADDRESS, seedTokenId);
}

export function plantAndMakeHappy(
  seedTokenId: ethers.BigNumberish,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const paperPot = PaperPot__factory.connect(PAPER_POT_ADDRESS, signer);
  return paperPot.plantAndMakeHappy(PAPERSEED_CONTRACT_ADDRESS, seedTokenId);
}

export function addressToLabel(address: string) {
  if (address === ZERO_ADDRESS) {
    return "MATIC";
  }
  if (
    process.env.REACT_APP_SUSD_TOKEN_ADDRESS &&
    address.toLowerCase() ===
      process.env.REACT_APP_SUSD_TOKEN_ADDRESS.toLowerCase()
  ) {
    return "SUSD";
  }
  return "XXX";
}

export function hashOrderCommon(common: OrderCommon) {
  const { baseAsset, quoteAsset, expiry, strike, optionType } = common;
  return ethers.utils.solidityKeccak256(
    ["bytes32", "address", "address", "uint", "uint", "uint8"],
    [COMMON_TYPEHASH, baseAsset, quoteAsset, expiry, strike, optionType]
  );
}

export function formatStrike(strike: ethers.BigNumber) {
  return Number(ethers.utils.formatUnits(strike, 6)).toFixed(2);
}

export function formatDate(date: number | Date) {
  if (date instanceof Date) {
    return date.toLocaleDateString("en-us", { month: "short", day: "numeric" });
  }
  return fromEthDate(date).toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: number | Date) {
  if (date instanceof Date) {
    return date.toLocaleTimeString("en-us", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return fromEthDate(date).toLocaleTimeString("en-us", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function getBlockTime(
  blockHash: string,
  provider: JsonRpcProvider
) {
  const block = await provider.getBlock(blockHash);
  return block.timestamp;
}

export function getBlockNumber(provider: JsonRpcProvider) {
  return provider.getBlockNumber();
}

export async function getAllowance(
  tokenContractAddress: string,
  spenderAddress: string,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const erc20Contract = SUSDToken__factory.connect(
    tokenContractAddress,
    signer
  );
  const signerAddress = await signer.getAddress();
  return await erc20Contract.allowance(signerAddress, spenderAddress);
}
export async function approveToken(
  tokenContractAddress: string,
  amount: ethers.BigNumber,
  spenderAddress: string,
  provider: JsonRpcProvider
) {
  const signer = provider.getSigner();
  const bigAmount = amount;
  const erc20Contract = SUSDToken__factory.connect(
    tokenContractAddress,
    signer
  );
  const allowance = await getAllowance(
    tokenContractAddress,
    spenderAddress,
    provider
  );
  const { bigBalance: ethBalance } = await getBigWalletBalance(
    ethers.constants.AddressZero,
    provider
  );
  if (ethBalance.eq(ethers.constants.Zero)) {
    throw new Error("Insufficient MATIC balance");
  }

  if (allowance.gte(bigAmount) && allowance.gt(ethers.constants.Zero)) {
    throw new Error("Allowance is sufficient. You don't need to approve.");
  }
  return erc20Contract.approve(spenderAddress, bigAmount);
}

export function decodeBase64Uri(uri: string) {
  let decodedMetadata = "";
  try {
    const splitUri = uri.split(",");
    const decodedBase64Bytes = ethers.utils.base64.decode(splitUri[1]);
    const utf8String = ethers.utils.toUtf8String(decodedBase64Bytes);
    decodedMetadata = JSON.parse(utf8String);
  } catch (e) {
    console.error(e);
  }
  return decodedMetadata;
}

export function wateringNextAvailable(lastWatering: number): Date {
  const lastWateringDate = fromEthDate(lastWatering);
  if (lastWateringDate.toString() === "Invalid Date") {
    throw new Error("Invalid Date");
  }
  // 8 hours must have passed
  const eightHoursFromWatering = new Date(lastWateringDate);
  eightHoursFromWatering.setUTCHours(eightHoursFromWatering.getUTCHours() + 8);

  // It must also be the next day
  const nextDayMidnight = new Date(lastWateringDate);
  nextDayMidnight.setUTCDate(nextDayMidnight.getUTCDate() + 1);
  nextDayMidnight.setUTCHours(0, 0, 0, 0);

  //nextWateringDate must meet both conditions
  const nextWateringDate = new Date(
    Math.max(eightHoursFromWatering.getTime(), nextDayMidnight.getTime())
  );
  return nextWateringDate;
}

export function wateringAvailableNow(lastWatering: number): boolean {
  const now = new Date();
  return now > wateringNextAvailable(lastWatering);
}

export function getFaucetCutoffTimes(provider: JsonRpcProvider) {
  const waterFaucet = WaterFaucet__factory.connect(
    WATER_FAUCET_ADDRESS,
    provider
  );
  console.log(WATER_FAUCET_ADDRESS);
  return waterFaucet.getCutoffTimes();
}

export function potEligibleToClaim(
  lastClaim: number,
  cutoffTimes: {
    startTime1: number;
    startTime2: number;
    endTime1: number;
    endTime2: number;
  }
) {
  // lastClaim is an ethDate
  const now = new Date();
  const ONE_DAY = 60 * 60 * 24;
  const ethNow = toEthDate(now);
  const time = ethNow % ONE_DAY;
  console.log(lastClaim, cutoffTimes);
  return (
    lastClaim &&
    !(
      (lastClaim !== 1 &&
        Math.floor((ethNow - cutoffTimes.startTime1) / ONE_DAY) ===
          Math.floor((lastClaim - cutoffTimes.startTime1) / ONE_DAY)) ||
      (!(time >= cutoffTimes.startTime1 && time < cutoffTimes.endTime1) &&
        !(time >= cutoffTimes.startTime2 && time < cutoffTimes.endTime2))
    )
  );
}

export function faucetTriggerTimes(cutoffTimes: {
  startTime1: number;
  startTime2: number;
  endTime1: number;
  endTime2: number;
}) {
  const ONE_DAY = 60 * 60 * 24;
  const now = new Date();
  const ethNow = toEthDate(now);
  const ethNowDay = Math.floor(ethNow / ONE_DAY);
  const ethMidnight = ethNowDay * ONE_DAY;
  const time = ethNow % ONE_DAY;
  const activeNow =
    (time >= cutoffTimes.startTime1 && time < cutoffTimes.endTime1) ||
    !(time >= cutoffTimes.startTime2 && time < cutoffTimes.endTime2);
  const usingSecond =
    cutoffTimes.endTime1 === 86400 && cutoffTimes.startTime2 === 0;
  const periodEndTime = activeNow
    ? usingSecond
      ? cutoffTimes.endTime2
      : cutoffTimes.endTime1
    : cutoffTimes.startTime1;
  const periodEndDate =
    ethNow > ethMidnight + periodEndTime
      ? fromEthDate(ethMidnight + periodEndTime + ONE_DAY)
      : fromEthDate(ethMidnight + periodEndTime);
  const nextPeriodStartDate = activeNow
    ? fromEthDate(ethMidnight + cutoffTimes.startTime1 + ONE_DAY)
    : fromEthDate(ethMidnight + cutoffTimes.startTime1);
  return {
    activeNow,
    periodEndDate,
    nextPeriodStartDate,
  };
}

export function claimFromFaucet(tokenIds: string[], provider: JsonRpcProvider) {
  if (!tokenIds.length) {
    throw new Error("no potted plants provided");
  }
  const signer = provider.getSigner();
  const waterFaucet = WaterFaucet__factory.connect(
    WATER_FAUCET_ADDRESS,
    signer
  );
  console.log(tokenIds);
  return waterFaucet.claim(tokenIds);
}
