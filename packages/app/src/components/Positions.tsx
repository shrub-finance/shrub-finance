import React, {useContext, useEffect, useRef, useState} from "react";
import {ethers} from "ethers";
import {
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
  useRadioGroup,
  Divider,
  StatArrow,
  StatHelpText,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Popover,
  Spinner,
  Heading, Tag, TagLabel, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel, PopoverCloseButton, PopoverHeader
} from '@chakra-ui/react'
import {
  depositEth,
  depositToken,
  withdraw,
  approveToken,
  getAvailableBalance,
  getLockedBalance,
  getAllowance,
  getWalletBalance,
  formatDate,
  optionTypeToNumber,
  exerciseLight,
  getOrderStack,
  toEthDate,
} from '../utils/ethMethods'
import {OrderCommon, ShrubBalance, SmallOrder, SupportedCurrencies} from '../types';
import {Currencies} from "../constants/currencies";
import {useWeb3React} from "@web3-react/core";
import {ConnectWalletModal, getErrorMessage} from "./ConnectWallet";
import {HelloBud} from '../assets/Icons';
import { BiPaperPlane, BsBoxArrowLeft, BsBoxArrowRight, FaFileContract, IoRocketSharp } from 'react-icons/all'
import {Link as ReachLink, navigate} from "@reach/router";
import {TxContext} from "./Store";
import {ToastDescription, Txmonitor} from "./TxMonitoring";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import RadioCard from './Radio';
import { ArrowBackIcon, ArrowForwardIcon, Icon, QuestionOutlineIcon } from '@chakra-ui/icons'
import { useQuery } from '@apollo/client'
import { SHRUBFOLIO_QUERY } from '../constants/queries';
import {isMobile} from "react-device-detect";
import usePriceFeed from '../hooks/usePriceFeed'
import { CHAINLINK_MATIC } from '../constants/chainLinkPrices'

const POLL_INTERVAL = 1000 // 1 second polling interval

function Positions() {
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const {active, library, account, error: web3Error, chainId} = useWeb3React();
  const alertColor = useColorModeValue("gray.100", "dark.300");
  const [withdrawDepositAction, setWithdrawDepositAction] = useState('');
  const [shrubfolioRows, setShrubfolioRows] = useState<JSX.Element[]>([]);
  const [isApproved, setIsApproved] = useState(false);
  const [walletTokenBalance, setWalletTokenBalance] = useState('');
  const [approving, setApproving] = useState(false);
  const { price: maticPrice } = usePriceFeed(CHAINLINK_MATIC);
  const [polling, setPolling] = useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const [optionsRows, setOptionsRows] = useState<JSX.Element[]>([<Tr key={"defaultOptionRow"}/>]);
  const [expiredOptionsRows, setExpiredOptionsRows] = useState<JSX.Element[]>([<Tr key={"defaultExpiredOptionRow"}/>]);
  const [localError, setLocalError] = useState('')
  const [shrubBalance, setShrubBalance] = useState({locked: {MATIC: 0, SMATIC: 0, SUSD: 0}, available: {MATIC: 0, SMATIC: 0, SUSD: 0}} as ShrubBalance);
  const hasOptions = useRef(false);
  const toast = useToast();
  const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal} = useDisclosure();
  const {isOpen: isOpenConnectWalletModal, onClose: onCloseConnectWalletModal} = useDisclosure();
  const [amountValue, setAmountValue] = useState("0");
  const [modalCurrency, setModalCurrency] = useState<SupportedCurrencies>('SUSD');
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  // radio buttons
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'currency',
    defaultValue: modalCurrency,
    onChange: (value: SupportedCurrencies) => setModalCurrency(value)
  })
  const currenciesRadiogroup = getRootProps();
  const [showDepositButton, setShowDepositButton] = useState(false);
  const SHRUB_CURRENCIES = ['SMATIC', 'SUSD'];
  const btnBg = useColorModeValue("sprout", "teal");

  const connectWalletTimeout = useRef<NodeJS.Timeout>();

  const livePriceColor = useColorModeValue("green.500", "green.200");

  const goBack = () => {
    navigate(-1);
  }

  const spinnerRow = <Tr>
      <Td> <Spinner thickness="1px" speed="0.65s" emptyColor="blue.200" color="teal.500" size="xs" label="loading" /></Td>
      <Td> <Spinner thickness="1px" speed="0.65s" emptyColor="blue.200" color="teal.500" size="xs" label="loading" /></Td>
      <Td display={{"base": "none", "md": "flex"}}> <Spinner thickness="1px" speed="0.65s" emptyColor="blue.200" color="teal.500" size="xs" label="loading" /></Td>
      <Td> <Spinner thickness="1px" speed="0.65s" emptyColor="blue.200" color="teal.500" size="xs" label="loading" /></Td>
    </Tr>;

  const {
    loading:shrubfolioLoading,
    error:shrubfolioError,
    data:shrubfolioData,
    startPolling:shrubfolioStartPolling,
    stopPolling:shrubfolioStopPolling
  } = useQuery(SHRUBFOLIO_QUERY, {
    variables: {
      id: account && account.toLowerCase()
    }
  })

  // start shrubfolio query polling if behind
  useEffect(() => {
    const queryBlock = shrubfolioData && shrubfolioData._meta && shrubfolioData._meta.block && shrubfolioData._meta.block.number;
    let txBlock = 0;
    for (const txinfo of Object.values(pendingTxsState)) {
      if (txinfo.data && txinfo.data.blockNumber && txinfo.data.blockNumber > queryBlock) {
        shrubfolioStartPolling(POLL_INTERVAL);
        setPolling(true);
        txBlock = txinfo.data.blockNumber;
      }
    }
    if (queryBlock > txBlock) {
      shrubfolioStopPolling();
      setPolling(false);
    }
  }, [shrubfolioData, pendingTxsState])

  // shrub balance display
  useEffect(() => {
    setLocalError('');
    async function shrubBalanceHandler() {
      await setTimeout(() => Promise.resolve(), 10);
      if (!active || !account) {
        connectWalletTimeout.current = setTimeout(() => {
          handleErrorMessages({ customMessage: 'Please connect your wallet'})
          console.error('Please connect wallet');
        },500);
        return;
      }
      if (connectWalletTimeout.current) {
        clearTimeout(connectWalletTimeout.current);
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
    const now = new Date();
    const optionRow:JSX.Element[] = [];
    const expiredOptionRow:JSX.Element[] = [];
    if (!shrubfolioData || !shrubfolioData.user || !shrubfolioData.user.activeUserOptions) {
      return
    }
    function graphqlOptionToOrderCommon(option: any) {
      const { baseAsset, quoteAsset, strike, expiry, optionType } = option;
      const common: OrderCommon = {
        quoteAsset: quoteAsset.id,
        baseAsset: baseAsset.id,
        expiry,
        optionType: optionTypeToNumber(optionType),
        strike: ethers.utils.parseUnits(strike, 6)
      }
      return common;
    }
    for (const userOption of shrubfolioData.user.activeUserOptions) {
      const orderStack = getOrderStack(userOption);
      const { balance, option, buyOrders, sellOrders} = userOption
      const { baseAsset, quoteAsset, strike, expiry:expiryRaw, optionType, lastPrice, id: optionId } = option;
      const isExpired = expiryRaw < toEthDate(now);
      // if (isExpired) {
      //   continue;
      // }

      const { symbol: baseAssetSymbol } = baseAsset;
      const { symbol: quoteAssetSymbol } = quoteAsset;

      const expiry = formatDate(expiryRaw);
      const amount = balance;
      const pair = `${quoteAssetSymbol === 'SMATIC' ? 'sMATIC' : 'sUSD'} ${optionType}`;
      const pair2 = `${Number(strike).toLocaleString(undefined, {style: 'currency', currency: 'USD'})} ${expiry}`;

      const common = graphqlOptionToOrderCommon(option);

      const inTheMoney = (optionType === 'CALL' && Number(maticPrice) > Number(strike)) ||
        (optionType === 'PUT' && Number(maticPrice) < Number(strike))


      hasOptions.current = true;
      if(!isExpired) {
        optionRow.push(
          <Tr key={optionId}>
            <Td fontWeight={'bold'} fontSize={"xs"}>
              <Box>{pair}</Box>
              <Box>{pair2}</Box>
              <Box>
                <Popover trigger={"hover"}>
                  <PopoverTrigger>
                    <Tag size='sm' colorScheme={inTheMoney ? 'cyan' : 'yellow'} borderRadius='full' cursor={"pointer"}>
                      <TagLabel>{inTheMoney ? 'ITM' : 'OTM'}</TagLabel>
                    </Tag>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>{inTheMoney ? 'In the Money (ITM)' : 'Out of the Money (OTM)'}</PopoverHeader>
                    <PopoverBody>{inTheMoney ?
                      'Owners can exercise this option at a preferential price to the market price. The intrisic value of this option is greater than 0' :
                      'Owners would be better off buying or selling the asset on the market rather than exercising. The intrinsic value of this option is 0'
                    }</PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
            </Td>
            {/*<Td>{orderStack.totalValue.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</Td>*/}
            <Td>{amount}</Td>
            {!isMobile && <Td>{orderStack.lastPrice.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</Td>}
            <Td>
              <Box>
                <StatHelpText>
                  {
                    !!orderStack.totalUnrealizedGain && <StatArrow type={orderStack.totalUnrealizedGain > 0 ? "increase" : "decrease"} />
                  }
                  {orderStack.totalUnrealizedGain.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
                </StatHelpText>
              </Box>
              {amount >= 0 && <Box pt={4}>
                  <Button
                      colorScheme={btnBg}
                      variant={"link"}
                      size="sm"
                      onClick={() => handleClickExercise(pair, common, amount)}
                  >
                      Exercise
                    {/*  Old Exercised logic */}
                    {/*</Button>Number(amount) === 0 ? <Button*/}
                    {/*  variant={"ghost"}*/}
                    {/*  isDisabled={true}*/}
                    {/*  colorScheme={btnBg}*/}
                    {/*  size="xs"*/}
                    {/*>*/}
                    {/*  Exercised*/}
                    {/*</Button>*/}
                  </Button>
              </Box>
              }
            </Td>
          </Tr>
        )
      } else {
        expiredOptionRow.push(
          <Tr key={optionId}>
            <Td fontWeight={'bold'} fontSize={"xs"}>
              <Box>{pair}</Box>
              <Box>{pair2}</Box>
              <Box>
                <Popover trigger={"hover"}>
                  <PopoverTrigger>
                    <Tag size='sm' colorScheme={inTheMoney ? 'cyan' : 'yellow'} borderRadius='full' cursor={"pointer"}>
                      <TagLabel>{inTheMoney ? 'ITM' : 'OTM'}</TagLabel>
                    </Tag>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>{inTheMoney ? 'In the Money (ITM)' : 'Out of the Money (OTM)'}</PopoverHeader>
                    <PopoverBody>{inTheMoney ?
                      'Owners can exercise this option at a preferential price to the market price. The intrisic value of this option is greater than 0' :
                      'Owners would be better off buying or selling the asset on the market rather than exercising. The intrinsic value of this option is 0'
                    }</PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
            </Td>
            {/*<Td>{orderStack.totalValue.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</Td>*/}
            <Td>{amount}</Td>
            <Td>{orderStack.lastPrice.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</Td>
            <Td>
              <Box>
                <StatHelpText>
                  {
                    !!orderStack.totalUnrealizedGain && <StatArrow type={orderStack.totalUnrealizedGain > 0 ? "increase" : "decrease"} />
                  }
                  {orderStack.totalUnrealizedGain.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
                </StatHelpText>
              </Box>
            </Td>
          </Tr>
        )
      }

    }
    setOptionsRows(optionRow);
    setExpiredOptionsRows(expiredOptionRow);
  }, [shrubfolioData])

  // determine if approved
  useEffect(() => {
    if (!library) {
      return;
    }
    async function handleApprove(){
      await setTimeout(() => Promise.resolve(), 10);
      setWalletTokenBalance('-');
      if (modalCurrency !== 'MATIC') {
        try {
          const allowance = await getAllowance(Currencies[modalCurrency].address, library);
          console.log(allowance);
          if(allowance.gt(ethers.BigNumber.from(0))) {
            setIsApproved(true);
          } else {
            setIsApproved(false);
          }
        } catch (e) {
          handleErrorMessages(e);
          console.error(e);
        }
        try {
          const balance = await getWalletBalance(Currencies[modalCurrency].address, library)
          setWalletTokenBalance(balance);
        } catch (e) {
          handleErrorMessages(e);
          console.error(e)
        }
      }
    }
    handleApprove();
  }, [modalCurrency, account, pendingTxsState, active])

  // set shrubfolio rows
  useEffect(() => {
    // populate balance table
    const tempShrubfolioRows = [];
    for (const currency of SHRUB_CURRENCIES) {

      const balanceSize = totalUserBalance(currency).length
      const fluidFontAsset = balanceSize > 9? ['md','2xl','3xl','3xl']:['2xl','2xl','3xl','4xl'];
      const fluidFontSplit = balanceSize > 9? ['xs','sm','lg','md']:['sm','sm','lg','lg'];
      const fluidWidthAsset = balanceSize > 9? [170,225,300,300]:[200,270,300,370];
      const fluidWidthSplit = balanceSize > 9? { sm: "300", md: "300", lg: "300", xl: "200" }: "auto";
      const fluidPaddingSplitY = [30,10,10,10];
      const fluidPaddingSplitL = [3,3,3,3];
      const fluidPaddingAssetL = [3,5,3,3];
      tempShrubfolioRows.push(
        <div key={currency}>
          <Flex
                align="center"
                justify="space-evenly">

            <Box mt="1" fontSize={fluidFontAsset} fontWeight="semibold" lineHeight="tight" pl={fluidPaddingAssetL}
                 minW={fluidWidthAsset}>
              {totalUserBalance(currency)} {currency === 'SMATIC' ? 'sMATIC' : 'sUSD'}
            </Box>

            <Box fontSize={fluidFontSplit} minW={fluidWidthSplit}
                 py={fluidPaddingSplitY} pl={fluidPaddingSplitL}
                 flexBasis="60">

              <Box pb={2} color="gray.500" fontWeight="semibold">
                {shrubBalance.locked[currency]? shrubBalance.locked[currency].toLocaleString(undefined, {minimumFractionDigits: currency === 'MATIC'? 6 : 2}) : "--"} LOCKED
                {!isMobile &&
                <Popover trigger={"hover"}>
                  <PopoverTrigger >
                    <Text ml="1" as="sup" cursor="pointer"><QuestionOutlineIcon boxSize={4} pl={1}/></Text>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody letterSpacing="wide">
                      <Text> This amount is locked as collateral</Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>}
              </Box>

              <Box color="gray.500" fontWeight="semibold">
                {shrubBalance.available[currency] ? shrubBalance.available[currency].toLocaleString(undefined, {minimumFractionDigits: currency === 'MATIC'? 6 : 2}): "--"} UNLOCKED
                {!isMobile &&
                <Popover trigger={"hover"}>
                  <PopoverTrigger >
                    <Text ml="1" as="sup" cursor="pointer"><QuestionOutlineIcon boxSize={4} pl={1}/></Text>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody letterSpacing="wide">
                      <Text> This amount is available for you to spend or withdraw</Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>}
              </Box>
            </Box>
          </Flex>
          <Divider
            // _last={{display: "none"}}
          />
        </div>
      );
    }
    setShrubfolioRows(tempShrubfolioRows);
  }, [shrubBalance])

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

  async function handleClickExercise(pair: string, common: OrderCommon, amount: string) {
    try {
      const bigAmount = ethers.utils.parseUnits(amount, 18);
      const tx = await exerciseLight(common, bigAmount, library);
      const { optionType, strike } = common;
      const formattedStrike = ethers.utils.formatUnits(strike,6);
      const description = `Exercise ${pair} option for $${Number(amount) * Number(formattedStrike)} at strike $${formattedStrike}`
      pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
      const receipt = await tx.wait()
      const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
      toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
      pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed', data: {blockNumber: receipt.blockNumber}})
      return tx;
    } catch (e) {
      console.error(e);
      handleErrorMessages({err:e});
    }

  }

  function totalUserBalance(currency: string) {
    const totBalance = shrubBalance.locked[currency] + shrubBalance.available[currency];
    if(totBalance) {
      return Number(totBalance).toLocaleString(undefined, {minimumFractionDigits: ['MATIC'].includes(currency) ? 6 : 2}) ;
    }
    else
      return "--"
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
    }
  }
  const expiredRowTableBg = useColorModeValue("white", "dark.100");
  const optionRowTableBg =  useColorModeValue(expiredOptionsRows.length ? "white" : undefined, expiredOptionsRows.length ? "dark.100" : undefined);
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
      </Container>
      {/*withdraw deposit buttons*/}
      <Container mt={50} flex="1" borderRadius="2xl" maxW="container.md">
        <Center>
        <Button colorScheme={useColorModeValue("sprout", "teal")} variant="outline" borderRadius="full"
            rightIcon={<BsBoxArrowLeft/>} onClick={handleWithdrawDepositModalOpen( 'Deposit')} isDisabled={!active} mr={4}>
          Deposit
        </Button>
        <Button colorScheme={useColorModeValue("sprout", "teal")} variant="outline" borderRadius="full" rightIcon={<BsBoxArrowRight/>} onClick={handleWithdrawDepositModalOpen( 'Withdraw')} isDisabled={!active}>
          Withdraw
        </Button>
        </Center>
      </Container>
      <Container mt={2} flex="1" borderRadius="2xl" maxW="container.sm">
        {!isMobile && <Flex>
          <Box>
            <Button leftIcon={<ArrowBackIcon />} colorScheme="blue" variant="link" fontSize={"xs"}
                    onClick={goBack}>
              Back
            </Button>
          </Box>
          <Spacer/>
          <Box>
            <Text color={livePriceColor} fontSize={"xs"} fontWeight={"bold"}>
              sMATIC: ${maticPrice ? maticPrice.toFixed(2) : "-"}
            </Text>
          </Box>
        </Flex>}
      </Container>
      {/*asset view*/}
      <Container mt={1}
          borderRadius="2xl" maxW="container.sm" bg={useColorModeValue("white", "dark.100")} shadow={useColorModeValue("2xl", "2xl")}>
          {shrubfolioRows}
      </Container>

      {/*withdraw deposit modal*/}
      <Modal motionPreset="slideInBottom" onClose={handleWithdrawDepositModalClose} isOpen={isOpenModal}
      size={isMobile ? 'full' : 'md' } scrollBehavior={isMobile ?"inside" : "outside"}
      >
        <ModalOverlay/>
        <ModalContent borderRadius={isMobile ? 'none' : '2xl'}>
          <ModalHeader>{withdrawDepositAction}</ModalHeader>
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
                  <FormControl id="currency" mt={4}>
                  <HStack {...currenciesRadiogroup}>
                    {SHRUB_CURRENCIES.map((value) => {
                      const radio = getRadioProps({ value })
                      return (
                          <RadioCard key={value} {...radio}>
                            {value === 'SMATIC' ? 'sMATIC' : 'sUSD'}
                          </RadioCard>
                      )
                    })}
                  </HStack>
                  </FormControl>
                  {(modalCurrency === "MATIC"|| (isApproved && withdrawDepositAction === "Deposit")  || withdrawDepositAction === "Withdraw" ) && <FormControl id="amount">
                    <Flex>
                      <Spacer/>
                        <Button
                            variant={'link'}
                            size={'xs'}
                            colorScheme={"black"}
                            mb={3}
                            rounded={'lg'}
                            onClick={fillSendMax}
                        >
                            MAX: {withdrawDepositAction === 'Deposit' ? walletTokenBalance : String(shrubBalance.available[modalCurrency])}
                        </Button>
                    </Flex>
                      <NumberInput
                          onChange={(valueString) => setAmountValue(parse(valueString))}
                          value={format(amountValue)} size="lg"
                      >
                          <NumberInputField
                              h="6rem"
                              rounded="3xl"
                              shadow="sm"
                              fontWeight="bold"
                              fontSize="2xl"/>
                          <InputRightElement
                              pointerEvents="none"
                              p={14}
                              children={
                                <FormLabel htmlFor="amount" color="gray.500" fontWeight="bold">{modalCurrency === 'SMATIC' ? 'sMATIC' : 'sUSD'}</FormLabel>
                              }/>
                      </NumberInput>
                  </FormControl>}
                </Stack>
                {modalCurrency !== "MATIC" && withdrawDepositAction === "Deposit" && !isApproved && <>
                  <Alert bgColor={alertColor} status="info" borderRadius={"md"} mb={3}>
                    <AlertIcon />
                    You will only have to approve once
                  </Alert>
                  <Button mb={1.5} colorScheme={btnBg} size={"lg"} isFullWidth={true} rounded="2xl"
                      onClick={() => {
                        if (active) {
                          handleDepositWithdraw(undefined, 'approve')
                        }
                      }}>Approve</ Button>
                </>
                }
                {(modalCurrency === "MATIC" || isApproved  || withdrawDepositAction === "Withdraw")  && <Button mb={1.5} size={"lg"} colorScheme={btnBg} isFullWidth={true} isDisabled={amountValue === '0' || amountValue === ''} onClick={handleDepositWithdraw} rounded="2xl">
                  {withdrawDepositAction}
                </Button>}
              </>
              }
            {(approving || activeHash) && <Txmonitor txHash={activeHash} showDeposit={showDepositButton} goToDeposit={goToDeposit}/>}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Heading mt={10}><Center><Icon as={BiPaperPlane} mr={2}/>Option Positions</Center></Heading>
      <Container mt={10}
                 borderRadius="2xl" maxW="container.sm" bg={useColorModeValue("white", "dark.100")} shadow={useColorModeValue("2xl", "2xl")}>
        <Tabs p={4} variant='unstyled' isLazy>
          <TabList >
            <Tab _focus={{boxShadow: "none"}} fontWeight={"bold"}
                 _selected={{ color: "sprout.500", borderBottomWidth:"2px",
                   borderColor:"sprout.300"}}>Active</Tab>
            <Tab _focus={{boxShadow: "none"}} fontWeight={"bold"}
                 _selected={{ color: "sprout.500", borderBottomWidth:"2px",
                   borderColor:"sprout.300"}}>Claim</Tab>
            <Tab _focus={{boxShadow: "none"}} fontWeight={"bold"}
                 _selected={{ color: "sprout.500", borderBottomWidth:"2px",
                   borderColor:"sprout.300"}}>Realized Gain</Tab>
          </TabList>
          <TabPanels >
            <TabPanel>
              {
                (!shrubfolioLoading && !shrubfolioError && account) ?

                  (shrubfolioData && shrubfolioData.user && shrubfolioData.user.activeUserOptions && shrubfolioData.user.activeUserOptions[0]) ?

                    (
                      <>
                        { optionsRows.length ? <Table variant="simple" size="lg"  borderTopRadius={expiredOptionsRows.length && "2xl"} >
                            <Thead>
                              <Tr>
                                <Th color={"gray.400"}>Position</Th>
                                {/*<Th color={"gray.400"}>Balance</Th>*/}
                                <Th color={"gray.400"}>Qty</Th>
                                {!isMobile && <Th color={"gray.400"}>Price</Th>}
                                <Th color={"gray.400"}>Gain/Loss</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg={optionRowTableBg}>
                              {polling ? spinnerRow : <></>}
                              {optionsRows}
                            </Tbody>
                          </Table>
                          : null
                        }
                      </>
                    ) : (
                      <Flex direction="column" p={10}>
                        <Center>
                          <HelloBud boxSize={200}/>
                        </Center>
                        <Center pt={6}>
                          <Box as="span" fontWeight="semibold" fontSize="sm" color="gray.500">
                            You don't have any options yet!
                          </Box>
                        </Center>
                        <Center pt={6}>
                          <Button rightIcon={<IoRocketSharp/>} colorScheme={btnBg}
                                  variant="outline"
                                  borderRadius={"full"} as={ReachLink} to="/options">
                            Buy Some
                          </Button>
                        </Center>
                      </Flex>
                    )

                  : (<Table variant="simple" size="lg">
                    <Thead>
                      <Tr>
                        <Th color={"gray.400"}>Position</Th>
                        {/*<Th color={"gray.400"}>Balance</Th>*/}
                        <Th color={"gray.400"}>Qty</Th>
                        <Th color={"gray.400"} display={{"base": "none", "md": "flex"}}>Price</Th>
                        <Th color={"gray.400"}>Gain/Loss</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {spinnerRow}
                    </Tbody>
                  </Table>)
              }
            </TabPanel>
            <TabPanel>
              {
                (!shrubfolioLoading && !shrubfolioError && account) ?

                  (shrubfolioData && shrubfolioData.user && shrubfolioData.user.activeUserOptions && shrubfolioData.user.activeUserOptions[0]) &&
                      <>

                        {expiredOptionsRows.length ? <Table variant="simple" size="lg" borderBottomRadius="2xl"
                                                            borderTopRadius={!optionsRows.length ? "2xl" : "none"}>
                          <Tbody bg={expiredRowTableBg} >
                            {expiredOptionsRows}
                          </Tbody>
                        </Table> : null
                        }
                      </>
                  : <Table variant="simple" size="lg">
                    <Thead>
                      <Tr>
                        <Th color={"gray.400"}>Position</Th>
                        {/*<Th color={"gray.400"}>Balance</Th>*/}
                        <Th color={"gray.400"}>Qty</Th>
                        <Th color={"gray.400"} display={{"base": "none", "md": "flex"}}>Price</Th>
                        <Th color={"gray.400"}>Gain/Loss</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {spinnerRow}
                    </Tbody>
                  </Table>
              }
            </TabPanel>
            <TabPanel>
              <p></p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>


    </>
  );
}

export default Positions;
