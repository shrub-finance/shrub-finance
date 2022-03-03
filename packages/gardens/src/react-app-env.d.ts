/// <reference types="react-scripts" />
declare module "@shrub/contracts";
declare module "@metamask/jazzicon" {
  export default function (diameter: number, seed: number): HTMLElement;
}
declare module "ethjs-unit";

interface Window {
  ethereum?: {
    isMetaMask?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
  };
  web3?: Record<string, unknown>;
}
