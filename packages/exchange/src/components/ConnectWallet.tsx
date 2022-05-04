import React, { useEffect, useRef } from "react";
import {
  CoinbaseIcon,
  LedgerIcon,
  MetaMaskIcon,
  WalletConnectIcon,
} from "../assets/Icons";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from "@web3-react/frame-connector";
import { injected, walletconnect, walletlink } from "../utils/connectors";
import Jazzicon from "@metamask/jazzicon";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Stack,
  Link,
  Spinner,
  useColorModeValue,
  useClipboard,
} from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";
import {
  CheckCircleIcon,
  CopyIcon,
  ExternalLinkIcon,
  Icon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import { ethers } from "ethers";
import { useConnectWallet } from "../hooks/useConnectWallet";
import { formatEther } from "ethers/lib/utils";
import { NETWORK_COLORS, NETWORK_LABELS } from "../constants/networks";
import { RiSignalTowerLine } from "react-icons/all";
import { isIE, isMobile } from "react-device-detect";
import {
  currencySymbol,
  ExplorerDataType,
  explorerLink,
} from "../utils/chainMethods";
import useAddNetwork from "../hooks/useAddNetwork";
import { useGetBalance } from "../hooks/useGetBalance";

enum ConnectorNames {
  MetaMask = "MetaMask",
  WalletConnect = "Wallet Connect",
  CoinbaseWallet = "Coinbase Wallet",
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.MetaMask]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.CoinbaseWallet]: walletlink,
};

export function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return {
      title: "Install MetaMask",
      message:
        "You can use MetaMask by installing the browser extension or WalletConnect.",
    };
  } else if (error instanceof UnsupportedChainIdError) {
    return {
      title: "Wrong Network",
      message: "You are connected, but not to Polygon Mumbai Testnet.",
    };
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    error instanceof UserRejectedRequestErrorFrame
  ) {
    return {
      title: "Authorize Access",
      message: "Please authorize this website to access your Ethereum account.",
    };
  } else if (error.message) {
    console.error(error);
    return {
      title: "Connection Error",
      message: error.message,
    };
  } else {
    console.error(error);
    return {
      title: "Connection Error",
      message: "An unknown error occurred. Check the console for more details.",
    };
  }
}

export function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

export function Chain() {
  const { chainId } = useWeb3React();
  const network = chainId && NETWORK_LABELS[chainId];
  const networkColor = chainId && NETWORK_COLORS[chainId];
  const mumbaiColor = useColorModeValue("blue.600", "blue.200");

  return (
    <Box>
      {network && (
        <Box
          // @ts-ignore
          color={networkColor === "blue" ? mumbaiColor : networkColor}
          fontSize={"sm"}
          mr={4}
          borderRadius="2xl"
          fontWeight="medium"
        >
          <Icon as={RiSignalTowerLine} boxSize={3} mr={1} />
          {network}
        </Box>
      )}
    </Box>
  );
}

export function Balance() {
  const { chainId } = useWeb3React();
  const balanceColor = useColorModeValue("black", "white");
  const currency = currencySymbol(chainId);
  const { balance } = useGetBalance();

  return (
    <>
      {balance && (
        <Box
          // leftIcon={balance ? <FaEthereum/> : undefined}
          //@ts-ignore
          // color={networkColor === "blue" ? mumbaiColor : networkColor}
          color={balanceColor}
          fontSize={{ base: "sm", md: "xs", lg: "sm" }}
          fontWeight="medium"
        >
          {balance === null
            ? "Error"
            : balance
            ? // @ts-ignore
              `${Number(formatEther(balance)).toLocaleString(undefined, {
                minimumFractionDigits: currency === "MATIC" ? 6 : 2,
              })} ${currency}`
            : ""}
        </Box>
      )}
    </>
  );
}

export function Account() {
  const ref = useRef<HTMLDivElement>();
  const { account } = useWeb3React();
  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(Jazzicon(14, parseInt(account.slice(2, 10), 16)));
    }
  }, [account]);
  return (
    <>
      {account ? (
        <Box pr={2} d="flex" alignItems="center" ref={ref as any} />
      ) : (
        ""
      )}
      {account === null
        ? "-"
        : account
        ? `${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`
        : "Connect Wallet"}
    </>
  );
}

// @ts-ignore
export function ConnectionStatus({ displayStatus }) {
  const shadow = useColorModeValue("base", "dark-lg");
  const bg = useColorModeValue("sprout", "teal");
  const { active, error, account, chainId } = useWeb3React();
  const { connector } = useConnectWallet();
  const connectedName = Object.keys(connectorsByName).find((connectorName) => {
    // @ts-ignore
    return connector === connectorsByName[connectorName];
  });
  const [copyValue, setCopyValue] = React.useState("");
  const { hasCopied, onCopy } = useClipboard(copyValue);
  useEffect(() => {
    if (account) {
      setCopyValue(account);
    }
  }, [account]);

  return (
    <>
      {active && !error ? (
        <Box p={3} mb={5} boxShadow={shadow} rounded="lg">
          <Flex pt={1}>
            <Box
              color="gray.500"
              fontWeight="medium"
              letterSpacing="wide"
              fontSize="sm"
              ml="2"
            >
              Connected with {connectedName}
            </Box>
            <Spacer />
            <Box>
              <Button
                size={"sm"}
                borderRadius="full"
                cursor="pointer"
                variant="outline"
                colorScheme={bg}
                onClick={() => displayStatus(true)}
              >
                Change
              </Button>
            </Box>
          </Flex>
          <Flex pb={2}>
            <Button
              variant={"ghost"}
              colorScheme={bg}
              size={"lg"}
              mr={4}
              borderRadius="2xl"
              onClick={onCopy}
            >
              <Account />
            </Button>
          </Flex>
          <Flex pb={1}>
            <Box
              cursor="pointer"
              color="gray.500"
              fontWeight="medium"
              letterSpacing="wide"
              fontSize="xs"
              ml="2"
              onClick={onCopy}
            >
              {hasCopied ? <CheckCircleIcon mr={1} /> : <CopyIcon mr={1} />}
              {hasCopied ? "Copied" : "Copy Address"}
            </Box>
            <Spacer />
            <Box
              color="gray.500"
              fontWeight="medium"
              letterSpacing="wide"
              fontSize="xs"
              ml="2"
            >
              <Link
                href={explorerLink(chainId, account, ExplorerDataType.ADDRESS)}
                isExternal
              >
                <ExternalLinkIcon /> View on explorer
              </Link>
            </Box>
          </Flex>
        </Box>
      ) : (
        <Flex mb="10px">
          <Spacer />
          <Badge borderRadius="md" variant="outline" colorScheme="yellow">
            {!active && !error && "Not Connected"}
          </Badge>
        </Flex>
      )}
    </>
  );
}

export function ConnectWalletModal() {
  const {
    activate,
    error,
    activatingConnector,
    connector,
    triedEager,
    setActivatingConnector,
  } = useConnectWallet();

  const checkIconColor = useColorModeValue("sprout.500", "teal.400");
  const shadow = useColorModeValue("base", "dark-lg");
  const gradient = useColorModeValue(
    "linear(to-r, sprout.200, teal.200)",
    "linear(to-l, blue.700, teal.700)"
  );

  const addNetwork = useAddNetwork();
  const wrongNetwork =
    !!error && getErrorMessage(error).title === "Wrong Network";
  const noMetaMask =
    !!error && getErrorMessage(error).title === "Install MetaMask";

  const bg = useColorModeValue("sprout", "teal");

  return (
    <Box>
      {!!error && (
        <Box spacing={3}>
          <Alert status="error" borderRadius={9} mb={4}>
            <AlertIcon />
            {getErrorMessage(error).message}
          </Alert>
        </Box>
      )}

      {!wrongNetwork ? (
        <>
          {Object.keys(connectorsByName).map((connectorName) => {
            // @ts-ignore
            const currentConnector = connectorsByName[connectorName];
            const activating = currentConnector === activatingConnector;
            const connected = currentConnector === connector;
            const disabled =
              !triedEager || !!activatingConnector || connected || !!error;

            const mobileConnectors = [
              "Wallet Connect",
              "Coinbase Wallet",
              "MetaMask",
            ];

            const isMobileConnector = mobileConnectors.includes(connectorName);

            function WalletIconName(props: any) {
              switch (props.type) {
                case "MetaMask":
                  return <MetaMaskIcon boxSize={8} />;
                case "Coinbase Wallet":
                  return <CoinbaseIcon boxSize={8} />;
                case "Wallet Connect":
                  return <WalletConnectIcon boxSize={8} />;
                case "Ledger":
                  return !isMobile ? <LedgerIcon boxSize={8} /> : null;
                default:
                  return <MetaMaskIcon boxSize={8} />;
              }
            }

            if (isMobile) {
              return isMobileConnector ? (
                <Stack spacing={8} key={connectorName}>
                  <Flex
                    cursor="pointer"
                    p={isMobile ? 0 : 3}
                    mb={isMobile ? 2 : 5}
                    boxShadow={shadow}
                    rounded="lg"
                    _hover={{ bgGradient: gradient }}
                    disabled={disabled}
                    onClick={() => {
                      setActivatingConnector(currentConnector);
                      // @ts-ignore
                      activate(connectorsByName[connectorName]);
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
                      {connected && !error && (
                        <CheckCircleIcon
                          color={checkIconColor}
                          mr={2}
                          boxSize={3}
                        />
                      )}
                      {connected && error && (
                        <InfoOutlineIcon color="red.400" mr={2} boxSize={3} />
                      )}
                      {connectorName}
                    </Box>
                    <Spacer />
                    <Box p={4}>
                      <WalletIconName type={connectorName} />
                    </Box>
                  </Flex>
                </Stack>
              ) : null;
            } else {
              return (
                <Stack spacing={8} key={connectorName}>
                  <Flex
                    cursor="pointer"
                    p={isMobile ? 0 : 3}
                    mb={isMobile ? 2 : 5}
                    boxShadow={shadow}
                    rounded="lg"
                    _hover={{ bgGradient: gradient }}
                    disabled={disabled}
                    onClick={() => {
                      setActivatingConnector(currentConnector);
                      // @ts-ignore
                      activate(connectorsByName[connectorName]);
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
                      {connected && !error && (
                        <CheckCircleIcon
                          color={checkIconColor}
                          mr={2}
                          boxSize={3}
                        />
                      )}

                      {connected && error && (
                        <InfoOutlineIcon color="red.400" mr={2} boxSize={3} />
                      )}

                      {connected && error && noMetaMask ? (
                        <Link
                          href={
                            isIE
                              ? "https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm?hl=en-US"
                              : "https://metamask.io/download"
                          }
                          isExternal
                        >
                          Install MetaMask
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      ) : null}

                      {connected &&
                      error &&
                      noMetaMask &&
                      connectorName === "MetaMask"
                        ? null
                        : connectorName}
                    </Box>
                    <Spacer />
                    <Box p={4}>
                      <WalletIconName type={connectorName} />
                    </Box>
                  </Flex>
                </Stack>
              );
            }
          })}
        </>
      ) : (
        <Stack>
          <Button
            size={"md"}
            cursor="pointer"
            borderRadius={9}
            variant="ghost"
            colorScheme={bg}
            onClick={addNetwork}
          >
            Switch to Polygon Network
          </Button>
        </Stack>
      )}
    </Box>
  );
}
