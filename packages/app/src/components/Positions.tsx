import React, {useContext, useEffect, useRef, useState} from "react";
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
  HStack,
  useColorModeValue,
  Container,
  Center,
  Box,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  Stack,
  useRadioGroup
} from '@chakra-ui/react';
import {
  depositEth,
  depositToken,
  withdraw,
  approveToken,
  getFilledOrders,
  getAvailableBalance,
  exercise,
  signOrder,
  getLockedBalance,
  getAllowance,
  getWalletBalance
} from '../utils/ethMethods';
import {OrderCommon, ShrubBalance, SmallOrder, SupportedCurrencies} from '../types';
import {Currencies} from "../constants/currencies";
import {useWeb3React} from "@web3-react/core";
import {ConnectWalletModal, getErrorMessage} from "./ConnectWallet";
import {HelloBud} from '../assets/Icons';
import {BsBoxArrowLeft, BsBoxArrowRight, IoRocketSharp} from 'react-icons/all';
import {Link as ReachLink} from "@reach/router";
import {TxContext} from "./Store";
import {ToastDescription, Txmonitor} from "./TxMonitoring";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import RadioCard from './Radio';

function Positions() {

  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const {active, library, account, error: web3Error} = useWeb3React();
  const alertColor = useColorModeValue("gray.100", "shrub.300");
  const tableRows: TableRowProps[] = [];
  const tableRowsOptions: any = [];
  const [withdrawDepositAction, setWithdrawDepositAction] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const [optionsRows, setOptionsRows] = useState(<></>)
  const [localError, setLocalError] = useState('')
  const [shrubBalance, setShrubBalance] = useState({locked: {}, available: {}} as ShrubBalance);
  const hasOptions = useRef(false);
  const toast = useToast();
  const orderMap = new Map();
  const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal} = useDisclosure();
  const {isOpen: isOpenConnectWalletModal, onClose: onCloseConnectWalletModal} = useDisclosure();
  const [amountValue, setAmountValue] = useState("0");
  const [modalCurrency, setModalCurrency] = useState('ETH' as keyof typeof Currencies);
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  // radio buttons
  const currencies = Object.keys(Currencies)
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'currency',
    defaultValue: '',
    onChange: (value: SupportedCurrencies) => setModalCurrency(value)
  })
  const currenciesRadiogroup = getRootProps();

  // shrub balance display
  useEffect(() => {
    setLocalError('');
    async function shrubBalanceHandler() {
      if (!active || !account) {
        handleErrorMessages({ customMessage: 'Please connect your wallet'})
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
    shrubBalanceHandler()
      .catch(console.error);
  }, [active, account, library, pendingTxsState]);

  // options display
  useEffect(() => {
    async function displayOptionsHandler() {
      if (!active || !account) {
        handleErrorMessages({customMessage:'Please connect your wallet'})
        console.error('Please connect wallet');
        return;
      }
      const filledOrders = await getFilledOrders(account, library);
      if (typeof filledOrders === 'object' && filledOrders !== null && Object.keys(filledOrders).length !== 0) {
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
              <HelloBud boxSize={200}/>
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
    displayOptionsHandler()
      .catch(console.error);
  }, [active, account, library])


  useEffect(() => {
    async function handleApprove(){
      if (modalCurrency !== 'ETH') {
        const allowance = await getAllowance(Currencies[modalCurrency].address, library);
        if(allowance.gt(ethers.BigNumber.from(0))) {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
      }
    }
    handleApprove();
  }, [modalCurrency, account])

  function handleWithdrawDepositModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    onCloseModal();
  }
  function handleWithdrawDepositModalOpen(buttonText?: any) {
    return (
        async function handleClick() {
        onOpenModal();
        setWithdrawDepositAction(buttonText);
        setLocalError('');
        setAmountValue('');
        setModalCurrency(modalCurrency);
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
  // inside withdraw deposit modal
  async function handleDepositWithdraw(event: any, approve?: string) {
    try {
      if (!active || !account) {
        handleErrorMessages({customMessage: 'Please connect your wallet'});
        return;
      }
      setApproving(true);
      let tx;
      if (approve === 'approve') {
        tx = await approveToken( Currencies[modalCurrency].address, ethers.utils.parseUnits(amountValue || '0'), library);
      } else if (withdrawDepositAction === "Deposit") {
        if (modalCurrency === "ETH") {
          tx = await depositEth(ethers.utils.parseUnits(amountValue), library)
        } else {
          // Deposit FK
          tx = await depositToken(Currencies[modalCurrency].address, ethers.utils.parseUnits(amountValue), library);
        }
      } else {
        // Withdraw
        tx = await withdraw(Currencies[modalCurrency].address, ethers.utils.parseUnits(amountValue), library)
      }
      setApproving(false)
      console.log(tx);
      const description = approve === 'approve' ? 'Approving FK' : `${withdrawDepositAction} ${amountValue} ${modalCurrency}`;
      pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait()
        const toastDescription = ToastDescription(description, receipt.transactionHash);
        toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
        pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
      } catch (e) {
        const toastDescription = ToastDescription(description, e.transactionHash);
        pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
        toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
      }
      console.log(pendingTxsState);

    } catch (e) {
      setApproving(false)
      handleErrorMessages({err: e})
    }
  }
  async function fillSendMax() {
    if (withdrawDepositAction === "Deposit") {
      const walletBalanceValue = await getWalletBalance(Currencies[modalCurrency].address, library);
      setAmountValue(walletBalanceValue);
      if(walletBalanceValue === '0') {
        handleErrorMessages({customMessage: 'Nothing to withdraw :/'});
      }
    } else if (withdrawDepositAction === "Withdraw") {
      setAmountValue(String(shrubBalance.available[modalCurrency]));
      if(String(shrubBalance.available[modalCurrency]) === '0') {
        handleErrorMessages({customMessage: 'Nothing to withdraw :/'});
      }
    }


  }
  // populate balance table
  for (const currency of Object.keys(Currencies)) {
    tableRows.push(
      <Tr key={currency}>
        <Td>{currency}</Td>
        <Td isNumeric>{totalUserBalance(currency)}</Td>
        <Td isNumeric>{shrubBalance.locked[currency]}</Td>
        <Td isNumeric>{shrubBalance.available[currency]}</Td>
      </Tr>
    );
  }
  return (
    <>
      {/*web3 errors*/}
      <Container mt={50} flex="1" borderRadius="2xl" maxW="container.md">
        {localError &&
        <>
          <SlideFade in={true} unmountOnExit={true}>
            <Flex>
              <Alert status={!!web3Error ? "error" : "warning"} borderRadius={"2xl"}>
                <AlertIcon/>
                {!!web3Error ? getErrorMessage(web3Error).message : localError}
                <Spacer/>
              </Alert>
            </Flex>
          </SlideFade>
        </>
        }
        <Modal motionPreset="slideInBottom" isOpen={isOpenConnectWalletModal}
               onClose={onCloseConnectWalletModal}>
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
      <Container mt={50} flex="1" borderRadius="2xl" maxW="container.md">
        <Center>
        <Button colorScheme="teal" variant="outline" borderRadius="full"
            rightIcon={<BsBoxArrowLeft/>} onClick={handleWithdrawDepositModalOpen( 'Deposit')} isDisabled={!active} mr={4}>
          Deposit
        </Button>
        <Button colorScheme="teal" variant="outline" borderRadius="full" rightIcon={<BsBoxArrowRight/>} onClick={handleWithdrawDepositModalOpen( 'Withdraw')} isDisabled={!active}>
          Withdraw
        </Button>
        </Center>
      </Container>
      {/*asset view*/}
      <Container mt={50} flex="1" borderRadius="2xl" bg={useColorModeValue("white", "shrub.100")} shadow={useColorModeValue("2xl", "2xl")} maxW="container.md">
        <Table variant="simple" size="lg">
          <Thead>
            <Tr>
              <Th>Asset</Th>
              <Th isNumeric>Total</Th>
              <Th isNumeric>Locked</Th>
              <Th isNumeric>Unlocked</Th>
            </Tr>
          </Thead>
          <Tbody>{tableRows}</Tbody>
        </Table>
      </Container>
      {/*options view*/}
      <Container mt={50} p={hasOptions.current ? 0 : 8} flex="1" borderRadius="2xl" bg={useColorModeValue("white", "shrub.100")} shadow={useColorModeValue("2xl", "2xl")} maxW="container.md">
        {hasOptions.current ?
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
                <HelloBud boxSize={200}/>
              </Center>
              <Center pt={6}>
                <Box as="span" fontWeight="semibold" fontSize="sm" color="gray.500">
                  You don't have any options yet!
                </Box>
              </Center>
              <Center pt={6}>
                <Button rightIcon={<IoRocketSharp/>} colorScheme="teal"
                        variant="outline"
                        borderRadius={"full"} as={ReachLink} to="/options">
                  Buy Some
                </Button>
              </Center>
            </VStack>
          )
        }
      </Container>
      {/*withdraw deposit modal*/}
      <Modal motionPreset="slideInBottom" onClose={handleWithdrawDepositModalClose} isOpen={isOpenModal}>
        <ModalOverlay/>
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottomWidth="1px">{withdrawDepositAction}</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
              {(!approving && !activeHash) &&
              <>
                <Stack direction={["column"]} spacing="40px" mb="40px">
                  {localError && (
                      <SlideFade in={true} unmountOnExit={true}>
                        <Alert status="error" borderRadius={9} >
                          <AlertIcon />
                          {localError}
                        </Alert>
                      </SlideFade>
                  )
                  }
                  <FormControl id="currency">
                  <FormLabel>Currency</FormLabel>
                  <HStack {...currenciesRadiogroup}>
                    {currencies.map((value) => {
                      const radio = getRadioProps({ value })
                      return (
                          <RadioCard key={value} {...radio}>
                            {value}
                          </RadioCard>
                      )
                    })}
                  </HStack>
                  </FormControl>
                  {(modalCurrency === "ETH"|| (isApproved && withdrawDepositAction === "Deposit")  || withdrawDepositAction === "Withdraw" ) && <FormControl id="amount">
                    <FormLabel>Amount</FormLabel>
                    <NumberInput
                        onChange={(valueString) => setAmountValue(parse(valueString))}
                        value={format(amountValue)} size="lg"
                    >
                      <NumberInputField/>
                      <InputRightElement width="auto">
                        <Button size="xs" onClick={fillSendMax} p={3.5} mr={2} >
                          Send Max
                        </Button>
                      </InputRightElement>
                    </NumberInput>
                  </FormControl>}
                </Stack>
                {modalCurrency !== "ETH" && withdrawDepositAction === "Deposit" && !isApproved &&
                <>
                  <Alert
                      bgColor={alertColor}
                      status="info"
                      borderRadius={"md"}
                      mb={3}
                  >
                    <AlertIcon />
                    You will only have to approve once
                  </Alert>
                  <Button
                      mb={1.5}
                      colorScheme="teal"
                      size={"lg"}
                      isFullWidth={true}
                      onClick={() => {
                        if (active) {
                          handleDepositWithdraw(undefined, 'approve')
                        }
                      }}>
                    Approve
                  </ Button>
                </>
                }
                {((modalCurrency === "ETH")|| isApproved  || withdrawDepositAction === "Withdraw")  && <Button mb={1.5} size={"lg"} colorScheme="teal" isFullWidth={true} isDisabled={amountValue === '0' || amountValue === ''} onClick={handleDepositWithdraw}>
                  {withdrawDepositAction}
                </Button>}
              </>
              }
            {(approving || activeHash) && <Txmonitor txHash={activeHash}/>}
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
}

export default Positions;
