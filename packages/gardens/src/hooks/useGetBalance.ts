import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";

export function useGetBalance() {
  const { account, library, chainId } = useWeb3React();

  const [balance, setBalance] = useState();
  useEffect((): any => {
    if (!!account && !!library) {
      let stale = false;
      library
        .getBalance(account)
        .then((balance: any) => {
          if (!stale) {
            setBalance(balance);
          }
        })
        .catch(() => {
          if (!stale) {
            // @ts-ignore
            setBalance(null);
          }
        });

      return () => {
        stale = true;
        setBalance(undefined);
      };
    }
  }, [account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  return { balance };
}
