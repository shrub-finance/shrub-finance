import React, { useEffect, useRef } from "react";
import {
  CoinbaseIcon,
  LedgerIcon,
  MetaMaskIcon,
  WalletConnectIcon,
} from "../assets/Icons";
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError,
} from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from "@web3-react/frame-connector";
import { Web3Provider } from "@ethersproject/providers";
import { Harmony } from "@harmony-js/core";
import { useEagerConnect } from "../hooks/useEagerConnect";
import { useInactiveListener } from "../hooks/useInactiveListener";
import {
  injected,
  walletconnect,
  walletlink,
  ledger,
} from "../utils/connectors";
import { Spinner } from "./Spinner";
import { toBech32 } from "@harmony-js/crypto";
import { BigNumber } from "ethers";
import Jazzicon from "@metamask/jazzicon";
import {
  Badge,
  Box,
  Button,
  Heading,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";

enum ConnectorNames {
  Metamask = "Metamask",
  WalletConnect = "WalletConnect",
  WalletLink = "WalletLink",
  Ledger = "Ledger",
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Metamask]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.WalletLink]: walletlink,
  [ConnectorNames.Ledger]: ledger,
};

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    error instanceof UserRejectedRequestErrorFrame
  ) {
    return "Please authorize this website to access your Ethereum account.";
  } else {
    console.error(error);
    return "An unknown error occurred. Check the console for more details.";
  }
}

function getLibrary(provider: any): Web3Provider | Harmony {
  let library: Web3Provider | Harmony;

  if (provider?.chainType === "hmy") {
    library = provider.blockchain;
  } else {
    library = new Web3Provider(provider);
    library.pollingInterval = 12000;
  }

  return library;
}

// @ts-ignore
export default function ConnectWalletsView(RouteComponentProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ConnectWallets />
    </Web3ReactProvider>
  );
}

function Header() {
  const { active, error } = useWeb3React();

  return (
    <>
      <Badge colorScheme={active ? "green" : error ? "red" : "yellow"}>
        {active ? "Connected" : error ? "Error Connecting" : "Not Connected"}
      </Badge>
    </>
  );
}

function BlockNumber() {
  const { chainId, library } = useWeb3React();
  const isHmyLibrary = library?.messenger?.chainType === "hmy";

  const [blockNumber, setBlockNumber] = React.useState<number>();
  React.useEffect((): any => {
    if (!!library) {
      let stale = false;

      //let blockNumberMethod = (library?.chainType === 'hmy') ? library.blockchain.getBlockNumber() : library.getBlockNumber

      library
        .getBlockNumber()
        .then((blockNumber: any) => {
          if (isHmyLibrary) {
            blockNumber = BigNumber.from(blockNumber.result).toNumber();
          }
          if (!stale) {
            setBlockNumber(blockNumber);
          }
        })
        .catch(() => {
          if (!stale) {
            // @ts-ignore
            setBlockNumber(null);
          }
        });

      const updateBlockNumber = (blockNumber: number) => {
        setBlockNumber(blockNumber);
      };

      if (library.on) {
        library.on("block", updateBlockNumber);
      }

      return () => {
        stale = true;
        if (library.on) {
          library.removeListener("block", updateBlockNumber);
        }
        setBlockNumber(undefined);
      };
    }
  }, [library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <div>
        Block Number: {blockNumber === null ? "Error" : blockNumber ?? ""}
      </div>
    </>
  );
}

export function Account() {
  const ref = useRef<HTMLDivElement>();
  let { account, library } = useWeb3React();
  const isHmyLibrary = library?.messenger?.chainType === "hmy";
  account = isHmyLibrary && account ? toBech32(account) : account;

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)));
    }
  }, [account]);

  return (
    <>
      <WalletConnectIcon boxSize={10} />
      <Button
        leftIcon={<span ref={ref as any}></span>}
        variant={"solid"}
        colorScheme={"teal"}
        size={"sm"}
        mr={4}
      >
        {account === null
          ? "-"
          : account
          ? `${account.substring(0, 6)}...${account.substring(
              account.length - 4
            )}`
          : "Connect Wallet"}
      </Button>
    </>
  );
}

// @ts-ignore
function Feature({ title, icon }) {
  const shadow = useColorModeValue("base", "dark-lg");
  const gradient = useColorModeValue(
    "linear(to-r, blue.100, teal.200)",
    "linear(to-l, blue.700, teal.700)"
  );
  return (
    <>
      <Flex
        p="3"
        boxShadow={shadow}
        rounded="lg"
        _hover={{ bgGradient: gradient }}
      >
        <Box p="4" fontSize={20}>
          {title}
        </Box>
        <Spacer />
        <Box p="4">{icon}</Box>
      </Flex>

      {/*<Header/>*/}
    </>
  );
}

function StackEx() {
  return (
    <Stack spacing={8}>
      <Feature title="MetaMask" icon={<MetaMaskIcon boxSize={8} />} />
      <Feature
        title="Wallet Connect"
        icon={<WalletConnectIcon boxSize={8} />}
      />
      <Feature title="Coinbase Wallet" icon={<CoinbaseIcon boxSize={8} />} />
      <Feature title="Ledger" icon={<LedgerIcon boxSize={8} />} />
    </Stack>
  );
}

function ConnectWallets() {
  const context = useWeb3React();
  const { connector, activate, error, active } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  return (
    <>
      <StackEx />
      {/*<Header />*/}
      {/*<Account />*/}
      {/*<BlockNumber />*/}
      {/*<div*/}
      {/*  style={{*/}
      {/*    display: "grid",*/}
      {/*    gridGap: "1rem",*/}
      {/*    gridTemplateColumns: "1fr 1fr",*/}
      {/*    maxWidth: "20rem",*/}
      {/*    margin: "auto",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {Object.keys(connectorsByName).map((name) => {*/}
      {/*    // @ts-ignore*/}
      {/*    const currentConnector = connectorsByName[name];*/}
      {/*    const activating = currentConnector === activatingConnector;*/}
      {/*    const connected = currentConnector === connector;*/}
      {/*    const disabled =*/}
      {/*      !triedEager || !!activatingConnector || connected || !!error;*/}

      {/*    return (*/}
      {/*      <button*/}
      {/*        style={{*/}
      {/*          height: "3rem",*/}
      {/*          borderRadius: "1rem",*/}
      {/*          borderColor: activating*/}
      {/*            ? "orange"*/}
      {/*            : connected*/}
      {/*            ? "green"*/}
      {/*            : "unset",*/}
      {/*          cursor: disabled ? "unset" : "pointer",*/}
      {/*          position: "relative",*/}
      {/*        }}*/}
      {/*        disabled={disabled}*/}
      {/*        key={name}*/}
      {/*        onClick={() => {*/}
      {/*          setActivatingConnector(currentConnector);*/}
      {/*          // @ts-ignore*/}
      {/*          activate(connectorsByName[name]);*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        <div*/}
      {/*          style={{*/}
      {/*            position: "absolute",*/}
      {/*            top: "0",*/}
      {/*            left: "0",*/}
      {/*            height: "100%",*/}
      {/*            display: "flex",*/}
      {/*            alignItems: "center",*/}
      {/*            color: "black",*/}
      {/*            margin: "0 0 0 1rem",*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          {activating && (*/}
      {/*            <Spinner*/}
      {/*              color={"black"}*/}
      {/*              style={{ height: "25%", marginLeft: "-1rem" }}*/}
      {/*            />*/}
      {/*          )}*/}
      {/*          {connected && (*/}
      {/*            <span role="img" aria-label="check">*/}
      {/*              ✅*/}
      {/*            </span>*/}
      {/*          )}*/}
      {/*        </div>*/}
      {/*        {name}*/}
      {/*      </button>*/}
      {/*    );*/}
      {/*  })}*/}
      {/*</div>*/}

      {!!error && (
        <h4 style={{ marginTop: "1rem", marginBottom: "0" }}>
          {getErrorMessage(error)}
        </h4>
      )}
    </>
  );
}
