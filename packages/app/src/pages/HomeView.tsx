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
    Circle,
    Stack,
    useDisclosure,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Modal,
    ListItem,
    List,
    ListIcon,
    PopoverFooter,
    PopoverBody,
    PopoverCloseButton,
    PopoverHeader, PopoverArrow, PopoverContent, PopoverTrigger, Popover
} from '@chakra-ui/react';
import {ArrowForwardIcon, ExternalLinkIcon,} from '@chakra-ui/icons';
import {Link as ReachLink, RouteComponentProps} from '@reach/router';
import {HappyBud, PolygonIcon, ShrubLogo, TradeBud, UniIcon} from '../assets/Icons';
import {FaEthereum} from 'react-icons/fa';
import React, {useState} from "react";
import {FiLink, GiMoneyStack, GrConnect, MdCheckCircle, VscDebugDisconnect} from "react-icons/all";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import useAddNetwork from "../hooks/useAddNetwork";
import {isMobile} from "react-device-detect";
import Faucet from "../components/Faucet";


function HomeView(props: RouteComponentProps) {

    const [localError, setLocalError] = useState('');
    const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
    const { isOpen: isTestTokenModalOpen, onOpen: onTestTokenModalOpen, onClose: onTestTokenModalClose } = useDisclosure();
    const addNetwork = useAddNetwork();

    const property = {
        // imageUrl: '../assets/uni.svg',
        // imageAlt: "Uniswap insurance",
        // title: "Buy ETH  for a 2% discount",
        // formattedPrice: "$1,900.00",
    }

    return (
        <>
            <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center mt={10}>
                    <Box maxW="60rem" mb={12} textAlign={'center'}>

                        <Heading fontSize="60px" letterSpacing={"tight"}>
                            Welcome To Shrub Beta!
                        </Heading>
                        <Text fontSize="25px" pt={2} mb={12} color={useColorModeValue("gray.600", "gray.500")}>
                           Get started in 3 simple steps
                        </Text>
                        <Flex
                            direction={{base: "column", md: "row", lg: "row"}}
                            alignItems={{base: "center", md: "center", lg: "center"}}>
                            <Box
                                mb={{base: "10", md: "0", lg: "0"}}
                                maxW="280px"
                                minW="280px"
                                mr={5}
                                shadow={useColorModeValue("2xl", "2xl")}
                                borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>
                                <Box p={6}>
                                    <Stack py={6} align={'center'}>
                                        <Circle w="100px" h="100px" bg={useColorModeValue("yellow.300","gray.500")} color={useColorModeValue("white","black")}>
                                            <Box as="span" fontWeight="bold" fontSize="6xl">
                                                1
                                            </Box>
                                        </Circle>
                                    </Stack>
                                    <Stack spacing={0} align={'center'} mb={5}>
                                        <Heading fontSize={'xl'} fontWeight={500}>
                                            Connect to Mumbai
                                        </Heading>
                                        <Text fontSize={'sm'} color={'gray.500'} fontWeight={"semibold"} pt={5}>To beta
                                            test Shrub, your wallet needs to be connected to the Polygon
                                            Test Network.</Text>
                                    </Stack>
                                    <Button
                                        onClick={addNetwork}
                                        w={'full'}
                                        mt={8}
                                        colorScheme={useColorModeValue("green", "teal")}
                                        rounded={'full'}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}>
                                        Connect
                                    </Button>
                                </Box>
                            </Box>
                            <Spacer/>
                            <Box
                                mb={{base: "10", md: "0", lg: "0"}}
                                mr={5}
                                maxW="285px"
                                minW="285px"
                                shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"
                                bg={useColorModeValue("white", "shrub.100")}>

                                <Box p={6}>
                                    <Stack py={6} align={'center'}>
                                        <Circle w="100px" h="100px" bg={useColorModeValue("yellow.300","gray.500")} color={useColorModeValue("white","black")}>
                                            <Box as="span" fontWeight="bold" fontSize="6xl">
                                                2
                                            </Box>
                                        </Circle>
                                    </Stack>
                                    <Stack spacing={0} align={'center'} mb={5}>
                                        <Heading fontSize={'xl'} fontWeight={500}>
                                            Buy SUSD with MATIC
                                        </Heading>
                                        <List spacing={3}>
                                            <ListItem fontSize={'sm'} color={'gray.500'} fontWeight={"semibold"} pt={5}>
                                                <ListIcon as={MdCheckCircle} color="green.200" />
                                                <Link href="https://faucet.polygon.technology/" isExternal>
                                                    First, get some MATIC here <ExternalLinkIcon mx="2px" />
                                                </Link>
                                            </ListItem>
                                            <ListItem fontSize={'sm'} color={'gray.500'} fontWeight={"semibold"}>
                                                <ListIcon as={MdCheckCircle} color="green.200" />
                                                Then, buy SUSD with it
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <Text ml="1" color={useColorModeValue("blue", "blue.200")} as="sup" cursor="pointer">Why?</Text>
                                                    </PopoverTrigger>
                                                        <PopoverContent>
                                                            <PopoverArrow />
                                                            <PopoverCloseButton />
                                                            <PopoverBody letterSpacing="wide" textAlign={"left"}>
                                                                <Text> To facilitate testing with reasonable amounts of tokens, we have created SMATIC and SUSD.</Text> <Text>These represent MATIC and USD stable coin in our test environment.</Text> <Text>Options in the test environment have these as their underlying assets.</Text><Text> You may buy SMATIC and SUSD at a rate of 10,000/test MATIC.</Text>
                                                            </PopoverBody>
                                                        </PopoverContent>
                                                </Popover>
                                            </ListItem>
                                        </List>
                                    </Stack>
                                    <Text fontSize={'xs'} color={useColorModeValue("gray.400", "gray.100")} fontWeight={"extrabold"} pt={1} letterSpacing={"1px"}>
                                        1 MATIC = 10,000 SMATIC
                                    </Text>
                                    <Text fontSize={'xs'} color={useColorModeValue("gray.400", "gray.100")} fontWeight={"extrabold"}  pt={1} letterSpacing={"1px"}>
                                        1 MATIC = 10,000 SUSD
                                    </Text>
                                    <Button
                                        onClick={onTestTokenModalOpen}
                                        w={'full'}
                                        mt={8}
                                        colorScheme={useColorModeValue("green", "teal")}
                                        rounded={'full'}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}>
                                        Buy Test Tokens
                                    </Button>
                                </Box>
                            </Box>
                            <Spacer/>
                            <Box
                                 maxW="280px"
                                 minW="280px"
                                 shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"
                                 bg={useColorModeValue("white", "shrub.100")}>

                                <Box p={6}>
                                    <Stack py={6} align={'center'}>
                                        <Circle w="100px" h="100px" bg={useColorModeValue("yellow.300","gray.500")} color={useColorModeValue("white","black")}>
                                            <Box as="span" fontWeight="bold" fontSize="6xl">
                                                3
                                            </Box>
                                        </Circle>
                                    </Stack>
                                    <Stack spacing={0} align={'center'} mb={5}>
                                        <Heading fontSize={'xl'} fontWeight={500}>
                                            Deposit SUSD
                                        </Heading>
                                        <Text fontSize={'sm'} color={'gray.500'} fontWeight={"semibold"} pt={5}>In order
                                            to buy Options, you need to deposit SUSD to
                                            the Shrub platform.</Text>
                                    </Stack>
                                    <Button

                                        as={ReachLink} to={'/shrubfolio'}
                                        w={'full'}
                                        // borderRadius="full"
                                        mt={8}
                                        colorScheme={useColorModeValue("green", "teal")}
                                        rounded={'full'}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}>
                                        Deposit
                                    </Button>
                                </Box>
                            </Box>
                        </Flex>
                    </Box>
                </Center>
            </Container>

            <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center mt={20}>
                    <Box maxW="60rem" mb={12} textAlign={'center'}>
                        <Heading fontSize="60px" letterSpacing={"tight"} mb={4}>
                            Done with 1-2-3 above?
                        </Heading>
                        <Text fontSize="25px" color={useColorModeValue("gray.600", "gray.500")}>
                            Sweet. Let buy some options!
                        </Text>
                        <Button
                            rightIcon={<ArrowForwardIcon/>}
                            size="lg"
                            px="50"
                            fontSize="25px"
                            py={10}
                            colorScheme={useColorModeValue("green", "teal")}
                            variant="solid"
                            mt="50px"
                            borderRadius="full"
                            // bgGradient="linear(to-r,green.300,blue.400,#6666d2)"
                            // _hover={{bgGradient:"linear(to-r,green.300,blue.600,blue.400)"}}
                            as={ReachLink} to={'/options'}
                        >
                            Start Trading
                        </Button>
                    </Box>
                </Center>
            </Container>

            {/*<Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">*/}
            {/*    <Center mt={20}>*/}
            {/*        <Box maxW="60rem" mb={12} textAlign={'center'}>*/}
            {/*            <Heading fontSize="60px" letterSpacing={"tight"} mb={4}>*/}
            {/*                /!*First time? *!/*/}
            {/*                Not sure what to buy?*/}
            {/*            </Heading>*/}
            {/*            <Text fontSize="25px">*/}
            {/*                Try these quick options*/}
            {/*            </Text>*/}
            {/*        </Box>*/}
            {/*    </Center>*/}

            {/*    <Flex*/}
            {/*        direction={{base: "column", md: "row", lg:"row"}}*/}
            {/*        alignItems={{base: "center", md: "center", lg:"center"}}*/}
            {/*    >*/}
            {/*        <Box*/}
            {/*            mb={{ base: "10", md: "0", lg:"0" }}*/}
            {/*            maxW="xs"*/}
            {/*            mr={5}*/}
            {/*            shadow={useColorModeValue("2xl", "2xl")}*/}
            {/*            borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "shrub.100")}>*/}
            {/*            <Center mt={4}>*/}
            {/*                <UniIcon fontSize={180} fill="currentColor"/>*/}
            {/*            </Center>*/}
            {/*            <Box p="6">*/}
            {/*                <Box d="flex" alignItems="baseline">*/}
            {/*                    <Badge borderRadius="full" px="2" colorScheme="teal">*/}
            {/*                        Put*/}
            {/*                    </Badge>*/}
            {/*                </Box>*/}

            {/*                <Box*/}
            {/*                    mt="1"*/}
            {/*                    fontWeight="semibold"*/}
            {/*                    as="h4"*/}
            {/*                    lineHeight="tight"*/}
            {/*                >*/}
            {/*                    Uniswap V3 LP Insurance*/}
            {/*                </Box>*/}
            {/*            </Box>*/}
            {/*        </Box>*/}
            {/*        <Spacer/>*/}
            {/*        <Box*/}
            {/*            mb={{ base: "10", md: "0", lg:"0" }}*/}
            {/*            mr={5}*/}
            {/*            maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"*/}
            {/*            bg={useColorModeValue("white", "shrub.100")}>*/}
            {/*            <Center mt={6}><PolygonIcon fontSize={160}/></Center>*/}

            {/*            <Box p="6">*/}
            {/*                <Box d="flex" alignItems="baseline">*/}
            {/*                    <Badge borderRadius="full" px="2" colorScheme="purple">*/}
            {/*                        Call*/}
            {/*                    </Badge>*/}
            {/*                    <Badge borderRadius="full" px="2" colorScheme="red">*/}
            {/*                        Sell*/}
            {/*                    </Badge>*/}
            {/*                </Box>*/}

            {/*                <Box*/}
            {/*                    mt="1"*/}
            {/*                    fontWeight="semibold"*/}
            {/*                    as="h4"*/}
            {/*                    lineHeight="tight"*/}

            {/*                >*/}
            {/*                    Sell MATIC for a 4% discount*/}
            {/*                </Box>*/}
            {/*            </Box>*/}
            {/*        </Box>*/}
            {/*        <Spacer/>*/}
            {/*        <Box maxW="xs" shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"*/}
            {/*             bg={useColorModeValue("white", "shrub.100")}>*/}
            {/*            <Center mt={4}> <FaEthereum fontSize={180}/></Center>*/}

            {/*            <Box p="6">*/}
            {/*                <Box d="flex" alignItems="baseline">*/}
            {/*                    <Badge borderRadius="full" px="2" colorScheme="blue">*/}
            {/*                        Put*/}
            {/*                    </Badge>*/}
            {/*                    <Badge borderRadius="full" px="2" colorScheme={useColorModeValue("green", "teal")}>*/}
            {/*                        Buy*/}
            {/*                    </Badge>*/}
            {/*                </Box>*/}

            {/*                <Box*/}
            {/*                    mt="1"*/}
            {/*                    fontWeight="semibold"*/}
            {/*                    as="h4"*/}
            {/*                    lineHeight="tight"*/}

            {/*                >*/}
            {/*                    {property.title}*/}
            {/*                </Box>*/}

            {/*                /!*<Box>*!/*/}
            {/*                /!*    {property.formattedPrice}*!/*/}
            {/*                /!*    <Box as="span" color="gray.600" fontSize="sm">*!/*/}
            {/*                /!*        / call*!/*/}
            {/*                /!*    </Box>*!/*/}
            {/*                /!*</Box>*!/*/}
            {/*            </Box>*/}
            {/*        </Box>*/}
            {/*    </Flex>*/}
            {/*</Container>*/}

            <Modal isOpen={isTestTokenModalOpen} onClose={onTestTokenModalClose} motionPreset="slideInBottom" scrollBehavior={isMobile ?"inside" : "outside"}>
                <ModalOverlay />
                <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">
                    <ModalHeader> Test Faucet</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Faucet/>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}


export default HomeView