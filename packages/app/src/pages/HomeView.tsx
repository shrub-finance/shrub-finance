import {
    Badge,
    Box,
    Heading,
    Text,
    Button,
    Center,
    useColorModeValue,
    Container,
    Flex,
    Spacer,
    Link,
    useRadioGroup,
    HStack,
    Stack,
    Tooltip,
    Tag,
    TagLabel,
    FormLabel,
    Divider,
    Input,
    Alert,
    AlertIcon,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Tfoot,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalBody, Modal, useDisclosure
} from '@chakra-ui/react';
import {ArrowForwardIcon, Icon, QuestionOutlineIcon,} from '@chakra-ui/icons';
import {Link as ReachLink, RouteComponentProps} from '@reach/router';
import {PolygonIcon, ShrubLogo, UniIcon} from '../assets/Icons';
import {FaEthereum} from 'react-icons/fa';
import React, {useState} from "react";
import ScatterChart from "../components/Scatter";
import RadioCard from "../components/Radio";
import {SellBuy} from "../types";
import OptionDetails from "../components/OptionDetails";
import {BiPhone, GiMoneyStack, MdDateRange, RiHandCoinLine} from "react-icons/all";
import {currencySymbol} from "../utils/chainMethods";
import {Txmonitor} from "../components/TxMonitoring";


function HomeView(props: RouteComponentProps) {
    const { isOpen, onOpen, onClose} = useDisclosure();

    const [choice, setChoice] = useState("I want upside protection");
    const choices = ["I want downside protection", "I want upside protection"]


    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "choice",
        defaultValue: "",
        // @ts-ignore
        onChange: (nextValue: choice) => setChoice(nextValue),
    })

    const group = getRootProps()
    const property = {
        imageUrl: '../assets/uni.svg',
        imageAlt: "Uniswap insurance",
    }

    return (
        <>
            <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center mt={20}>
                    <Box maxW="60rem" mb={12} textAlign={'center'}>
                        <Heading fontSize="60px" letterSpacing={"tight"} mb={4}>
                            Familiar with Options?
                        </Heading>
                        <Text fontSize="25px">
                            Sweet. Buy or sell options of your choosing, at your price!
                        </Text>
                        <Button
                            rightIcon={<ArrowForwardIcon/>}
                            size="lg"
                            px="50"
                            fontSize="25px"
                            py={10}
                            variant="solid"
                            mt="50px"
                            borderRadius="full"
                            bgGradient="linear(to-r,#74cecc,green.300,blue.400)"
                            _hover={{bgGradient:"linear(to-r,#74cecc,blue.400,#6666d2)"}}
                            as={ReachLink} to={'/options'}
                        >
                            Start Trading
                        </Button>
                    </Box>
                </Center>
            </Container>

            <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center mt={20}>
                    <Box maxW="60rem" mb={12} textAlign={'center'}>
                        <Heading fontSize="60px" letterSpacing={"tight"} mb={4}>
                            Not sure what to buy?
                        </Heading>
                        <Text fontSize="25px">
                            Here is a suggestion
                        </Text>
                    </Box>
                </Center>

                    <Box
                        mb={{ base: "10", md: "0", lg:"0" }}
                        mr={5}
                        shadow={useColorModeValue("2xl", "2xl")}
                        borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
                        <Center mt={4}>
                            <UniIcon fontSize={180} fill="currentColor"/>
                        </Center>

                        <Box p="6">
                            <Center>
                            <Box
                                mt="1"
                                fontWeight="semibold"
                                as="h4"
                                lineHeight="tight"
                            >
                                Protect your Uniswap LP Position
                            </Box>
                            </Center>
                            <Center mb={4}>
                                {/*<Flex {...group} direction={"row"} align={"center"}>*/}

                                {/*    {choices.map((value) => {*/}
                                {/*        const radio = getRadioProps({ value })*/}
                                {/*        return (*/}
                                {/*            <RadioCard2 key={value} {...radio}>*/}
                                {/*                {value}*/}
                                {/*            </RadioCard2>*/}
                                {/*        )*/}
                                {/*    })}*/}

                                {/*</Flex>*/}
                                <Button
                                    size="lg"
                                    px="50"
                                    fontSize="20px"
                                    py={10}
                                    variant="solid"
                                    mt="50px"
                                    borderRadius="full"
                                    bgGradient="linear(to-r,#74cecc,green.300,blue.400)"
                                    _hover={{bgGradient:"linear(to-r,#74cecc,blue.400,#6666d2)"}}
                                    onClick={onOpen}
                                >
                                    I want downside protection ($1490)

                                    {/*  <Tooltip p={6} label="This is insurance for your Uniswap V3 LP position for the case that the price of ETH goes below your lower limit." fontSize="md" borderRadius="lg" bg="shrub.300" color="white">*/}
                                    {/*  <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>*/}
                                    {/*</Tooltip>*/}
                                </Button>
                            </Center>
                                <Box>
                                    <ScatterChart/>
                                </Box>
                        </Box>
                    </Box>
            </Container>



            <Modal motionPreset="slideInBottom" size={"lg"} isOpen={isOpen}  onClose={onClose}>
                <ModalOverlay />
                <ModalContent borderRadius="2xl" top={10}>
                    <ModalCloseButton />
                    <ModalHeader borderBottomWidth="1px">Uniswap V3 Insurance</ModalHeader>
                    <ModalBody>
                        <Box>
                            <Flex>
                                <Box id={"order form"}>
                                    <Stack spacing="24px">
                                        <Box mt={2} mb={8}>
                                            <HStack spacing={3}>
                                                <Tooltip p={3} label={"You are buying a put using Insta Trade, and hereby hedging your position in Uniswap LP against downside risk. "} bg="gray.300" color="gray.800" borderRadius="lg">
                                                    <Tag colorScheme="purple">
                                                        <Icon as={RiHandCoinLine} />
                                                        <TagLabel>PUT</TagLabel>
                                                    </Tag>
                                                </Tooltip>
                                                <Tooltip p={3} label={"This PUT will expire on Oct 30"} bg="gray.300" color="gray.800" borderRadius="lg">
                                                    <Tag colorScheme="blue">
                                                        <Icon as={MdDateRange} />
                                                        <TagLabel> Oct 30</TagLabel>
                                                    </Tag>
                                                </Tooltip>
                                                <Tooltip p={3} label={"This is the strike price for this PUT option"} bg="gray.300" color="gray.800" borderRadius="lg">
                                                    <Tag colorScheme="yellow">
                                                        <Icon as={GiMoneyStack} />
                                                        <TagLabel>3000 SUSD</TagLabel>
                                                    </Tag>
                                                </Tooltip>
                                            </HStack>
                                        </Box>
                                        <Box>
                                            <FormLabel htmlFor="amount">Amount:
                                                <Tooltip p={3} label={"The amount of asset to purchase option for (minimum: 0.000001)"} fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">
                                                    <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>
                                                </Tooltip>
                                            </FormLabel>
                                            <Input
                                                id="amount"
                                                placeholder="29"
                                                value="29"
                                            />
                                        </Box>
                                        <Box>
                                            <FormLabel htmlFor="bid">Price per contract:
                                                <Tooltip p={3} label={"The SUSD required to purchase 1 contract"} fontSize="xs" borderRadius="lg" bg="shrub.300" color="white">
                                                    <Text as="sup" pl={1}><QuestionOutlineIcon/></Text>
                                                </Tooltip>
                                            </FormLabel>
                                            <Input
                                                id="bid"
                                                placeholder="49.95"
                                                value="49.95"
                                                isDisabled
                                            />
                                        </Box>
                                        <Alert status="info" borderRadius={"2xl"} bgColor={useColorModeValue("gray.100", "shrub.300")}>
                                            <AlertIcon />
                                            You are about to purchase insurance for your Uniswap V3 LP position to protect against ETH going below the lower range of 3000 USDC
                                        </Alert>
                                        <Box>
                                            <Flex justifyContent="flex-end">
                                                <Button
                                                    colorScheme="teal"
                                                    type="submit">
                                                    Place Order
                                                </Button>
                                            </Flex>
                                        </Box>
                                    </Stack>

                                </Box>
                            </Flex>
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>

        </>
    )
}


export default HomeView
