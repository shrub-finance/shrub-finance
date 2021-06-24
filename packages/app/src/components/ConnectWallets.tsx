import React, { useEffect, useRef } from "react";
import {
  CoinbaseIcon,
  LedgerIcon,
  MetaMaskIcon,
  WalletConnectIcon,
} from "../assets/Icons";
import {
  useWeb3React,
  UnsupportedChainIdError,
} from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from "@web3-react/frame-connector";
import { useEagerConnect } from "../hooks/useEagerConnect";
import { useInactiveListener } from "../hooks/useInactiveListener";
import {
  injected,
  walletconnect,
  walletlink,
  ledger,
} from "../utils/connectors";
import { toBech32 } from "@harmony-js/crypto";
import Jazzicon from "@metamask/jazzicon";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Stack,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import {ethers} from "ethers";

enum ConnectorNames {
  MetaMask = "MetaMask",
  WalletConnect = "Wallet Connect",
  CoinbaseWallet = "Coinbase Wallet",
  Ledger = "Ledger",
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.MetaMask]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.CoinbaseWallet]: walletlink,
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
  } else if (error.message) {
    console.error(error);
    return error.message;
  } else {
    console.error(error);
    return "An unknown error occurred. Check the console for more details.";
  }
}

export function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

function ConnectionStatus() {
  const { active, error, deactivate } = useWeb3React();

  return (
    <>
      {active && !error ? (
        <Flex mb="10px">
          <Spacer />
          <Badge
            borderRadius="md"
            cursor="pointer"
            variant="outline"
            onClick={() => {
              deactivate();
            }}
          >
            Disconnect
          </Badge>
        </Flex>
      ) : (
        <Flex mb="10px">
          <Spacer />
          <Badge
            borderRadius="md"
            variant="outline"
            colorScheme={active ? "green" : error ? "red" : "yellow"}
          >
            {!active && !error && "Not Connected"}
          </Badge>
        </Flex>
      )}
    </>
  );
}

export function Account() {
  const ref = useRef<HTMLDivElement>();
  let { account } = useWeb3React();
  const { library } = useWeb3React();
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
      <Button
        leftIcon={account ? <span ref={ref as any}/> : undefined}
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

function ConnectWallets() {
  const context = useWeb3React();
  const { connector, activate, error } = context;
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

  const shadow = useColorModeValue("base", "dark-lg");
  const gradient = useColorModeValue(
    "linear(to-r, blue.100, teal.200)",
    "linear(to-l, blue.700, teal.700)"
  );

  return (
    <>
      {!!error && (
        <Stack spacing={3}>
          <Alert status="error" borderRadius={9} mb={4}>
            <AlertIcon />
            {getErrorMessage(error)}
          </Alert>
        </Stack>
      )}
      <ConnectionStatus />
      <>
        {Object.keys(connectorsByName).map((item) => {
          // @ts-ignore
          const currentConnector = connectorsByName[item];
          const activating = currentConnector === activatingConnector;
          const connected = currentConnector === connector;
          const disabled = !triedEager || !!activatingConnector || connected || !!error;
          function WalletIconName(props: any) {
            switch (props.type) {
              case "MetaMask":
                return <MetaMaskIcon boxSize={8} />;
              case "Coinbase Wallet":
                return <CoinbaseIcon boxSize={8} />;
              case "Wallet Connect":
                return <WalletConnectIcon boxSize={8} />;
              case "Ledger":
                return <LedgerIcon boxSize={8} />;
              default:
                return <MetaMaskIcon boxSize={8} />;
            }
          }
          return (
            <Stack spacing={8} key={item}>
              <Flex
                cursor="pointer"
                p={3}
                mb={5}
                boxShadow={shadow}
                rounded="lg"
                _hover={{ bgGradient: gradient }}
                disabled={disabled}
                onClick={() => {
                  setActivatingConnector(currentConnector);
                  // @ts-ignore
                  activate(connectorsByName[item]);
                }}
              >
                <Box p="4" fontSize={20}>
                  {activating && (
                    <Spinner
                      mr={2}
                      thickness="1px"
                      speed="0.65s"
                      emptyColor="blue.200"
                      color="teal.500"
                      size="xs"
                      label="loading"
                    />
                  )}
                  {connected && (
                    <CheckCircleIcon color="teal.400" mr={2} boxSize={3} />
                  )}
                  {item}
                </Box>
                <Spacer />
                <Box p={4}>
                  <WalletIconName type={item}/>
                </Box>
              </Flex>
            </Stack>
          );
        })}
      </>
    </>
  );
}

export default function ConnectWalletsView() {
  return (
    <ConnectWallets />
  );
}
