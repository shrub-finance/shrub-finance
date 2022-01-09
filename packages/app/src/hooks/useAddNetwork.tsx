import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { useState } from "react";

export default function useAddNetwork() {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

  const addNetwork = () => {
    const params = [
      {
        // chainId: "0x13881",
        chainId: "0x89",
        // chainName: "Matic Testnet",
        chainName: "Matic Mainnet",
        nativeCurrency: {
          name: "Polygon Matic",
          symbol: "Matic",
          decimals: 18,
        },
        // rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
        rpcUrls: ["https://polygon-rpc.com/"],
        // blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
    ];
    // @ts-ignore
    window.ethereum
      // @ts-ignore
      .request({ method: "wallet_addEthereumChain", params })
      .then(() => console.log("Success"))
      .catch((e: Error) => {
        handleErrorMessages({ err: e });
        console.log("Error", e.message);
      });
  };

  return addNetwork;
}
