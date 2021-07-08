import {
    Box,
    Button,
    Divider,
    Flex,
    FormLabel,
    HStack,
    Input,
    Stack,
    Tag,
    TagLabel,
    Tooltip,
    useRadioGroup
} from "@chakra-ui/react";
import {Icon} from "@chakra-ui/icons";
import {AiOutlinePhone, BiPhone, CgDollar, GiMoneyStack, MdDateRange, RiHandCoinLine} from "react-icons/all";
import RadioCard from "./Radio";
import React, {useState} from "react";
import {AppCommon, OrderType, PutCall, SellBuy, UnsignedOrder} from "../types";
import {
    getAddressFromSignedOrder,
    getUserNonce,
    iOrderToPostOrder,
    optionTypeToNumber,
    signOrder,
    toEthDate
} from "../utils/ethMethods";
import {ethers} from "ethers";
import {postOrder} from "../utils/requests";
import {useWeb3React} from "@web3-react/core";

function OptionDetails({ appCommon, sellBuy }: { appCommon: AppCommon, sellBuy: SellBuy}) {
    const { active, library, account } = useWeb3React();
    const { formattedStrike, formattedExpiry, baseAsset, quoteAsset, expiry, optionType, strike } = appCommon
    // Hooks
    const [submitting, setSubmitting] = React.useState(false);
    const [amount, setAmount] = React.useState(1);
    const [price, setPrice] = React.useState('');
    // Radio logic
    const radioOptions = ['BUY', 'SELL']
    const radioOrderTypes = ['Market', 'Limit']
    const [radioOption, setRadioOption] = useState<SellBuy>(sellBuy);
    const [radioOrderType, setRadioOrderType] = useState<OrderType>('Market');
    const {
        getRootProps: getOptionRootProps,
        getRadioProps: getOptionRadioProps,
    } = useRadioGroup({
        name: "option",
        defaultValue: sellBuy,
        onChange: (nextValue: SellBuy) => setRadioOption(nextValue),
    });

    const {
        getRootProps: getOrderTypeRootProps,
        getRadioProps: getOrderTypeRadioProps,
    } = useRadioGroup({
        name: "orderType",
        defaultValue: 'Market',
        onChange: (nextValue: OrderType) => setRadioOrderType(nextValue),
    });

    const groupOption = getOptionRootProps();
    const groupOptionType = getOrderTypeRootProps();


    async function placeOrder() {
        setSubmitting(true);
        if (!active || !account) {
            console.error('Please connect your wallet');
            setSubmitting(false);
            return;
        }
        if (!price) {
            throw new Error('price is required');
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
            isBuy: radioOption === 'BUY',
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
        try {
            // const wholeUnitOrder = orderWholeUnitsToBaseUnits(unsignedOrder);
            const signedOrder = await signOrder(unsignedOrder, library);
            const verifiedAddress = await getAddressFromSignedOrder(signedOrder, library);
            console.log(`verifiedAddress: ${verifiedAddress}`);
            const pOrder = iOrderToPostOrder(signedOrder);
            // TODO: handle success/failure responses
            const res = await postOrder(pOrder);
            setSubmitting(false);
        } catch (e) {
            console.error(e);
        }
    }

    // TODO: get the symbols dynamically
    const tooltipLabel = `This option gives the right to ${optionType === 'CALL' ? 'buy' : 'sell'} ETH for ${formattedStrike} FK up until ${formattedExpiry}`;

    return (
        <Stack spacing="24px">
            <Box mt={2} mb={8}>
                <HStack spacing={3}>
                    <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800">
                        <Tag colorScheme="purple">
                            <Icon as={optionType === 'CALL' ? BiPhone : RiHandCoinLine} />
                            <TagLabel>{optionType}</TagLabel>
                        </Tag>
                    </Tooltip>
                    <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800">
                        <Tag colorScheme="blue">
                            <Icon as={MdDateRange} />
                            <TagLabel> {formattedExpiry}</TagLabel>
                        </Tag>
                    </Tooltip>
                    <Tooltip label={tooltipLabel} bg="gray.300" color="gray.800">
                        <Tag colorScheme="yellow">
                            <Icon as={GiMoneyStack} />
                            <TagLabel>{`${formattedStrike} USDC`}</TagLabel>
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
                <FormLabel htmlFor="amount">Amount:</FormLabel>
                <Input
                    id="amount"
                    placeholder="0"
                    value={amount}
                    onChange={(event: any) => setAmount(event.target.value)}
                />
            </Box>
            <Box>
                <FormLabel htmlFor="bid">Price per contract:</FormLabel>
                <Input
                    id="bid"
                    placeholder="The USDC required to purchase 1 contract (1 ETH)"
                    value={price}
                    onChange={(event: any) => setPrice(event.target.value)}
                />
            </Box>

            <Box>
                <Flex justifyContent="flex-end">
                    <Button
                        colorScheme="teal"
                        type="submit"
                        onClick={placeOrder}
                        isLoading={submitting}
                        loadingText="Placing Order"
                    >
                        Place Order
                    </Button>
                </Flex>
            </Box>
        </Stack>

    )
}


export default OptionDetails;
