import optionContracts from '../option-contracts.json'
import {fromEthDate, getSymbolFor} from "./ethMethods";
import {Web3Provider} from "@ethersproject/providers";

export async function pairExpiryTypeStrike(provider: Web3Provider) {
    const intermediate: any = {};
    const res: any = {};
    for (const contract of optionContracts) {
        const { baseAsset, quoteAsset, expiry, optionType, strike } = contract;
        const expiryNice = fromEthDate(expiry).toLocaleDateString('en-us', {month: "short", day: "numeric"})
        if (!intermediate[baseAsset]) {
            intermediate[baseAsset] = {};
        }
        if (!intermediate[baseAsset][quoteAsset]) {
            intermediate[baseAsset][quoteAsset] = {};
        }
        if (!intermediate[baseAsset][quoteAsset][expiryNice]) {
            intermediate[baseAsset][quoteAsset][expiryNice] = {}
        }
        if (!intermediate[baseAsset][quoteAsset][expiryNice][optionType]) {
            intermediate[baseAsset][quoteAsset][expiryNice][optionType] = [];
        }
        intermediate[baseAsset][quoteAsset][expiryNice][optionType].push(strike);
    }
    for (const [baseAsset, baseAssetObj] of Object.entries(intermediate)) {
        // @ts-ignore - typescript is wrong
        for (const quoteAsset of Object.keys(baseAssetObj)) {
            const baseSymbol = await getSymbolFor(baseAsset, provider);
            const quoteSymbol = await getSymbolFor(quoteAsset, provider);
            const pair = `${quoteSymbol}-${baseSymbol}`
            res[pair] = intermediate[baseAsset][quoteAsset]
        }
    }
    return res;
}
