import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Alert,
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertIcon,
    Box,
    Button,
    Divider,
    Flex,
    FormLabel, Heading,
    HStack,
    Input, InputLeftElement, InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    NumberInput,
    NumberInputField,
    Popover,
    PopoverArrow,
    PopoverBody, PopoverCloseButton,
    PopoverContent, PopoverHeader,
    PopoverTrigger,
    SlideFade, Spacer,
    Stack, Tab,
    Table, TabList, TabPanel, TabPanels, Tabs,
    Tag,
    TagLabel,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorModeValue,
    useDisclosure,
    useRadioGroup,
    useToast, VStack,
} from '@chakra-ui/react'
import {Icon, QuestionIcon, QuestionOutlineIcon, WarningTwoIcon} from '@chakra-ui/icons';
import {
    BiQuestionMark,
    FiShoppingCart,
    GiMoneyStack,
    MdArrowDownward,
    MdArrowUpward,
    MdDateRange,
    RiHandCoinLine, RiQuestionMark
} from "react-icons/all";
import RadioCard from "./Radio";
import {
    getAddressFromSignedOrder,
    getUserNonce,
    optionTypeToNumber,
    signOrder,
    toEthDate,
    getAvailableBalance,
    matchOrders,
    optionActionToIsBuy,
    transformOrderAppChain,
    validateOrderAddress,
    formatDate,
    getSymbolFor,
    announceOrder,
    iOrderToCommon,
    getAnnouncedEvent,
    formatTime,
    getBigWalletBalance,
    userOptionPosition,
} from '../utils/ethMethods'
import { BigNumber, ethers } from 'ethers'
import {useWeb3React} from "@web3-react/core";
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    AppCommon, AppOrderSigned,
    IOrder, OptionData,
    OrderBook,
    OrderCommon,
    OrderType,
    SellBuy,
    UnsignedOrder,
} from '../types'
import {TxContext} from "./Store";
import {ToastDescription} from "./TxMonitoring";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import {getErrorMessage} from './ConnectWallet';
import {isMobile} from "react-device-detect";
import { useLazyQuery, useQuery } from '@apollo/client'
import { OPTION_POSITION_QUERY, ORDER_DETAILS_QUERY } from '../constants/queries'
import usePriceFeed from "../hooks/usePriceFeed";
import {CHAINLINK_MATIC} from "../constants/chainLinkPrices";

const { Zero } = ethers.constants;

function OptionDetails({ appCommon, sellBuy, hooks, optionData, positionHash }: {
    appCommon: AppCommon,
    sellBuy: SellBuy,
    hooks: {approving: any, setApproving: any, activeHash: any, setActiveHash: any},
    optionData: OptionData,
    positionHash: string
}) {
console.log('rendering');
    const { isOpen: isOpenConfirmDialog, onOpen: onOpenConfirmDialog, onClose: onCloseConfirmDialog } = useDisclosure();
    const cancelRef = useRef();
    const { price: maticPrice } = usePriceFeed(CHAINLINK_MATIC);

    const [localError, setLocalError] = useState('');
    const {
        isOpen: isOpenConnectModal,
        onClose: onCloseConnectModal
    } = useDisclosure();

    const { approving, setApproving, setActiveHash } = hooks;
    const {active, library, account, error: web3Error, chainId} = useWeb3React();
    const alertColor = useColorModeValue("gray.100", "dark.300");
    const livePriceColor = useColorModeValue("green.500", "green.200")
    const { pendingTxs } = useContext(TxContext);
    const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
    const {formattedStrike, formattedExpiry, baseAsset, quoteAsset, expiry, optionType, strike} = appCommon
    // Hooks
    const [amount, setAmount] = useState(1);
    const [newAmount, setNewAmount] = useState('1.0');
    const [price, setPrice] = useState('');
    const [balances, setBalances] = useState<{shrub: {baseAsset: BigNumber, quoteAsset: BigNumber}, wallet: {baseAsset: BigNumber, quoteAsset: BigNumber}, optionPosition: BigNumber}>()
    const [marketPrice, setMarketPrice] = useState('');
    const [orderBook, setOrderBook] = useState<OrderBook>({buyOrders: [], sellOrders: [], buyOrdersDepth: Zero, sellOrdersDepth: Zero, initialized: false})
    // Radio logic
    const [radioOption, setRadioOption] = useState<SellBuy>(sellBuy);
    const [radioOrderType, setRadioOrderType] = useState<OrderType>('Market');
    const toast = useToast();
    const {
        getRootProps: getOptionRootProps,
        getRadioProps: getOptionRadioProps,
    } = useRadioGroup({
        name: "option",
        defaultValue: sellBuy,
        onChange: (nextValue: SellBuy) => setRadioOption(nextValue),
    });

    const orderBookColorMobile = useColorModeValue("gray.500", "black");
    const orderBookBgColorMobile = useColorModeValue("gray.100", "gray.400");
    const orderBookColor = useColorModeValue("gray.600", "gray.200");

    const {
        loading: orderDetailsLoading,
        error: orderDetailsError,
        data: orderDetailsData
    } = useQuery(ORDER_DETAILS_QUERY, {
        variables: {
            positionHash,
            offerExpire: toEthDate(new Date()),
        },
        pollInterval: 5000  // Poll every five seconds
    });

    useEffect(() => {
        // console.log('useEffect - 1 - construct order book')
        if (!orderDetailsData) {
            return
        }
        const {
            strike: decimalStrike,
            lastPrice,
            sellOrders,
            buyOrders,
            id,
        } = orderDetailsData && orderDetailsData.option

        const buyOrdersBook = buyOrders.map((order: any) => {
            return {
                unitPrice: Number(order.pricePerContract),
                formattedSize: order.size,
                positionHash,
                user: order.userOption.user.id,
                blockHeight: order.block,
            }
        }).sort((a: any, b: any) => b.unitPrice - a.unitPrice)
        const sellOrdersBook = sellOrders.map((order: any) => {
            return {
                unitPrice: Number(order.pricePerContract),
                formattedSize: order.size,
                positionHash,
                user: order.userOption.user.id,
                blockHeight: order.block,
            }
        }).sort((a: any, b: any) => a.unitPrice - b.unitPrice)

        const sellOrdersDepth = sellOrdersBook.reduce((tot: BigNumber, order: any) => tot.add(ethers.utils.parseUnits(order.formattedSize, 6)), Zero)
        const buyOrdersDepth = buyOrdersBook.reduce((tot: BigNumber, order: any) => tot.add(ethers.utils.parseUnits(order.formattedSize, 6)), Zero)
        setOrderBook({ sellOrders: sellOrdersBook, buyOrders: buyOrdersBook, sellOrdersDepth, buyOrdersDepth, initialized: true })
    }, [orderDetailsData])

    useEffect(() => {
        // console.log('useEffect - 2 - set market price')
        if (!price) {
            setPrice(radioOption === 'BUY' ? orderBook.sellOrders[0]?.unitPrice.toFixed(4) : orderBook.buyOrders[0]?.unitPrice.toFixed(4));
        }
        if (radioOrderType !== 'Market') {
            return;
        }
        setMarketPrice(radioOption === 'BUY' ? orderBook.sellOrders[0]?.unitPrice.toFixed(4) : orderBook.buyOrders[0]?.unitPrice.toFixed(4));
    }, [radioOrderType, orderBook])

    // Get balances
    useEffect(() => {
        // console.log('useEffect - 3 - get balances');
        async function main() {
            if (!account) {
                return;
            }
            const bigQuoteAssetBalanceShrub = await getAvailableBalance({
                address: account,
                tokenContractAddress: quoteAsset,
                provider: library
            })
            const bigBaseAssetBalanceShrub = await getAvailableBalance({
                address: account,
                tokenContractAddress: baseAsset,
                provider: library
            })
            const { bigBalance: bigQuoteAssetBalanceWallet } = await getBigWalletBalance(quoteAsset, library);
            const { bigBalance: bigBaseAssetBalanceWallet } = await getBigWalletBalance(baseAsset, library);
            const optionPosition = await userOptionPosition(account, positionHash, library);
            setBalances({
                shrub: {quoteAsset: bigQuoteAssetBalanceShrub, baseAsset: bigBaseAssetBalanceShrub},
                wallet: {baseAsset: bigBaseAssetBalanceWallet, quoteAsset: bigQuoteAssetBalanceWallet},
                optionPosition
            })
        }
        main()
          .catch(console.error);
    },[active, account])

    const {
        getRootProps: getOrderTypeRootProps,
        getRadioProps: getOrderTypeRadioProps,
    } = useRadioGroup({
        name: "orderType",
        defaultValue: 'Market',
        onChange: (nextValue: OrderType) => {
            setRadioOrderType(nextValue)
        },
    });

    const groupOption = getOptionRootProps();
    const groupOptionType = getOrderTypeRootProps();

   const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

   function costForAmount(costAmount: number, optionType: SellBuy) {
       const bigAmount = ethers.utils.parseUnits(costAmount.toString(), 6);
       let remainingSize = ethers.utils.parseUnits(costAmount.toString(), 6);
       let accumulatedPrice = Zero;
       const orders = optionType === 'BUY' ? orderBook.sellOrders : orderBook.buyOrders;
       if (bigAmount.gt(optionType === 'BUY' ? orderBook.sellOrdersDepth : orderBook.buyOrdersDepth)) {
           return;
       }
       for (const order of orders) {
           const {unitPrice, formattedSize} = order;
           const bigSize = ethers.utils.parseUnits(formattedSize, 6);
           const bigUnitPrice = ethers.utils.parseUnits(unitPrice.toString(), 18);
           if (bigSize.gt(remainingSize)) {
               // This order satisfies
               accumulatedPrice = accumulatedPrice.add(bigUnitPrice.mul(remainingSize).div(1e6));
               remainingSize = remainingSize.sub(remainingSize);
               break;
           }
           accumulatedPrice = accumulatedPrice.add(bigUnitPrice.mul(bigSize).div(1e6))
           remainingSize = remainingSize.sub(bigSize);
       }
       return accumulatedPrice;
   }

    async function limitOrder() {
        try {
        setApproving(true);
        if (!active || !account) {
            setLocalError('');
            handleErrorMessages({ customMessage: 'Please connect your wallet'})
            console.error('Please connect your wallet');
            setApproving(false);
            return;
        }
        if (!price) {
            throw new Error('Price is required');
        }
        const now = new Date();
        const oneDayFromNow = new Date(now);
        oneDayFromNow.setUTCDate(oneDayFromNow.getUTCDate() + 1);
        const common:OrderCommon = {
            baseAsset,
            quoteAsset,
            expiry: toEthDate(expiry),
            strike,
            optionType: optionTypeToNumber(optionType)
        }
        const nonce = (await getUserNonce(account, common, library)) + 1;
        const unsignedOrder: UnsignedOrder = {
            size: ethers.utils.parseUnits(newAmount, 18),
            isBuy: optionActionToIsBuy(radioOption),
            optionType: optionTypeToNumber(optionType),
            baseAsset,
            quoteAsset,
            expiry: toEthDate(expiry),
            strike,
            price: ethers.utils.parseUnits((Number(price) * Number(newAmount)).toString(), 18),
            fee: ethers.utils.parseUnits('0', 18),
            offerExpire: toEthDate(oneDayFromNow),
            nonce,
        };
            const signedOrder = await signOrder(unsignedOrder, library);
            const verifiedAddress = await getAddressFromSignedOrder(signedOrder, library);
            console.log(`verifiedAddress: ${verifiedAddress}`);
            const tx = await announceOrder(signedOrder, library);
            console.log(tx);
            const quoteSymbol = await getSymbolFor(quoteAsset, library);
            const description = `Submitted limit order to ${radioOption.toLowerCase()} ${newAmount} ${formatDate(expiry)} $${formattedStrike} ${quoteSymbol} ${optionType.toLowerCase()} options for $${price}`;
            const orderToName = {
                optionAction: radioOption,
                formattedSize: newAmount,
                optionType,
                formattedStrike,
                formattedExpiry
            };
            const data = {
                txType: 'limitOrder',
                id: '',
                blockNumber: '',
                orderToName,
                positionHash,
                userAccount: account,
                status: 'confirming',
                pricePerContract: price
            }
            pendingTxsDispatch({type: 'add', txHash: tx.hash, description, data})
            setActiveHash(tx.hash);
            console.log(pendingTxsState);
            try {
                const receipt = await tx.wait()
                const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
                toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed', data: {blockNumber: receipt.blockNumber, status: 'active'}})
            } catch (e) {
                const toastDescription = ToastDescription(description, e.transactionHash, chainId);
                toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
            }
            console.log(pendingTxsState);
            setApproving(false);
        } catch (e) {
            console.error(e);
            setApproving(false);
            handleErrorMessages({err:e});
        }
    }

    async function marketOrderMany() {
        try {
            console.log('running marketOrderMany');
            setApproving(true);
            if (!active || !account) {
                setLocalError('');
                handleErrorMessages({ customMessage: 'Please connect your wallet'})
                console.error('Please connect your wallet');
                setApproving(false);
                return;
            }
            let signedBuyOrders: IOrder[] = [];
            let signedSellOrders: IOrder[] = [];
            const localOrderBook = radioOption === 'BUY' ? orderBook.sellOrders : orderBook.buyOrders;
            // const depth = localOrderBook.reduce((tot, order) => tot.add(order.size), Zero)
            const depth = localOrderBook.reduce((tot, order) => tot.add(ethers.utils.parseUnits(order.formattedSize, 18)), Zero)
            const bigSize = ethers.utils.parseUnits(newAmount.toString(), 18);
            if (bigSize.gt(depth)) {
                throw new Error('Not enough open orders for the amount you are trying to buy');
            }
            let remainingSize = ethers.BigNumber.from(bigSize);
            const now = new Date();
            const oneWeekFromNow = new Date(now);
            oneWeekFromNow.setUTCDate(oneWeekFromNow.getUTCDate() + 7);

            // Create as many unsigned orders as needed to get the total amount up to the requested amount
            const counterPartyOrders: IOrder[] = [];

            let index = 0;
            let accumulatedPrice = Zero;
            let temporaryWorkaroundPrice = Zero;
            while (remainingSize.gt(Zero)) {
                // const order = localOrderBook[index];
                let order: AppOrderSigned | undefined;
                const lightOrder = localOrderBook[index];
                if (!lightOrder) {
                    throw new Error('Not enough open orders for the amount you are trying to buy');
                }
                // @ts-ignore
                const {blockHeight, user, formattedSize, unitPrice} = lightOrder;
                const orders = await getAnnouncedEvent(library, positionHash, user, blockHeight);
                if (!orders) {
                    continue;
                }
                if (orders.length === 1) {
                    order = orders[0];
                } else {
                    order = orders.find((o) => {
                        return (
                            o.optionAction !== radioOption &&
                            Number(o.formattedSize).toFixed(4) === Number(formattedSize).toFixed(4) &&
                            Number(o.unitPrice).toFixed(4) === Number(unitPrice).toFixed(4)
                        )
                    })
                }
                if (!order) {
                    continue;
                }
                // Need to convert order into AppOrderSigned
                const { address: counterpartyAddress, nonce: orderNonce, size } = order;
                if (!counterpartyAddress) {
                    console.error('no counterparty address on order');
                    index++;
                    continue;
                }
                const counterPartyOrder = transformOrderAppChain(order);
                const doesAddressMatch: boolean = await validateOrderAddress(counterPartyOrder, library);
                const counterPartyCommon = iOrderToCommon(counterPartyOrder);
                console.log(doesAddressMatch);
                const counterpartyNonce = await getUserNonce(counterpartyAddress, counterPartyCommon, library) + 1;
                console.log(counterpartyNonce);
                console.log(orderNonce);
                if (orderNonce !== counterpartyNonce) {
                    console.error("order nonce does not match the signer of the order's nonce");
                    index++;
                    continue;
                }
                // if buying - check the collateral of the counterparty
                if (radioOption === 'BUY') {
                    if (optionType === 'CALL') {
                        // required collateral is size of the quoteAsset
                        const balance = await getAvailableBalance({
                            address: counterpartyAddress,
                            tokenContractAddress: quoteAsset,
                            provider: library
                        });
                        console.log(balance);
                        console.log(size)
                        if (balance.lt(size)) {
                            throw new Error("Insufficient Collateral");
                        }
                    } else {
                        // Case: PUT
                        // required collateral is strike * size of the baseAsset
                        const balance = await getAvailableBalance({
                            address: counterpartyAddress,
                            tokenContractAddress: baseAsset,
                            provider: library
                        });
                        console.log(balance.toString());
                        // TODO: Add this validation back where it properly checks if the user has sufficient funds to buy the put
                        // if (balance.lt(ethers.BigNumber.from(pricePerContract).mul(size))) {
                        //     throw new Error("Not enough collateral of baseAsset");
                        // }
                    }
                }
                // TODO: If selling, check that you have sufficient collateral

                remainingSize = remainingSize.sub(order.size);
                accumulatedPrice = accumulatedPrice.add(counterPartyOrder.price);
                if (remainingSize.lt(Zero)) {
                    accumulatedPrice = accumulatedPrice.add(remainingSize.mul(counterPartyOrder.price).div(counterPartyOrder.size));
                    remainingSize = Zero;
                }
                counterPartyOrders.push(counterPartyOrder);
                // TODO: the matchOrders method of the contract needs to accomadate accumulatedPrice - see chat logs from Oct 21
                temporaryWorkaroundPrice = bigSize.mul(counterPartyOrder.price).div(counterPartyOrder.size);
                console.log('remaining size');
                console.log(ethers.utils.formatUnits(remainingSize));
                index++;
            }
            const common:OrderCommon = {
                baseAsset,
                quoteAsset,
                expiry: toEthDate(expiry),
                strike,
                optionType: optionTypeToNumber(optionType)
            }
            const nonce = (await getUserNonce(account, common, library)) + 1;

            const unsignedOrder: UnsignedOrder = {
                ...common,
                size: bigSize,
                isBuy: optionActionToIsBuy(radioOption),
                // TODO: update contract so that the commented out price logic works (with partial orders)
                // price: accumulatedPrice,
                price: temporaryWorkaroundPrice,
                fee: ethers.utils.parseUnits('0', 18),
                offerExpire: toEthDate(oneWeekFromNow),
                nonce,
            };
            // ordersToSign.push(unsignedOrder);
            const signedOrder = await signOrder(unsignedOrder, library);
            if (radioOption === 'BUY') {
                signedBuyOrders = [signedOrder];
                signedSellOrders = counterPartyOrders;
            } else {
                signedBuyOrders = counterPartyOrders;
                signedSellOrders = [signedOrder];
            }
            console.log(signedBuyOrders, signedSellOrders);
            const tx = await matchOrders(signedBuyOrders, signedSellOrders, library)
            console.log(tx);
            const quoteSymbol = await getSymbolFor(quoteAsset, library);
            const description = `${radioOption === 'BUY' ? 'Buy' : 'Sell'} ${newAmount} ${formatDate(expiry)} $${formattedStrike} ${quoteSymbol} ${optionType.toLowerCase()} options for $${ethers.utils.formatUnits(accumulatedPrice, 18)}`;
            const orderToName = {
                optionAction: radioOption,
                formattedSize: newAmount,
                optionType,
                formattedStrike,
                formattedExpiry
            };
            const pricePerContract = Number(ethers.utils.formatUnits(accumulatedPrice)) / Number(newAmount)
            const formattedPricePerContract = (Math.round(Number(pricePerContract) * 10000) / 10000).toString();
            const data = {
                txType: 'marketOrder',
                id: '',
                blockNumber: '',
                orderToName,
                positionHash,
                userAccount: account,
                status: 'confirming',
                pricePerContract: formattedPricePerContract,
            }
            pendingTxsDispatch({type: 'add', txHash: tx.hash, description, data})
            setActiveHash(tx.hash);
            console.log(pendingTxsState);
            try {
                const receipt = await tx.wait()
                const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
                toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed', data: {blockNumber: receipt.blockNumber, status: 'completed'}})
            } catch (e) {
                const toastDescription = ToastDescription(description, e.transactionHash, chainId);
                toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
            }
            console.log(pendingTxsState);

        } catch (e) {
            setApproving(false);
            handleErrorMessages({ err: e})
            console.error(e);
        }
    }

    function placeOrderConfirmation() {
        if(radioOrderType === 'Limit') {
            limitOrder();
        } else {
            marketOrderMany();
        }
        onCloseConfirmDialog();

    }
    // TODO: get the symbols dynamically
    const tooltipLabel = `You are about to ${radioOption === 'BUY' ? 'buy' : 'sell'} options that give ${radioOption === 'BUY' ? 'you' : 'someone'} the right to ${optionType === 'CALL' ? 'buy' : 'sell'} ${newAmount} sMATIC for ${formattedStrike} sUSD/sMATIC ${radioOption === 'SELL' ? `${optionType === 'CALL' ? 'from' : 'to'} you` : ''} until ${formattedExpiry}`;

    const orderbookSellRows: JSX.Element[] = [];
    const orderbookBuyRows: JSX.Element[] = [];
    orderBook.sellOrders
      .slice(0,6)
      .sort((a,b) => b.unitPrice - a.unitPrice)
      .forEach((sellOrder, index) => {
        if (index > 5) {
            return;
        }
        orderbookSellRows.push(<Tr key={index} letterSpacing={"wide"} fontWeight={"semibold"} color={orderBookColor}>
            <Td>{`$${sellOrder.unitPrice.toFixed(4)}`}</Td>
            <Td>{sellOrder.formattedSize}</Td>
        </Tr>)
    });
    orderBook.buyOrders
      .slice(0, 6)
      .sort((a,b) => b.unitPrice - a.unitPrice)
      .forEach((buyOrder, index) => {
          if (index > 5) {
              return;
          }
          orderbookBuyRows.push(
              <Tr key={index} letterSpacing={"wide"} fontWeight={"semibold"} color={orderBookColor}>
              <Td>{`$${buyOrder.unitPrice.toFixed(4)}`}</Td>
              <Td>{buyOrder.formattedSize}</Td>
          </Tr>)
      });

    const totPriceMarket = costForAmount(Number(newAmount) || 0, radioOption);
    const bigAmount = ethers.utils.parseUnits(newAmount || '0', 6);
    const pricePerContract = Number(newAmount) > 0 && totPriceMarket ? totPriceMarket.mul(1e6).div(bigAmount) : 0;
    const formattedPricePerContract = Number(ethers.utils.formatUnits(pricePerContract)).toFixed(4);
    const formattedTotPriceMarket = totPriceMarket && Number(ethers.utils.formatUnits(totPriceMarket)).toFixed(4);
    const collateralToUnlock = balances && Math.min(Number(newAmount), Number(ethers.utils.formatUnits(balances.optionPosition.abs(), 18)));
    const collateralPerContract = optionType === 'CALL' ?
      1 :
      Number(formattedStrike);
    const collateralRequirement = balances && balances.optionPosition.gt(0) ?
      Math.max(0, collateralPerContract * (Number(newAmount) - Number(ethers.utils.formatUnits(balances.optionPosition)))) :
      Number(newAmount)  * collateralPerContract;
    const quantityErrorColor = useColorModeValue("red.500", "red.300");
    const insufficientFunds = radioOption === 'BUY' && balances && totPriceMarket && balances.shrub.baseAsset.lt(totPriceMarket);
    const insufficientCollateral = radioOption === 'SELL' && balances && Number(ethers.utils.formatUnits(balances.shrub.quoteAsset)) < collateralRequirement;
    const insufficientDepth = orderBook.initialized === true && (radioOption === 'BUY' ? bigAmount.gt(orderBook.sellOrdersDepth) : bigAmount.gt(orderBook.buyOrdersDepth));

    return (
      <>
          {localError &&
          <>
              <SlideFade in={true} unmountOnExit={true}>
                  <Flex>
                      <Alert status="error" borderRadius={"2xl"} my={4}>
                            <AlertIcon/>
                            {!!web3Error ? getErrorMessage(web3Error).message : localError}
                        </Alert>
                    </Flex>
                </SlideFade>
            </>
            }
          <Tabs
              variant="unstyled"
          >

              <TabList color={"gray.500"} p={2}>
                  <Tab _focus={{boxShadow: "none"}} fontSize={"xs"} fontWeight={"bold"}
                       _selected={{ color: "sprout.500" }}>
                      Instant Buy</Tab>
                  <Tab _focus={{boxShadow: "none"}} fontSize={"xs"} fontWeight={"bold"}
                       _selected={{  color: "sprout.500" }}>
                      Name your Price</Tab>
              </TabList>
              <TabPanels>
                  <TabPanel>
                      <Flex direction={{ base: "column", md: "row" }}>
                              <Stack spacing="24px" w={"full"}>
                                  <Box >
                                      <Flex pb={8}>
                                          <Box fontSize={"md"} fontWeight="bold">
                                              {radioOption === 'BUY' ? 'Buy' : 'Sell'} sMATIC {optionType === 'CALL' ? 'Call' : 'Put'}
                                          </Box>
                                          <Spacer/>
                                          <Text  fontSize={"xs"} fontWeight={"bold"}
                                                 color={livePriceColor}>
                                              sMATIC: ${maticPrice ? maticPrice.toFixed(2) : "-"}
                                          </Text>
                                      </Flex>

                                      <Box fontSize={"xs"} fontWeight={"bold"}
                                      pb={10}>
                                          <Flex>
                                           <Box>
                                      <HStack pb={1}>
                                          <Text color="gray.500">Strike</Text>
                                          <Text>${formattedStrike}</Text>
                                      </HStack>
                                      <HStack>
                                          <Text color="gray.500">Expiry</Text>
                                          <Text>{formattedExpiry}, {formatTime(expiry)}</Text>
                                      </HStack>
                                           </Box>
                                              <Spacer/>
                                               {/*can only fill if short and buying or long (own it) and selling*/}
                                              {balances && !balances.optionPosition.eq(0) && <Box>
                                                  <Box cursor="pointer" borderWidth="1px" borderColor={balances.optionPosition.gt(0) ? 'sprout.400' : 'orange.200'} sx={{userSelect : 'none'}}
                                                       p={1} borderRadius={"md"} onClick={() => setNewAmount((ethers.utils.formatUnits(balances.optionPosition.abs(), 18)))}>
                                                      You {balances.optionPosition.gt(0) ? 'own' : 'are short'} <strong>{ethers.utils.formatUnits(balances.optionPosition.abs(), 18)} contracts</strong>
                                                  </Box>
                                              </Box>}
                                          </Flex>
                                      </Box>
                                      <NumberInput id="amount"
                                                   placeholder="0.0"
                                                   value={newAmount}
                                                   min={0.0}
                                                 max={radioOption === 'BUY' ? Number(ethers.utils.formatUnits(orderBook.sellOrdersDepth, 6)) : Number(ethers.utils.formatUnits(orderBook.buyOrdersDepth, 6))}
                                                 precision={6}
                                                 onChange={(valueString) => {
                                                     if(valueString === '.') {
                                                         setNewAmount('0.')
                                                         return;
                                                     }
                                                     if (isNaN(Number(valueString))) {
                                                         return;
                                                     }
                                                     if (Number(valueString) !== Math.round(Number(valueString) * 1e6) / 1e6) {
                                                         setNewAmount(Number(valueString).toFixed(6))
                                                         return;
                                                     }
                                                     setNewAmount(valueString);
                                                 }}

                                      >
                                          <NumberInputField
                                            h="6rem"
                                            borderRadius="3xl"
                                            shadow="sm"
                                            fontWeight="bold"
                                            fontSize="2xl"
                                        />

                                          <InputRightElement
                                            pointerEvents="none"
                                            p={14}
                                            children={
                                                <FormLabel htmlFor="amount" color="gray.500" fontWeight="bold">Quantity
                                            </FormLabel>}
                                          />
                                      </NumberInput>
                                      {insufficientFunds &&
                                      <Text fontWeight="bold" fontSize="xs" color={quantityErrorColor} pl="4" pt="2"><WarningTwoIcon pr="1" boxSize="3.5"/>Insufficient funds</Text>}
                                      {insufficientCollateral &&
                                      <Text fontWeight="bold" fontSize="xs" color={quantityErrorColor} pl="4" pt="2"><WarningTwoIcon pr="1" boxSize="3.5"/>Insufficient Collateral</Text>}
                                      {insufficientDepth &&
                                      <Text fontWeight="bold" fontSize="xs" color={quantityErrorColor} pl="4" pt="2"><WarningTwoIcon pr="1" boxSize="3.5"/>
                                          {/*Not enough order book depth (Max: {radioOption === 'BUY' ? ethers.utils.formatUnits(orderBook.sellOrdersDepth, 6) : ethers.utils.formatUnits(orderBook.buyOrdersDepth, 6)})*/}
                                          Not enough open orders for the amount you are trying to buy
                                          (Max: {radioOption === 'BUY' ? ethers.utils.formatUnits(orderBook.sellOrdersDepth, 6) : ethers.utils.formatUnits(orderBook.buyOrdersDepth, 6)})
                                      </Text>}
                                  </Box>

                                  <Box fontSize="sm" pt={6}>
                                      <HStack spacing={8} fontSize={"sm"}>
                                      <VStack spacing={1.5} alignItems={"flex-start"}>
                                          <Text>Price per contract</Text>
                                          <Text>{radioOption === 'BUY' ? 'Total Price' : 'Total Proceeds' }</Text>
                                          {radioOption === 'BUY' && balances && balances.optionPosition.lt(0)  && <Text>Collateral to unlock</Text>}
                                          {radioOption === 'SELL' && <Text>Collateral Requirement</Text>}
                                          <Text>Available</Text>
                                      </VStack>
                                      <VStack spacing={1.5} alignItems={"flex-start"} fontWeight={"600"}>
                                          <Text>
                                              ${formattedPricePerContract}
                                          </Text>
                                          <Text color={insufficientFunds ? quantityErrorColor : 'null'}>
                                              ${formattedTotPriceMarket}
                                          </Text>
                                          {radioOption === 'BUY' && balances && balances.optionPosition.lt(0)  &&
                                          <Text color="gray.500">
                                              {optionType === 'CALL' ? `${collateralToUnlock} sMATIC` : `$${collateralToUnlock}`}
                                          </Text> }
                                          {radioOption === 'SELL' && (optionType === 'CALL' ?
                                            <Text color={insufficientCollateral ? quantityErrorColor : 'null'}>
                                              {collateralRequirement.toFixed(4)} sMATIC
                                          </Text> :
                                            <Text color={insufficientCollateral ? quantityErrorColor : 'null'}>
                                              ${collateralRequirement.toFixed(4)}
                                          </Text>) }
                                          {radioOption === 'SELL' && optionType === 'CALL'?
                                            <Text color="gray.500">
                                                {balances && Number(ethers.utils.formatUnits(balances.shrub.quoteAsset, 18)).toFixed(4)} sMATIC
                                          </Text> :
                                          <Text color="gray.500">
                                              ${balances && Number(ethers.utils.formatUnits(balances.shrub.baseAsset, 18)).toFixed(4)}
                                          </Text>}
                                      </VStack>
                                      </HStack>
                                  </Box>
                                  <Box>
                                      <Flex justifyContent="flex-end">
                                          <Button
                                              colorScheme={useColorModeValue("sprout", "teal")}
                                              type="submit"
                                              onClick={onOpenConfirmDialog}
                                              disabled={
                                                  Number(newAmount)<=0 ||
                                                  isNaN(Number(newAmount)) ||
                                                  (radioOrderType === 'Market' && (
                                                      Boolean(radioOption === 'BUY' ? !orderBook.sellOrders[0] : !orderBook.buyOrders[0])
                                                  ))}>
                                              {/*Review {radioOption === 'BUY' ? 'Buy' : 'Sell'} Order*/}
                                              Review Order
                                              {/*Review*/}
                                          </Button>
                                      </Flex>
                                  </Box>
                              </Stack>
                      </Flex>
                  </TabPanel>
                  <TabPanel>
                      <Flex direction={{ base: "column", md: "row" }}>
                          <Stack spacing="24px" w={"full"}>
                              <Box >
                                  <Flex pb={8}>
                                      <Box fontSize={"md"} fontWeight="bold">
                                          {radioOption === 'BUY' ? 'Buy' : 'Sell'} sMATIC {optionType === 'CALL' ? 'Call' : 'Put'}
                                      </Box>
                                      <Spacer/>
                                      <Text  fontSize={"xs"} fontWeight={"bold"}
                                             color={livePriceColor}>
                                          sMATIC: ${maticPrice ? maticPrice.toFixed(2) : "-"}
                                      </Text>
                                  </Flex>

                                  <Box fontSize={"xs"} fontWeight={"bold"}
                                       pb={10}>
                                      <Flex>
                                          <Box>
                                              <HStack pb={1}>
                                                  <Text color="gray.500">Strike</Text>
                                                  <Text>${formattedStrike}</Text>
                                              </HStack>
                                              <HStack>
                                                  <Text color="gray.500">Expiry</Text>
                                                  <Text>{formattedExpiry}, {formatTime(expiry)}</Text>
                                              </HStack>
                                          </Box>
                                          <Spacer/>
                                          {/*can only fill if short and buying or long (own it) and selling*/}
                                          {balances && !balances.optionPosition.eq(0) && <Box>
                                              <Box cursor="pointer" borderWidth="1px" borderColor={balances.optionPosition.gt(0) ? 'sprout.400' : 'orange.200'} sx={{userSelect : 'none'}}
                                                   p={1} borderRadius={"md"} onClick={() => setNewAmount((ethers.utils.formatUnits(balances.optionPosition.abs(), 18)))}>
                                                  You {balances.optionPosition.gt(0) ? 'own' : 'are short'} <strong>{ethers.utils.formatUnits(balances.optionPosition.abs(), 18)} contracts</strong>
                                              </Box>
                                          </Box>}
                                      </Flex>
                                  </Box>
                                  {/*Quantity*/}
                                  <NumberInput id="amount" placeholder="0.0" value={newAmount} min={0.0} precision={6}
                                               max={radioOption === 'BUY' ? Number(ethers.utils.formatUnits(orderBook.sellOrdersDepth, 6)) : Number(ethers.utils.formatUnits(orderBook.buyOrdersDepth, 6))}
                                               onChange={(valueString) => {
                                                   if(valueString === '.') {
                                                       setNewAmount('0.')
                                                       return;
                                                   }
                                                   if (isNaN(Number(valueString))) {
                                                       return;
                                                   }
                                                   if (Number(valueString) !== Math.round(Number(valueString) * 1e6) / 1e6) {
                                                       setNewAmount(Number(valueString).toFixed(6))
                                                       return;
                                                   }
                                                   setNewAmount(valueString);
                                               }}
                                  >
                                      <NumberInputField h="6rem" borderRadius="3xl" shadow="sm" fontWeight="bold" fontSize="2xl"/>
                                      <InputRightElement pointerEvents="none" p={14} children={<FormLabel htmlFor="amount" color="gray.500" fontWeight="bold">Quantity</FormLabel>}/>
                                  </NumberInput>
                                  {insufficientFunds &&
                                  <Text fontWeight="bold" fontSize="xs" color={quantityErrorColor} pl="4" pt="2"><WarningTwoIcon pr="1" boxSize="3.5"/>Insufficient funds</Text>}
                                  {insufficientCollateral &&
                                  <Text fontWeight="bold" fontSize="xs" color={quantityErrorColor} pl="4" pt="2"><WarningTwoIcon pr="1" boxSize="3.5"/>Insufficient Collateral</Text>}
                                  {insufficientDepth &&
                                  <Text fontWeight="bold" fontSize="xs" color={quantityErrorColor} pl="4" pt="2"><WarningTwoIcon pr="1" boxSize="3.5"/>Not enough order book depth (Max: {radioOption === 'BUY' ? ethers.utils.formatUnits(orderBook.sellOrdersDepth, 6) : ethers.utils.formatUnits(orderBook.buyOrdersDepth, 6)})</Text>}

                                  {/*Price per contract*/}
                                  <NumberInput id="limitPrice" placeholder="0.0" value={price || 0} min={0.0} precision={6} mt={4}
                                               isInvalid={(Number(price)<=0 || price === '' || isNaN(Number(price)))}
                                               max={radioOption === 'BUY' ? Number(ethers.utils.formatUnits(orderBook.sellOrdersDepth, 6)) : Number(ethers.utils.formatUnits(orderBook.buyOrdersDepth, 6))}
                                               onChange={(valueString) => {
                                                   if(valueString === '.') {
                                                       setPrice('0.')
                                                       return;
                                                   }
                                                   if (isNaN(Number(valueString))) {
                                                       return;
                                                   }
                                                   setPrice(valueString);
                                               }}
                                  >
                                      <NumberInputField h="6rem" borderRadius="3xl" shadow="sm" fontWeight="bold" fontSize="2xl"/>
                                      <InputRightElement pointerEvents="none" p={14} children={<FormLabel htmlFor="amount" color="gray.500" fontWeight="bold">Your Price</FormLabel>}/>
                                  </NumberInput>
                              </Box>

                              <Box fontSize="sm" pt={6}>
                                  <HStack spacing={8} fontSize={"sm"}>
                                      <VStack spacing={1.5} alignItems={"flex-start"}>
                                          <Text>Price per contract</Text>
                                          <Text>{radioOption === 'BUY' ? 'Total Price' : 'Total Proceeds' }</Text>
                                          {radioOption === 'BUY' && balances && balances.optionPosition.lt(0)  && <Text>Collateral to unlock</Text>}
                                          {radioOption === 'SELL' && <Text>Collateral Requirement</Text>}
                                          <Text>Available</Text>
                                      </VStack>
                                      <VStack spacing={1.5} alignItems={"flex-start"} fontWeight={"600"}>
                                          <Text>
                                              ${price}
                                          </Text>
                                          <Text color={insufficientFunds ? quantityErrorColor : 'null'}>
                                              ${formattedTotPriceMarket}
                                          </Text>
                                          {radioOption === 'BUY' && balances && balances.optionPosition.lt(0)  &&
                                          <Text color="gray.500">
                                              {optionType === 'CALL' ? `${collateralToUnlock} sMATIC` : `$${collateralToUnlock}`}
                                          </Text> }
                                          {radioOption === 'SELL' && (optionType === 'CALL' ?
                                            <Text color={insufficientCollateral ? quantityErrorColor : 'null'}>
                                                {collateralRequirement.toFixed(4)} sMATIC
                                            </Text> :
                                            <Text color={insufficientCollateral ? quantityErrorColor : 'null'}>
                                                ${collateralRequirement.toFixed(4)}
                                            </Text>) }
                                          {radioOption === 'SELL' && optionType === 'CALL'?
                                            <Text color="gray.500">
                                                {balances && Number(ethers.utils.formatUnits(balances.shrub.quoteAsset, 18)).toFixed(4)} sMATIC
                                            </Text> :
                                            <Text color="gray.500">
                                                ${balances && Number(ethers.utils.formatUnits(balances.shrub.baseAsset, 18)).toFixed(4)}
                                            </Text>}
                                      </VStack>
                                  </HStack>
                              </Box>
                              <Box>
                                  <Flex justifyContent="flex-end">
                                      <Button
                                        colorScheme={useColorModeValue("sprout", "teal")}
                                        type="submit"
                                        onClick={onOpenConfirmDialog}
                                        disabled={
                                            Number(newAmount)<=0 ||
                                            isNaN(Number(newAmount)) ||
                                            (radioOrderType === 'Market' && (
                                              Boolean(radioOption === 'BUY' ? !orderBook.sellOrders[0] : !orderBook.buyOrders[0])
                                            ))}>
                                          {/*Review {radioOption === 'BUY' ? 'Buy' : 'Sell'} Order*/}
                                          Review Order
                                          {/*Review*/}
                                      </Button>
                                  </Flex>
                              </Box>
                          </Stack>
                      </Flex>
                  </TabPanel>
              </TabPanels>
          </Tabs>
          {/*order confirmation modal*/}
          <AlertDialog
              motionPreset="slideInBottom"
              // @ts-ignore
              leastDestructiveRef={cancelRef}
              onClose={onCloseConfirmDialog}
              isOpen={isOpenConfirmDialog}
              isCentered>
              <AlertDialogOverlay />
              <AlertDialogContent>
                  <AlertDialogHeader>Order Confirmation</AlertDialogHeader>
                  <AlertDialogCloseButton />
                  <Divider/>
                  <AlertDialogBody>
                      <Text>You are about to <strong>{radioOption === 'BUY' ? 'buy' : 'sell'}</strong> options that give {radioOption === 'BUY' ? 'you' : 'someone'} the <strong>right to {optionType === 'CALL' ? 'buy' : 'sell'} {newAmount} sMATIC for {formattedStrike} sUSD/sMATIC</strong> {radioOption === 'SELL' ? optionType === 'CALL' ? 'from you' : 'to you': ''} until <strong>{formattedExpiry}, {formatTime(expiry)}</strong>. Place order?</Text>
                  </AlertDialogBody>
                  <AlertDialogFooter>
                      <Button
                          // @ts-ignore
                          ref={cancelRef} onClick={onCloseConfirmDialog}>
                          No
                      </Button>
                      <Button colorScheme="teal" ml={3} onClick={placeOrderConfirmation}>
                          Yes
                      </Button>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </>
    )
}

export default OptionDetails;
