import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { useState } from "react";
import { NETWORK_RPC_DETAILS } from "../constants/networks";

export default function useAddNetwork() {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

  const addNetwork = () => {
    const params = [NETWORK_RPC_DETAILS[1337]];
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
