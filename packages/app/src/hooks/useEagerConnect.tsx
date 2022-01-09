import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { useSafeAppConnection } from "@gnosis.pm/safe-apps-web3-react";
import { isMobile } from "react-device-detect";

import { injected, gnosisSafe } from "../utils/connectors";

export function useEagerConnect() {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  const triedToConnectToSafe = useSafeAppConnection(gnosisSafe);

  useEffect(() => {
    if (triedToConnectToSafe && !active) {
      injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          if (isMobile && window.ethereum) {
            activate(injected, undefined, true).catch(() => {
              setTried(true);
            });
          } else {
            setTried(true);
          }
        }
      });
    }
  }, [activate, active, triedToConnectToSafe]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active && triedToConnectToSafe) {
      setTried(true);
    }
  }, [triedToConnectToSafe, active]);

  return tried;
}
