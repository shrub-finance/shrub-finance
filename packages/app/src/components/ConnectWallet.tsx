import React, {useEffect, useRef, useState} from "react";
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
import {UserRejectedRequestError as UserRejectedRequestErrorWalletConnect} from "@web3-react/walletconnect-connector";
import {UserRejectedRequestError as UserRejectedRequestErrorFrame} from "@web3-react/frame-connector";
import {
    injected,
    walletconnect,
    walletlink,
    ledger,
} from "../utils/connectors";
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
    useClipboard
} from "@chakra-ui/react";
import {Flex, Spacer} from "@chakra-ui/react";
import {CheckCircleIcon, CopyIcon, ExternalLinkIcon, Icon, InfoOutlineIcon} from "@chakra-ui/icons";
import {ethers} from "ethers";
import {useConnectWallet} from "../hooks/useConnectWallet";
import {formatEther} from "ethers/lib/utils";
import {NETWORK_COLORS, NETWORK_LABELS} from "../constants/networks";
import {RiSignalTowerLine} from "react-icons/all";
import {FaEthereum, FaPlug} from "react-icons/fa";

enum ConnectorNames {
    MetaMask = "MetaMask",
    WalletConnect = "Wallet Connect",
    CoinbaseWallet = "Coinbase Wallet",
    Ledger = "Ledger"
}


const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.MetaMask]: injected,
    [ConnectorNames.WalletConnect]: walletconnect,
    [ConnectorNames.CoinbaseWallet]: walletlink,
    [ConnectorNames.Ledger]: ledger,
};

export function getErrorMessage(error: Error) {
    if (error instanceof NoEthereumProviderError) {
        return ({ title: "Install MetaMask",
            message: "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile."
        });
    } else if (error instanceof UnsupportedChainIdError) {
        return ({
                title: "Wrong Network",
                message: "You are connected, but not to Ethereum. Check your settings."
            });
    } else if (
        error instanceof UserRejectedRequestErrorInjected ||
        error instanceof UserRejectedRequestErrorWalletConnect ||
        error instanceof UserRejectedRequestErrorFrame
    ) {
        return ({
                title: "Authorize Access",
                message: "Please authorize this website to access your Ethereum account."
            });
    } else if (error.message) {
        console.error(error);
        return ({title: "Connection Error" ,
                message: error.message});
    } else {
        console.error(error);
        return ({
                title: "Connection Error",
                message: "An unknown error occurred. Check the console for more details."
            });
    }
}
export function getLibrary(provider: any) {
    return new ethers.providers.Web3Provider(provider);
}
export function ChainId() {

    const {chainId} = useWeb3React()
    const network = chainId && NETWORK_LABELS[chainId]
    const networkColor = chainId && NETWORK_COLORS[chainId]

    return (

        <Box>
            {network && (

                <Button
                    variant={"ghost"}
                    // @ts-ignore
                    colorScheme={networkColor}
                    size={"sm"}
                    mr={4}
                    borderRadius="2xl"
                >
                    <Icon as={RiSignalTowerLine} boxSize={4} mr={1}/>
                    {network}
                </Button>
            )
            }
        </Box>
    )


}
export function Balance() {
    const {account, library, chainId} = useWeb3React()
    const networkColor = chainId && NETWORK_COLORS[chainId]

    const [balance, setBalance] = useState()
    useEffect((): any => {
        if (!!account && !!library) {
            let stale = false
            library
                .getBalance(account)
                .then((balance: any) => {

                    if (!stale) {
                        setBalance(balance)
                    }
                })
                .catch(() => {
                    if (!stale) {
                        // @ts-ignore
                        setBalance(null)
                    }
                })

            return () => {
                stale = true
                setBalance(undefined)
            }
        }
    }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

    return (
        <>
            {balance && <Button
                leftIcon={balance ? <FaEthereum/> : undefined}
                variant={"ghost"}
                //@ts-ignore
                colorScheme={networkColor}
                size={"sm"}
                borderRadius="2xl"
            >
                {
                    balance === null ?
                        'Error' :
                        balance
                            // @ts-ignore
                            ? `${Number(formatEther(balance)).toPrecision(6)} ETH` : ''
                }
            </Button>
            }
        </>
    )
}
export function Account() {
    const ref = useRef<HTMLDivElement>();
    const {account} = useWeb3React();
    useEffect(() => {
        if (account && ref.current) {
            ref.current.innerHTML = "";
            ref.current.appendChild(Jazzicon(14, parseInt(account.slice(2, 10), 16)));
        }
    }, [account]);
    return (
        <>
            {account ? <Box pr={2} d="flex" alignItems="center" ref={ref as any}/> : <Icon as={FaPlug} boxSize={5} pr={2}/>}
            {account === null ? "-" : account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Connect Wallet"}
        </>
    );
}


// @ts-ignore
export function ConnectionStatus({displayStatus}) {

    const shadow = useColorModeValue("base", "dark-lg");
    const {active, error, account} = useWeb3React();
    const connector = Object.keys(connectorsByName).find(item =>
        // @ts-ignore
        connectorsByName[item]);
    const ethScanLink = `https://etherscan.io/address/${account}`;
    const [copyValue, setCopyValue] = React.useState("")
    const {hasCopied, onCopy} = useClipboard(copyValue)
    useEffect(() => {
        if (account) {
            setCopyValue(account);
        }}, [account])

    return (
        <>
            {active && !error ? (
                <Box cursor="pointer" p={3} mb={5} boxShadow={shadow} rounded="lg">
                    <Flex pt={1}>
                        <Box color="gray.500" fontWeight="semibold" letterSpacing="wide" fontSize="sm" ml="2">
                            Connected with {connector}
                        </Box>
                        <Spacer/>
                        <Box>
                            <Button size={"sm"} borderRadius="full" cursor="pointer"
                                    variant="outline" colorScheme="green" onClick={() => displayStatus(true)}>
                                Change
                            </Button>
                        </Box>
                    </Flex>
                    <Flex pb={2}>
                        <Button variant={"ghost"} colorScheme={"teal"} size={"lg"} mr={4} borderRadius="2xl">
                            <Account/>
                        </Button>
                    </Flex>
                    <Flex pb={1}>
                        <Box color="gray.500" fontWeight="semibold" letterSpacing="wide" fontSize="xs" ml="2"
                             onClick={onCopy}>
                            {hasCopied ? <CheckCircleIcon mr={1}/> : <CopyIcon mr={1}/>}
                            {hasCopied ? 'Copied' : 'Copy Address'}
                        </Box>
                        <Spacer/>
                        <Box color="gray.500" fontWeight="semibold" letterSpacing="wide" fontSize="xs" ml="2">
                            <Link href={ethScanLink} isExternal>
                                <ExternalLinkIcon/> View on Etherscan
                            </Link>
                        </Box>
                    </Flex>
                </Box>) :
                (<Flex mb="10px">
                    <Spacer/>
                    <Badge borderRadius="md" variant="outline" colorScheme="yellow">
                        {!active && !error && "Not Connected"}
                    </Badge>
                </Flex>)}
        </>
    );
}

export function ConnectWalletModal() {

    const {
        activate, error, activatingConnector, connector,
        triedEager, setActivatingConnector
    } = useConnectWallet();

    const shadow = useColorModeValue("base", "dark-lg");
    const gradient = useColorModeValue(
        "linear(to-r, blue.100, teal.200)",
        "linear(to-l, blue.700, teal.700)"
    );
    return (
        <Box fontFamily="Montserrat">
            {!!error && (
                <Stack spacing={3}>
                    <Alert status="error" borderRadius={9} mb={4}>
                        <AlertIcon/>
                        {getErrorMessage(error).message}
                    </Alert>
                </Stack>
            )}
            <>
                {Object.keys(connectorsByName).map((item) => {
                    // @ts-ignore
                    const currentConnector = connectorsByName[item];
                    const activating = currentConnector === activatingConnector;
                    const connected = currentConnector === connector;
                    const disabled = !triedEager || !!activatingConnector ||
                        connected || !!error;

                    function WalletIconName(props: any) {
                        switch (props.type) {
                            case "MetaMask":
                                return <MetaMaskIcon boxSize={8}/>;
                            case "Coinbase Wallet":
                                return <CoinbaseIcon boxSize={8}/>;
                            case "Wallet Connect":
                                return <WalletConnectIcon boxSize={8}/>;
                            case "Ledger":
                                return <LedgerIcon boxSize={8}/>;
                            default:
                                return <MetaMaskIcon boxSize={8}/>;
                        }
                    }

                    return (
                        <Stack spacing={8} key={item}>
                            <Flex
                                cursor="pointer" p={3} mb={5}
                                boxShadow={shadow} rounded="lg"
                                _hover={{bgGradient: gradient}} disabled={disabled}
                                onClick={() => {
                                    setActivatingConnector(currentConnector);
                                    // @ts-ignore
                                    activate(connectorsByName[item]);
                                }}>
                                <Box p="4" fontSize={20}>
                                    {activating && (
                                        <Spinner
                                            mr={2} thickness="1px" speed="0.65s"
                                            emptyColor="blue.200" color="teal.500"
                                            size="xs" label="loading"
                                        />
                                    )}
                                    {connected && !error && (
                                        <CheckCircleIcon color="teal.400" mr={2} boxSize={3}/>
                                    )}

                                    {connected && error && (
                                        <InfoOutlineIcon color="red.400" mr={2} boxSize={3}/>
                                    )}
                                    {item}
                                </Box>
                                <Spacer/>
                                <Box p={4}>
                                    <WalletIconName type={item}/>
                                </Box>
                            </Flex>
                        </Stack>
                    );
                })}
            </>
        </Box>
    );
}

