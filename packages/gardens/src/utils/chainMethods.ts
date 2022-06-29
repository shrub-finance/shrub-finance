import { SupportedChainId } from "../constants/networks";
import { PolygonIcon } from "../assets/Icons";

export enum ExplorerDataType {
  TRANSACTION = "transaction",
  ADDRESS = "address",
  BLOCK = "block",
}

const POLYGONSCAN_NETWORKS: { [chainId: number]: string } = {
  [SupportedChainId.POLYGON]: "",
  [SupportedChainId.MUMBAI]: "mumbai.",
};

export function explorerLink(
  chainId: any,
  data: any,
  type: ExplorerDataType
): string {
  const polygonPrefix = `https://${
    POLYGONSCAN_NETWORKS[chainId] ?? ""
  }polygonscan.com`;

  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${polygonPrefix}/tx/${data}`;

    case ExplorerDataType.BLOCK:
      return `${polygonPrefix}/block/${data}`;

    case ExplorerDataType.ADDRESS:
      return `${polygonPrefix}/address/${data}`;
    default:
      return `${polygonPrefix}`;
  }
}

export function currencySymbol(chainId: any) {
  if (
    chainId === SupportedChainId.POLYGON ||
    chainId === SupportedChainId.MUMBAI
  ) {
    return "MATIC";
  }
  return "MATIC";
}

export function currencyIcon(chainId: any) {
  if (
    chainId === SupportedChainId.POLYGON ||
    chainId === SupportedChainId.MUMBAI
  ) {
    return PolygonIcon;
  }
  return PolygonIcon;
}

export function testEnvironment(chainId: any) {
  return chainId !== SupportedChainId.POLYGON;
}
