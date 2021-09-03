import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Divider,
    Flex,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SlideFade,
    Stack,
    Table,
    Tag,
    TagLabel, Tbody, Td, Text, Tfoot, Th, Thead,
    Tooltip,
    Tr,
    useColorModeValue, useDisclosure,
    useRadioGroup,
    useToast
} from '@chakra-ui/react';
import {Icon, QuestionOutlineIcon} from '@chakra-ui/icons';
import {BiPhone, GiMoneyStack, MdDateRange, RiHandCoinLine} from "react-icons/all";
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
    validateOrderAddress, formatDate, getSymbolFor, announceOrder
} from "../utils/ethMethods";
import {ethers} from "ethers";
import {useWeb3React} from "@web3-react/core";
import React, {useContext, useEffect, useState} from "react";
import {
    AppCommon,
    IOrder, OptionData,
    OrderBook,
    OrderType,
    SellBuy,
    UnsignedOrder
} from "../types";
import {TxContext} from "./Store";
import {ToastDescription} from "./TxMonitoring";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import {ConnectWalletModal, getErrorMessage} from './ConnectWallet';
import {currencySymbol} from "../utils/chainMethods";

const { Zero } = ethers.constants;

function OptionDetails({ appCommon, sellBuy, hooks, optionData }: {
    appCommon: AppCommon,
    sellBuy: SellBuy,
    hooks: {approving: any, setApproving: any, activeHash: any, setActiveHash: any},
    optionData: OptionData
}) {

    const [localError, setLocalError] = useState('');
    const {
        isOpen: isOpenConnectModal,
        onClose: onCloseConnectModal
    } = useDisclosure();

    const { approving, setApproving, setActiveHash } = hooks;
    const {active, library, account, error: web3Error, chainId} = useWeb3React();
    const amountToolTip = `The amount of asset to purchase option for (minimum: 0.000001 ${currencySymbol(chainId)})`
    const priceToolTip = `The ${'FK'} required to purchase 1 xxx contract (1 ${currencySymbol(chainId)}) `
    const alertColor = useColorModeValue("gray.100", "shrub.300")
    const { pendingTxs } = useContext(TxContext);
    const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
    const {formattedStrike, formattedExpiry, baseAsset, quoteAsset, expiry, optionType, strike} = appCommon
    // Hooks
    const [amount, setAmount] = React.useState(1);
    const [price, setPrice] = React.useState('');
    const [orderBook, setOrderBook] = useState<OrderBook>({buyOrders: [], sellOrders: []})
    // Radio logic
    const radioOptions = ['BUY', 'SELL']
    const radioOrderTypes = ['Market', 'Limit']
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

    useEffect(() => {
        const buyOrders = optionData.buyOrders.sort((a, b) => b.unitPrice - a.unitPrice);
        const sellOrders = optionData.sellOrders.sort((a, b) => a.unitPrice - b.unitPrice);
        setOrderBook({ sellOrders, buyOrders })
    }, [optionData.buyOrders, optionData.sellOrders])

const {
        getRootProps: getOrderTypeRootProps,
        getRadioProps: getOrderTypeRadioProps,
    } = useRadioGroup({
        name: "orderType",
        defaultValue: 'Market',
        onChange: (nextValue: OrderType) => {
            radioOption === 'BUY' ? setPrice(orderBook.sellOrders[0]?.unitPrice.toFixed(2) ): setPrice(orderBook.buyOrders[0]?.unitPrice.toFixed(2))
            setRadioOrderType(nextValue)

        },
    });

    const groupOption = getOptionRootProps();
    const groupOptionType = getOrderTypeRootProps();

   const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
   

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
        const oneWeekFromNow = new Date(now);
        oneWeekFromNow.setUTCDate(oneWeekFromNow.getUTCDate() + 7);
        const nonce =
            (await getUserNonce({
                address: account,
                quoteAsset,
                baseAsset,
            }, library)) + 1;
        const unsignedOrder: UnsignedOrder = {
            size: ethers.utils.parseUnits(amount.toString(), 18),
            isBuy: optionActionToIsBuy(radioOption),
            optionType: optionTypeToNumber(optionType),
            baseAsset,
            quoteAsset,
            expiry: toEthDate(expiry),
            strike,
            price: ethers.utils.parseUnits((Number(price) * amount).toString(), 18),
            fee: ethers.utils.parseUnits('0', 18),
            offerExpire: toEthDate(oneWeekFromNow),
            nonce,
        };
            const signedOrder = await signOrder(unsignedOrder, library);
            const verifiedAddress = await getAddressFromSignedOrder(signedOrder, library);
            console.log(`verifiedAddress: ${verifiedAddress}`);
            const tx = await announceOrder(signedOrder, library);
            console.log(tx);
            const quoteSymbol = await getSymbolFor(quoteAsset, library);
            const description = `Submitted limit order to ${radioOption.toLowerCase()} ${amount} ${formatDate(expiry)} $${formattedStrike} ${quoteSymbol} ${optionType.toLowerCase()} options for $${price}`;
            pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
            setActiveHash(tx.hash);
            console.log(pendingTxsState);
            try {
                const receipt = await tx.wait()
                const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
                toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
            } catch (e) {
                const toastDescription = ToastDescription(description, e.transactionHash, chainId);
                toast({title: 'Transaction Failed', description: toastDescription, status: 'error', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: e.transactionHash || e.hash, status: 'failed'})
            }
            console.log(pendingTxsState);
            setApproving(false);
        } catch (e) {
            handleErrorMessages({err:e});
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
            const depth = localOrderBook.reduce((tot, order) => tot.add(order.size), Zero)
            const bigSize = ethers.utils.parseUnits(amount.toString(), 18);
            if (bigSize.gt(depth)) {
                throw new Error('Order size exceeds available depth in orderbook');
            }
            let remainingSize = ethers.BigNumber.from(bigSize);
            const now = new Date();
            const oneWeekFromNow = new Date(now);
            oneWeekFromNow.setUTCDate(oneWeekFromNow.getUTCDate() + 7);
            const nonce =
              (await getUserNonce({
                  address: account,
                  quoteAsset,
                  baseAsset,
              }, library)) + 1;

            // Create as many unsigned orders as needed to get the total amount up to the requested amount
            const counterPartyOrders: IOrder[] = [];

            let index = 0;
            let accumulatedPrice = Zero;
            while (remainingSize.gt(Zero)) {
                const order = localOrderBook[index];
                if (!order) {
                    throw new Error('Insufficient market depth for this order');
                }
                const { address: counterpartyAddress, nonce: orderNonce, size } = order;
                if (!counterpartyAddress) {
                    console.error('no counterparty address on order');
                    index++;
                    continue;
                }
                const counterPartyOrder = transformOrderAppChain(order);
                const doesAddressMatch: boolean = await validateOrderAddress(counterPartyOrder, library);
                console.log(doesAddressMatch);
                const counterpartyNonce = await getUserNonce({ address: counterpartyAddress, quoteAsset, baseAsset, }, library) + 1;
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
                            throw new Error("Not enough collateral of quoteAsset");
                        }
                    } else {
                        // required collateral is strike * size of the baseAsset
                        const balance = await getAvailableBalance({
                            address: counterpartyAddress,
                            tokenContractAddress: baseAsset,
                            provider: library
                        });
                        console.log(balance.toString());
                        if (balance.lt(price)) {
                            throw new Error("Not enough collateral of baseAsset");
                        }
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
                console.log('remaining size');
                console.log(ethers.utils.formatUnits(remainingSize));
                index++;
            }

            const unsignedOrder: UnsignedOrder = {
                size: bigSize,
                isBuy: optionActionToIsBuy(radioOption),
                optionType: optionTypeToNumber(optionType),
                baseAsset,
                quoteAsset,
                expiry: toEthDate(expiry),
                strike,
                // TODO: update contract so that the commented out price logic works (with partial orders)
                // price: size.lt(remainingSize) ? orderPrice : ethers.utils.parseUnits((orderUnitPrice * Number(ethers.utils.formatUnits(remainingSize, 18))).toString()),
                price: accumulatedPrice,
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
            const description = `${radioOption === 'BUY' ? 'Buy' : 'Sell'} ${amount} ${formatDate(expiry)} $${formattedStrike} ${quoteSymbol} ${optionType.toLowerCase()} options for $${ethers.utils.formatUnits(accumulatedPrice, 18)}`;
            pendingTxsDispatch({type: 'add', txHash: tx.hash, description})
            setActiveHash(tx.hash);
            console.log(pendingTxsState);
            try {
                const receipt = await tx.wait()
                const toastDescription = ToastDescription(description, receipt.transactionHash, chainId);
                toast({title: 'Transaction Confirmed', description: toastDescription, status: 'success', isClosable: true, variant: 'solid', position: 'top-right'})
                pendingTxsDispatch({type: 'update', txHash: receipt.transactionHash, status: 'confirmed'})
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
    // TODO: get the symbols dynamically
    const tooltipLabel = `This option gives the right to ${optionType === 'CALL' ? 'buy' : 'sell'} ${currencySymbol(chainId)} for ${formattedStrike} FK up until ${formattedExpiry}`;

    const orderbookSellRows: JSX.Element[] = [];
    const orderbookBuyRows: JSX.Element[] = [];
    orderBook.sellOrders
      .slice(0,6)
      .sort((a,b) => b.unitPrice - a.unitPrice)
      .forEach((sellOrder, index) => {
        if (index > 5) {
            return;
        }
        orderbookSellRows.push(<Tr key={index}>
            <Td>{`$${sellOrder.unitPrice.toFixed(4)}`}</Td>
            <Td isNumeric={true}>{sellOrder.formattedSize}</Td>
        </Tr>)
    });
    orderBook.buyOrders
      .slice(0, 6)
      .sort((a,b) => b.unitPrice - a.unitPrice)
      .forEach((buyOrder, index) => {
          if (index > 5) {
              return;
          }
          orderbookBuyRows.push(<Tr key={index}>
              <Td>{`$${buyOrder.unitPrice.toFixed(4)}`}</Td>
              <Td>{buyOrder.formattedSize}</Td>
          </Tr>)
      });

    function changePrice(value: string) {
        setPrice(value)
    }

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

            <Flex>
                <Box id={"order form"}>
                    <Stack spacing="24px">
                        <Box mt={2} mb={8}>
                            <HStack spacing={3}>
                                <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800" borderRadius="lg">
                                    <Tag colorScheme="purple">
                                        <Icon as={optionType === 'CALL' ? BiPhone : RiHandCoinLine} />
                                        <TagLabel>{optionType}</TagLabel>
                                    </Tag>
                                </Tooltip>
                                <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800" borderRadius="lg">
                                    <Tag colorScheme="blue">
                                        <Icon as={MdDateRange} />
                                        <TagLabel> {formattedExpiry}</TagLabel>
                                    </Tag>
                                </Tooltip>
                                <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800" borderRadius="lg">
                                    <Tag colorScheme="yellow">
                                        <Icon as={GiMoneyStack} />
                                        <TagLabel>{`${formattedStrike} FK`}</TagLabel>
                                    </Tag>
                                </Tooltip>
                            </HStack>
                        </Box>
                        <Box>
                            <HStack {...groupOptionType}>
                                <FormLabel htmlFor="orderType">Order:</FormLabel>
                                {radioOrderTypes.map((value) => {
                                    const radio = getOrderTypeRadioProps({ value });
                                    return (
                                      <RadioCard key={value} {...radio}>
                                          {value}
                                      </RadioCard>
                                    );
                                })}
                            </HStack>
                        </Box>
                        <Box>
                            <HStack>
                                <Divider orientation="horizontal" mb={3} mt={3} />
                            </HStack>
                        </Box>
                        <Box>
                            <HStack {...groupOption}>
                                <FormLabel htmlFor="option">Option:</FormLabel>
                                {radioOptions.map((value) => {
                                    const radio = getOptionRadioProps({ value });
                                    return (
                                      <RadioCard key={value} {...radio}>
                                          {value}
                                      </RadioCard>
                                    );
                                })}
                            </HStack>
                        </Box>
                        <Box>
                            <FormLabel htmlFor="amount">Amount:
                                <Tooltip p={3} label={amountToolTip} fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">
                                    <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>
                                </Tooltip>
                            </FormLabel>
                            <Input
                                id="amount"
                                placeholder="0.1"
                                value={amount}
                                isInvalid={amount<=0 ||isNaN(Number(amount)) }
                                onChange={(event: any) => setAmount(event.target.value)}
                            />
                        </Box>
                        <Box>
                            <FormLabel htmlFor="bid">Price per contract:
                                  <Tooltip p={3} label={priceToolTip} fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">
                                  <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>
                                </Tooltip>
                            </FormLabel>
                            <Input
                              id="bid"
                              placeholder="0"
                              value={radioOrderType === 'Market' ? (radioOption === 'BUY' ? orderBook.sellOrders[0]?.unitPrice.toFixed(2) : orderBook.buyOrders[0]?.unitPrice.toFixed(2)) : price}
                              isDisabled={radioOrderType === 'Market'}
                              onChange={(event: any) => changePrice(event.target.value)}
                              isInvalid={radioOrderType === 'Limit' && (Number(price)<=0 || price === '' || isNaN(Number(price)))}
                            />
                        </Box>
                        <Alert status="info" borderRadius={"2xl"} bgColor={alertColor}>
                            <AlertIcon />
                            {tooltipLabel}
                        </Alert>
                        <Box>
                            <Flex justifyContent="flex-end">
                                <Button
                                  colorScheme="teal"
                                  type="submit"
                                  onClick={radioOrderType === 'Limit' ? limitOrder : marketOrderMany}
                                  disabled={
                                      amount<=0 ||
                                      (price) === '' ||
                                      isNaN(Number(amount)) ||
                                      (radioOrderType === 'Limit' && (
                                          Number(price)<=0 ||
                                          isNaN(Number(price))
                                      ))
                                  }


                                >
                                    Place Order
                                </Button>
                            </Flex>
                        </Box>
                    </Stack>

                </Box>

                <Box id={"orderbook"} ml={4}>
                    <Table variant={'unstyled'} size={'sm'}>
                        <Thead>
                            <Tr>
                                <Th>Price</Th>
                                <Th>Amount</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {orderbookSellRows}
                        </Tbody>
                    </Table>
                    <Divider/>
                    <Table variant={'unstyled'} size={'sm'}>
                        <Tbody>
                            {orderbookBuyRows}
                        </Tbody>
                        <Tfoot>
                            <Th>Price</Th>
                            <Th>Amount</Th>
                        </Tfoot>
                    </Table>
                </Box>
            </Flex>
        </>
    )
}

export default OptionDetails;
