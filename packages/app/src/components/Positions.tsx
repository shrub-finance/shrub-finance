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
  useToast,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  Stack,
  useRadioGroup, Tooltip, Divider
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
  getBlockNumber,
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
import {QuestionOutlineIcon} from '@chakra-ui/icons';
import {currencySymbol} from "../utils/chainMethods";
import { useQuery } from '@apollo/client'
import { SHRUBFOLIO_QUERY, SUMMARY_VIEW_QUERY } from '../constants/queries'

const DEPLOY_BLOCKHEIGHT = process.env.REACT_APP_DEPLOY_BLOCKHEIGHT;
const MAX_SCAN_BLOCKS = Number(process.env.REACT_APP_MAX_SCAN_BLOCKS);

function Positions() {
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const {active, library, account, error: web3Error, chainId} = useWeb3React();
  const alertColor = useColorModeValue("gray.100", "shrub.300");
  const shrubfolioRows = [];
  const tableRowsOptions: any = [];
  const [withdrawDepositAction, setWithdrawDepositAction] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const [optionsRows, setOptionsRows] = useState(<></>)
  const [localError, setLocalError] = useState('')
  const [shrubBalance, setShrubBalance] = useState({locked: {MATIC: 0, SUSD: 0}, available: {MATIC: 0, SUSD: 0}} as ShrubBalance);
  const hasOptions = useRef(false);
  const toast = useToast();
  const orderMap = new Map();
  const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal} = useDisclosure();
  const {isOpen: isOpenConnectWalletModal, onClose: onCloseConnectWalletModal} = useDisclosure();
  const [amountValue, setAmountValue] = useState("0");
  const [modalCurrency, setModalCurrency] = useState('MATIC' as keyof typeof Currencies);
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  // radio buttons
  const currencies = Object.keys(Currencies)
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'currency',
    defaultValue: modalCurrency,
    onChange: (value: SupportedCurrencies) => setModalCurrency(value)
  })
  const currenciesRadiogroup = getRootProps();
  const [showDepositButton, setShowDepositButton] = useState(false);


  const { loading, error, data } = useQuery(SHRUBFOLIO_QUERY, {
    variables: {
      id: account
    }
  })


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
  // useEffect(() => {
  //   async function displayOptionsHandler() {
  //     if (!active || !account) {
  //       handleErrorMessages({customMessage:'Please connect your wallet'})
  //       console.error('Please connect wallet');
  //       return;
  //     }
  //     let filledOrders = {};
  //     const fromBlock = DEPLOY_BLOCKHEIGHT;
  //     const latestBlockNumber = await getBlockNumber(library);
  //     let cursor = Number(fromBlock);
  //     while (cursor < latestBlockNumber) {
  //       const to = Math.min(cursor + 1000, MAX_SCAN_BLOCKS);
  //       const rangeFilledOrders = await getFilledOrders(account, library, cursor, to);
  //       // TODO: this should cache in localStorage
  //       filledOrders = { ...filledOrders, ...rangeFilledOrders };
  //       cursor = to + 1;
  //     }
  //     if (typeof filledOrders === 'object' && Object.keys(filledOrders).length !== 0) {
  //       hasOptions.current = true;
  //       // Populate Option Positions Table
  //       for (const details of Object.values(filledOrders)) {
  //         const {pair, strike, expiry, optionType, amount, common, buyOrder, seller}
  //           = details as
  //           {
  //             baseAsset: string,
  //             quoteAsset: string,
  //             pair: string,
  //             strike: string,
  //             expiry: string,
  //             optionType: string,
  //             amount: number,
  //             common: OrderCommon,
  //             buyOrder: SmallOrder,
  //             seller: string
  //           };
  //         orderMap.set(`${pair}${strike}${expiry}${optionType}`, {common, buyOrder, seller});
  //         tableRowsOptions.push(
  //           <Tr>
  //             <Td>{pair}</Td>
  //             <Td>{strike}</Td>
  //             <Td>{expiry}</Td>
  //             <Td>{optionType}</Td>
  //             <Td>{amount}</Td>
  //             <Td>
  //               {amount > 0 ? <Button
  //                 colorScheme="teal"
  //                 size="xs"
  //                 onClick={() => handleClickExercise(pair, strike, expiry, optionType, amount)}
  //               >
  //                 Exercise
  //               </Button> : Number(amount) === 0 ? <Button
  //                 variant={"ghost"}
  //                 isDisabled={true}
  //                 colorScheme="teal"
  //                 size="xs"
  //               >
  //                 Exercised
  //               </Button> : ''
  //               }
  //             </Td>
  //           </Tr>
  //         )
  //       }
  //     } else {
  //       hasOptions.current = false;
  //       tableRowsOptions.push(
  //         <Flex>
  //           <Center w="600px">
  //             <HelloBud boxSize={200}/>
  //           </Center>
  //           <Center w="100%" h="100%">
  //             <Box as="span" fontWeight="semibold" fontSize="lg">
  //               You don't have any options yet!
  //             </Box>
  //           </Center>
  //         </Flex>
  //       )
  //     }
  //     setOptionsRows(tableRowsOptions);
  //   }
  //   displayOptionsHandler()
  //     .catch(console.error);
  // }, [active, account, library, pendingTxsState])




  useEffect(() => {
    async function handleApprove(){
      if (modalCurrency !== 'MATIC') {
        const allowance = await getAllowance(Currencies[modalCurrency].address, library);
        if(allowance.gt(ethers.BigNumber.from(0))) {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
      }
    }
    handleApprove();
  }, [modalCurrency, account, pendingTxsState])

  function handleWithdrawDepositModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    onCloseModal();
  }

  function goToDeposit() {
          onCloseModal();
          setApproving(false);
          setActiveHash(undefined);
          onOpenModal();
          setLocalError('');
          setAmountValue('');
          setModalCurrency(modalCurrency);
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
  async function handleClickExercise(pair: string, strike: string, expiry: string, optionType: string, amount: number) {
    try {
      const key = `${pair}${strike}${expiry}${optionType}`
      const {common, buyOrder, seller} = orderMap.get(key);
      const unsignedOrder = {...common, ...buyOrder};
      const signedOrder = await signOrder(unsignedOrder, library)
      const tx = await exercise(signedOrder, seller, library)
      const description = `Exercise ${pair} ${optionType} option for $${amount * Number(strike)} at strike $${strike}`
      pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
      const receipt = await tx.wait()
      const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
      toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
      pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
      return tx;
    } catch (e) {
      console.error(e);
      handleErrorMessages({err:e});
    }

  }
  function totalUserBalance(currency: string) {
    const totBalance = shrubBalance.locked[currency] + shrubBalance.available[currency];
    return Number(totBalance).toLocaleString(undefined, {minimumFractionDigits: currency === 'MATIC'? 6 : 2}) ;
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
        setShowDepositButton(true)
        tx = await approveToken( Currencies[modalCurrency].address, ethers.utils.parseUnits(amountValue || '0'), library);
      } else if (withdrawDepositAction === "Deposit") {
        setShowDepositButton(false)
        if (modalCurrency === "MATIC") {
          tx = await depositEth(ethers.utils.parseUnits(amountValue), library)
        } else {
          // Deposit SUSD
          tx = await depositToken(Currencies[modalCurrency].address, ethers.utils.parseUnits(amountValue), library);
        }
      } else {
        setShowDepositButton(false)
        // Withdraw
        tx = await withdraw(Currencies[modalCurrency].address, ethers.utils.parseUnits(amountValue), library)
      }
      setApproving(false)
      console.log(tx);
      const description = approve === 'approve' ? 'Approving SUSD' : `${withdrawDepositAction} ${amountValue} ${modalCurrency}`;
      pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait()
        const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
        toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
        pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
      } catch (e) {
        const toastDescription = ToastDescription(description, e.transactionHash, chainId);
        pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
        toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
      }
      console.log(pendingTxsState);

    } catch (e) {
      setApproving(false)
      setShowDepositButton(false)
      handleErrorMessages({err: e})
    }
  }
  async function fillSendMax() {
    if (withdrawDepositAction === "Deposit") {
      const walletBalanceValue = await getWalletBalance(Currencies[modalCurrency].address, library);
      setAmountValue(walletBalanceValue);
    } else if (withdrawDepositAction === "Withdraw") {
      setAmountValue(String(shrubBalance.available[modalCurrency]));
      if(String(shrubBalance.available[modalCurrency]) === '0') {
        handleErrorMessages({customMessage: 'Nothing to withdraw :/'});
      }
    }
  }
  // populate balance table
  for (const currency of Object.keys(Currencies)) {

    const balanceSize = totalUserBalance(currency).length
    const fluidFontAsset = balanceSize > 9? ['md','2xl','3xl','3xl']:['2xl','2xl','3xl','4xl'];
    const fluidFontSplit = balanceSize > 9? ['xs','sm','lg','md']:['sm','sm','lg','lg'];
    const fluidWidthAsset = balanceSize > 9? [170,225,300,300]:[200,270,300,370];
    const fluidWidthSplit = balanceSize > 9? { sm: "300", md: "300", lg: "300", xl: "200" }: "auto";
    const fluidPaddingSplitY = [30,10,10,10];
    const fluidPaddingSplitL = [3,3,3,3];
    const fluidPaddingAssetL = [3,5,3,3];
    shrubfolioRows.push(
        <>
          <HStack key={currency}>
          <Box mt="1" fontSize={fluidFontAsset} fontWeight="semibold" lineHeight="tight" pl={fluidPaddingAssetL}
               minW={fluidWidthAsset}>
            {totalUserBalance(currency)} {currency}
          </Box>
            <Box fontSize={fluidFontSplit} minW={fluidWidthSplit}
            py={fluidPaddingSplitY} pl={fluidPaddingSplitL}>
              <Box pb={2} color="gray.500" fontWeight="semibold"   textTransform="uppercase">
                {shrubBalance.locked[currency].toLocaleString(undefined, {minimumFractionDigits: currency === 'MATIC'? 6 : 2})} locked
                {/*<Tooltip p={4} label="This amount is locked as collateral" fontSize={fluidFontSplit} borderRadius="lg" bg="shrub.300" color="white">*/}
                {/*  <Text as="sup" pl={1}><QuestionOutlineIcon boxSize={4}/></Text>*/}
                {/*</Tooltip>*/}
              </Box>
            <Box color="gray.500" fontWeight="semibold" textTransform="uppercase">
              {shrubBalance.available[currency].toLocaleString(undefined, {minimumFractionDigits: currency === 'MATIC'? 6 : 2})} unlocked
              {/*<Tooltip p={4} label="This amount is available for you to spend or withdraw" fontSize={fluidFontSplit} borderRadius="lg" bg="shrub.300" color="white">*/}
              {/*  <Text as="sup" pl={1}><QuestionOutlineIcon boxSize={4}/></Text>*/}
              {/*</Tooltip>*/}
            </Box>
            </Box>
          </HStack>
          <Divider
              _last={{display: "none"}}
          />
        </>
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
      {/*withdraw deposit buttons*/}
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
      <Container  mt={25} borderRadius="2xl" maxW="container.sm" bg={useColorModeValue("white", "shrub.100")} shadow={useColorModeValue("2xl", "2xl")}>
          {shrubfolioRows}
      </Container>
      {/*options view*/}
      <Container mt={50} p={hasOptions.current ? 0 : 8} flex="1" borderRadius="2xl" bg={useColorModeValue("white", "shrub.100")} shadow={useColorModeValue("2xl", "2xl")} maxW="container.sm">
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
            <Flex direction="column">
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
            </Flex>
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
                  {(modalCurrency === "MATIC"|| (isApproved && withdrawDepositAction === "Deposit")  || withdrawDepositAction === "Withdraw" ) && <FormControl id="amount">
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
                {modalCurrency !== "MATIC" && withdrawDepositAction === "Deposit" && !isApproved && <>
                  <Alert bgColor={alertColor} status="info" borderRadius={"md"} mb={3}>
                    <AlertIcon />
                    You will only have to approve once
                  </Alert>
                  <Button mb={1.5} colorScheme="teal" size={"lg"} isFullWidth={true}
                      onClick={() => {
                        if (active) {
                          handleDepositWithdraw(undefined, 'approve')
                        }
                      }}>Approve</ Button>
                </>
                }
                {(modalCurrency === "MATIC" || isApproved  || withdrawDepositAction === "Withdraw")  && <Button mb={1.5} size={"lg"} colorScheme="teal" isFullWidth={true} isDisabled={amountValue === '0' || amountValue === ''} onClick={handleDepositWithdraw}>
                  {withdrawDepositAction}
                </Button>}
              </>
              }
            {(approving || activeHash) && <Txmonitor txHash={activeHash} showDeposit={showDepositButton} goToDeposit={goToDeposit}/>}
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
}

export default Positions;
