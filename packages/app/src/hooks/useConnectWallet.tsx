import {useWeb3React} from "@web3-react/core";
import {useEffect, useState} from "react";
import {useEagerConnect} from "./useEagerConnect";
import {useInactiveListener} from "./useInactiveListener";

export function useConnectWallet() {
    const { connector, activate, error, active } = useWeb3React();


// handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = useState<any>();

    useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

// handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect();

// handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager || !!activatingConnector);

    return {connector, activatingConnector, triedEager, activate, error, setActivatingConnector, active}
}

