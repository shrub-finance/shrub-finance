import optionContracts from "./option-contracts.json";
import { JsonRpcProvider } from "@ethersproject/providers";
import { FakeToken__factory } from "../../contracts/types/ethers-v5";
import { ethers } from "ethers";

export async function pairExpiryTypeStrike(provider: JsonRpcProvider) {
  const intermediate: any = {};
  const res: any = {};
  for (const contract of optionContracts) {
    const { baseAsset, quoteAsset, expiry, optionType, strike } = contract;
    // const expiryNice = fromEthDate(expiry).toLocaleDateString('en-us', {month: "short", day: "numeric"})
    if (!intermediate[baseAsset]) {
      intermediate[baseAsset] = {};
    }
    if (!intermediate[baseAsset][quoteAsset]) {
      intermediate[baseAsset][quoteAsset] = {};
    }
    if (!intermediate[baseAsset][quoteAsset][expiry]) {
      intermediate[baseAsset][quoteAsset][expiry] = {};
    }
    if (!intermediate[baseAsset][quoteAsset][expiry][optionType]) {
      intermediate[baseAsset][quoteAsset][expiry][optionType] = [];
    }
    intermediate[baseAsset][quoteAsset][expiry][optionType].push(strike);
  }
  for (const [baseAsset, baseAssetObj] of Object.entries(intermediate)) {
    // @ts-ignore - typescript is wrong
    for (const quoteAsset of Object.keys(baseAssetObj)) {
      const baseSymbol = await getSymbolFor(baseAsset, provider);
      const quoteSymbol = await getSymbolFor(quoteAsset, provider);
      const pair = `${quoteSymbol}-${baseSymbol}`;
      res[pair] = intermediate[baseAsset][quoteAsset];
    }
  }
  return res;
}

function getSymbolFor(token: string, provider: JsonRpcProvider) {
  if (token === ethers.constants.AddressZero) {
    return "ETH";
  }
  const erc20Contract = FakeToken__factory.connect(token, provider);
  return erc20Contract.symbol();
}

function fromEthDate(ethDate: number) {
  return new Date(ethDate * 1000);
}
