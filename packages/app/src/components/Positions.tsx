import React, {useEffect, useRef, useState} from "react";
import {ethers} from "ethers";
import {
    VisuallyHidden,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    TableRowProps,
    Flex,
    Spacer,
    SlideFade,
    Alert,
    AlertIcon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    Text,
    ModalCloseButton,
    ModalBody,
    HStack, useColorModeValue, Container, Center, Box, VStack
} from "@chakra-ui/react";

import {
    depositEth,
    depositToken,
    withdraw,
    approveToken,
    getFilledOrders,
    getAvailableBalance,
    exercise,
    signOrder,
    getLockedBalance
} from "../utils/ethMethods";
import WithdrawDeposit from "./WithdrawDeposit";
import {Balance, OrderCommon, ShrubBalance, SmallOrder} from "../types";
import {Currencies} from "../constants/currencies";
import {useWeb3React} from "@web3-react/core";
import {ConnectionStatus, ConnectWalletModal, getErrorMessage} from "./ConnectWallet";
import {ShrubIcon} from "../assets/Icons";
import {IoRocketSharp} from "react-icons/all";
import { Link as ReachLink } from "@reach/router";

function Positions({walletBalance}: { walletBalance: Balance }) {

    function handleErrorMessages(err?: Error, message?: string) {
        if (err) {
            setlocalError(err.message);
            console.log(err);
        } else if (message) {
            setlocalError(message);
        }
    }

    const {active, library, account, error: web3Error} = useWeb3React();
    const tableRows: TableRowProps[] = [];
    const tableRowsOptions: any = [];
    const [action, setAction] = useState('');

    const [optionsRows, setOptionsRows] = useState(<></>)
    const [localError, setlocalError] = useState('')
    const [shrubBalance, setShrubBalance] = useState({locked: {}, available: {}} as ShrubBalance);
    const hasOptions = useRef(false);

    const orderMap = new Map();

    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal
    } = useDisclosure();

    const {
        isOpen: isOpenConnectModal,
        onOpen: onOpenConnectModal,
        onClose: onCloseConnectModal
    } = useDisclosure();

    const [amountValue, setAmountValue] = useState("0");

    const [modalCurrency, setModalCurrency] = useState(
        'ETH' as keyof typeof Currencies
    );


    useEffect(() => {
        setlocalError('');

        async function inner() {
            if (!active || !account) {
                setlocalError('');
                handleErrorMessages(undefined, 'Please connect your wallet')
                console.error('Please connect wallet');
                return;
            }
            const shrubBalanceObj: ShrubBalance = {locked: {}, available: {}};
            for (const currencyObj of Object.values(Currencies)) {
                const {symbol, address: tokenContractAddress} = currencyObj;
                const bigBalance = await getAvailableBalance({
                    address: account,
                    tokenContractAddress,
                    provider: library
                })
                const bigLockedBalance = await getLockedBalance(account, tokenContractAddress, library);
                const balance = ethers.utils.formatUnits(bigBalance, 18);
                const lockedBalance = ethers.utils.formatUnits(bigLockedBalance, 18);
                shrubBalanceObj.available[symbol] = Number(balance);
                shrubBalanceObj.locked[symbol] = Number(lockedBalance);
            }
            setShrubBalance(shrubBalanceObj)
        }

        inner()
            .catch(console.error);
    }, [active, account, library]);


    useEffect(() => {
        setlocalError('');

        async function inner() {
            if (!active || !account) {
                handleErrorMessages(undefined, 'Please connect your wallet')
                console.error('Please connect wallet');
                return;
            }
            const filledOrders = await getFilledOrders(account, library);
            if(typeof filledOrders === 'object' && filledOrders !== null && Object.keys(filledOrders).length !== 0) {
                hasOptions.current = true;
                // Populate Option Positions Table
                for (const details of Object.values(filledOrders)) {
                    const {pair, strike, expiry, optionType, amount, common, buyOrder, seller}
                        = details as
                        {
                            baseAsset: string,
                            quoteAsset: string,
                            pair: string,
                            strike: string,
                            expiry: string,
                            optionType: string,
                            amount: number,
                            common: OrderCommon,
                            buyOrder: SmallOrder,
                            seller: string
                        };
                    orderMap.set(`${pair}${strike}${expiry}${optionType}`, {common, buyOrder, seller});
                    tableRowsOptions.push(
                        <Tr>
                            <Td>{pair}</Td>
                            <Td>{strike}</Td>
                            <Td>{expiry}</Td>
                            <Td>{optionType}</Td>
                            <Td>{amount}</Td>
                            <Td>
                                {amount > 0 && <Button
                                    colorScheme="teal"
                                    size="xs"
                                    onClick={() => handleClickExercise(pair, strike, expiry, optionType)}
                                >
                                    Exercise
                                </Button>
                                }
                            </Td>
                        </Tr>
                    )
                }
            } else {
                hasOptions.current = false;
                tableRowsOptions.push(
                    <VStack>
                        <Center w="600px">
                            <ShrubIcon boxSize={200} />
                        </Center>
                        <Center w="100%" h="100%">
                            <Box as="span" fontWeight="semibold" fontSize="lg">
                                You don't have any options yet!
                            </Box>
                        </Center>
                    </VStack>
                        )
            }
            setOptionsRows(tableRowsOptions);
        }

        inner()
            .catch(console.error);
    }, [active, account, library])



  function handleClickFactory(selectedCurrency: any, buttonText?: any) {
    return (
       function handleClick() {
         onOpenModal();
         setAction(buttonText);
         setlocalError('');
         setAmountValue('');
         setModalCurrency(selectedCurrency);
       })
  }

    async function handleClickExercise(pair: string, strike: string, expiry: string, optionType: string) {
        const key = `${pair}${strike}${expiry}${optionType}`
        const {common, buyOrder, seller} = orderMap.get(key);
        const unsignedOrder = {...common, ...buyOrder};
        const signedOrder = await signOrder(unsignedOrder, library)
        const exercised = await exercise(signedOrder, seller, library)
        return exercised;
    }

    function totalUserBalance(currency: string) {
        return shrubBalance.locked[currency] + shrubBalance.available[currency];
    }

    // Populate Balance Table
    for (const currency of Object.keys(Currencies)) {
        tableRows.push(
            <Tr key={currency}>
                <Td>{currency}</Td>
                <Td isNumeric>{totalUserBalance(currency)}</Td>
                <Td isNumeric>{shrubBalance.locked[currency]}</Td>
                <Td isNumeric>{shrubBalance.available[currency]}</Td>
                <Td>
                    <HStack spacing="24px">
                        <Button
                            colorScheme="teal"
                            variant="outline"
                            size="xs"
                            borderRadius="2xl"
                            onClick={handleClickFactory( currency, 'Withdraw')}
                            isDisabled={!active}
                        >
                            Withdraw
                        </Button>
                        <Button
                            colorScheme="teal"
                            variant="outline"
                            size="xs"
                            borderRadius="2xl"
                            onClick={handleClickFactory(currency, 'Deposit')}
                            isDisabled={!active}
                        >
                            Deposit
                        </Button>
                    </HStack>
                </Td>
            </Tr>
        );
    }

    return (
        <>
            <Container
                mt={50}
                flex="1"
                borderRadius="2xl"
                fontFamily="Montserrat"
                maxW="container.md"
            >
            {localError &&
                <>
                    <SlideFade in={true} unmountOnExit={true}>
                        <Flex>
                            <Alert status={!!web3Error ? "error": "warning"} borderRadius={"2xl"}>
                                <AlertIcon/>
                                {!!web3Error ? getErrorMessage(web3Error).message : localError}
                                <Spacer/>
                                <Button colorScheme={!!web3Error ? "red": "yellow"} variant="outline" size="sm"
                                        onClick={onOpenConnectModal} borderRadius={"full"}>
                                    {!!web3Error ? getErrorMessage(web3Error).title : "Connect Wallet"}
                                </Button>
                            </Alert>
                        </Flex>
                    </SlideFade>
                    </>
                    }
                    <Modal motionPreset="slideInBottom" isOpen={isOpenConnectModal}
                           onClose={onCloseConnectModal}>
                        <ModalOverlay/>
                        <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="15">
                            <ModalHeader>
                                <Text fontSize={20}>Connect to a wallet</Text>
                            </ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
                                <ConnectWalletModal/>
                            </ModalBody>
                        </ModalContent>
                    </Modal>
            </Container>

                <Container
                    mt={50}
                    flex="1"
                    borderRadius="2xl"
                    fontFamily="Montserrat"
                    bg={useColorModeValue("white", "rgb(31, 31, 65)")}
                    shadow={useColorModeValue("2xl", "2xl")}
                    maxW="container.md"
                >
            <Table variant="simple" size="lg" >
                <Thead>
                    <Tr>
                        <Th>Asset</Th>
                        <Th isNumeric>Total</Th>
                        <Th isNumeric>Locked</Th>
                        <Th isNumeric>Unlocked</Th>
                        <Th>
                            <VisuallyHidden/>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>{tableRows}</Tbody>
            </Table>
            </Container>

            <Container
                mt={50}
                p={hasOptions.current ? 0 : 8}
                flex="1"
                borderRadius="2xl"
                fontFamily="Montserrat"
                bg={useColorModeValue("white", "rgb(31, 31, 65)")}
                shadow={useColorModeValue("2xl", "2xl")}
                maxW="container.md"
            >
                { hasOptions.current ?
                    (<Table variant="simple" size="lg">
                    <Thead>
                        <Tr>
                            <Th>Pair</Th>
                            <Th>Strike</Th>
                            <Th>Expiry</Th>
                            <Th>Option Type</Th>
                            <Th>Amount</Th>
                            <Th>
                                <VisuallyHidden/>
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>{optionsRows}</Tbody>
                </Table>) : (
                        <VStack>
                            <Center>
                                <ShrubIcon boxSize={200} />
                            </Center>
                            <Center pt={6}>
                                <Box as="span" fontWeight="semibold" fontSize="sm" color="gray.500">
                                    You don't have any options yet!
                                </Box>
                            </Center>
                            <Center pt={6}>
                                <Button rightIcon={<IoRocketSharp />} colorScheme="teal"
                                        variant="outline"
                                        borderRadius={"full"} as={ReachLink} to="/options">
                                    Buy Some
                                </Button>
                            </Center>
                        </VStack>
                    )
            }
            </Container>

            <Modal motionPreset="slideInBottom" onClose={onCloseModal} isOpen={isOpenModal}>
                <ModalOverlay/>
                <ModalContent fontFamily="Montserrat" borderRadius="2xl">
                    <ModalHeader>{action}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <WithdrawDeposit
                            amountValue={amountValue}
                            setAmountValue={setAmountValue}
                            modalCurrency={modalCurrency}
                            setModalCurrency={setModalCurrency}
                            walletBalance={walletBalance}
                            shrubBalance={shrubBalance}
                            action={action}
                            error={localError}
                        />
                        <Flex>
                            {modalCurrency !== "ETH" && action === "Deposit" ? (
                                <Button
                                    colorScheme="teal"
                                    isDisabled={amountValue === '0' || amountValue === ''}
                                    onClick={() => {
                                        if (active) {
                                            approveToken(
                                                Currencies[modalCurrency].address,
                                                ethers.utils.parseUnits(amountValue),
                                                library
                                            ).catch(handleErrorMessages)
                                        }
                                    }
                                    }
                                >
                                    Approve
                                </Button>
                            ) : null}
                            <Spacer/>
                            <Button
                                colorScheme="teal"
                                isDisabled={amountValue === '0' || amountValue === ''}
                                onClick={() => {
                                    if (!active || !account) {
                                        handleErrorMessages(undefined, 'Please connect your wallet');
                                        return;
                                    }
                                    if (action === "Deposit") {
                                        if (modalCurrency === "ETH") {
                                            depositEth(ethers.utils.parseUnits(amountValue), library
                                            ).then(tx => tx.wait().then(console.log)).catch(handleErrorMessages);
                                        } else {
                                            depositToken(
                                                Currencies[modalCurrency].address,
                                                ethers.utils.parseUnits(amountValue),
                                                library
                                            ).catch(handleErrorMessages);
                                        }
                                    } else if (action === "Withdraw") {
                                        withdraw(
                                            Currencies[modalCurrency].address,
                                            ethers.utils.parseUnits(amountValue),
                                            library
                                        ).catch(handleErrorMessages);
                                    }
                                }}
                            >
                                {action}
                            </Button>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

        </>
    );
}

export default Positions;
