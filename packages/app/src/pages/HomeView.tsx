import {
    Box,
    Heading,
    Text,
    Button,
    Center,
    useColorModeValue,
    Container,
    Flex,
    Spacer,
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
    PopoverBody,
    PopoverCloseButton,
    PopoverArrow, PopoverContent, PopoverTrigger, Popover, UnorderedList, useToast
} from '@chakra-ui/react';
import {ArrowForwardIcon, CheckIcon,} from '@chakra-ui/icons';
import {Link as ReachLink, RouteComponentProps} from '@reach/router';
import {PolygonIcon} from '../assets/Icons';
import React, {useState} from "react";
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import useAddNetwork from "../hooks/useAddNetwork";
import {isMobile} from "react-device-detect";
import Faucet from "../components/Faucet";
import {useWeb3React} from "@web3-react/core";
import {ConnectionStatus, ConnectWalletModal, getErrorMessage} from "../components/ConnectWallet";
import {TxStatusList} from "../components/TxMonitoring";


function HomeView(props: RouteComponentProps) {

    const [localError, setLocalError] = useState('');
    const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
    const { isOpen: isTestTokenModalOpen, onOpen: onTestTokenModalOpen, onClose: onTestTokenModalClose } = useDisclosure();
    const { isOpen: isOpenConnectWallet, onOpen: onOpenConnectWallet, onClose: onCloseConnectWallet } = useDisclosure();
    const addNetwork = useAddNetwork();
    const {account, error:web3Error, active} = useWeb3React();
    const connectedColor = useColorModeValue("green.100", "teal.600");
    const bgConnect = useColorModeValue("white", "dark.100");
    const questionColor = useColorModeValue("blue", "yellow.300");
    const stepsColor = useColorModeValue("white","black");
    const connectedStepColor = useColorModeValue("green.400","white");
    const stepsBg = useColorModeValue("yellow.300","gray.500");
    const connectedStepBg = useColorModeValue("white","dark.100");
    const tradingBtnColor = useColorModeValue("sprout", "teal");
    const displayStatus = (val: boolean ) => {
        setIsHidden(val);
    };
    const [isHidden, setIsHidden] = useState(false);

    function handleConnect() {
        if (!account) {
            if(!!web3Error && getErrorMessage(web3Error).title === "Wrong Network") {
                return addNetwork();
            }
            else {
                return onOpenConnectWallet();
            }
        }

        console.log(addNetwork);
        return addNetwork();
    }

    return (
        <>
            <Container mt={isMobile ? 30 : 50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center>
                    <Box mb={10}>
                        <Heading maxW="60rem" as="h1"
                                 fontSize={["4xl", "5xl", "90px", "90px"]}
                                 fontWeight="bold" textAlign="center">
                            <Text
                                as="span"
                                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                                  bgClip="text"
                            >
                             Shrub Beta
                            </Text>
                        </Heading>
                        <Text  mt="3" mb={20} color={useColorModeValue("gray.500", "gray.400")}
                              fontSize="18px"
                               textAlign="center"
                               px={["4rem", "5rem", "17rem", "17rem"]}
                            >
                            {isMobile ? 'Start trading with 3 easy steps' : 'Practice crypto options trading on the Polygon Mumbai blockchain'}
                        </Text>

                        <Box maxW="60rem" mb={8} textAlign={'center'}>
                            <Heading fontSize="50px" >
                                Get started in 3 easy steps!
                            </Heading>
                        </Box>
                        <Flex
                            direction={{base: "column", md: "row", lg: "row"}}
                            alignItems={{base: "center", md: "center", lg: "center"}}>
                            <Box
                                mb={{base: "10", md: "0", lg: "0"}}
                                maxW="280px"
                                minW="280px"
                                mr={5}
                                shadow={useColorModeValue("2xl", "2xl")}
                                bg={account? connectedColor : bgConnect}
                                borderRadius="2xl" overflow="hidden">

                                <Box p={6}>
                                    <Stack py={6} align={'center'}>
                                        <Circle w="100px" h="100px" bg={account ?  connectedStepBg :stepsBg} color={account ? connectedStepColor :stepsColor}>
                                            <Box as="span" fontWeight="bold" fontSize="6xl">
                                                {!account? 1 : <CheckIcon/>}
                                            </Box>
                                        </Circle>
                                    </Stack>
                                    <Stack align={'center'}>
                                        <Heading fontSize={'xl'} fontWeight={"500"}>
                                            {account && <PolygonIcon/> } {account ? 'Mumbai' :  !!web3Error && getErrorMessage(web3Error).title === "Wrong Network" ? "Connect to Mumbai" : "Connect Wallet" }
                                        </Heading>
                                        { !account ? <Popover placement="top" trigger='hover'>
                                            <PopoverTrigger>
                                                <Text color={questionColor} fontWeight={"extrabold"} fontSize={"sm"} cursor="pointer">Learn More</Text>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverBody letterSpacing="wide" textAlign={"left"}>
                                                    <UnorderedList lineHeight={1.8} fontSize={"sm"}>
                                                        <ListItem pb={2}> <Text> To beta test Shrub, you need to <strong>connect your wallet</strong> to the Polygon Test Network (Mumbai).</Text>
                                                        </ListItem>
                                                        <ListItem> Click the button below to automatically connect to Mumbai.
                                                        </ListItem>
                                                    </UnorderedList>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover> : <Box>Testnet</Box>}

                                    </Stack>
                                    <Button
                                        onClick={handleConnect}
                                        w={'full'}
                                        mt={8}
                                        colorScheme={useColorModeValue("sprout", "teal")}
                                        rounded={'full'}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}>
                                        {account ? 'Connected' : !!web3Error && getErrorMessage(web3Error).title === "Wrong Network" ? "Connect to Mumbai" : "Connect Wallet" }
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
                                bg={useColorModeValue("white", "dark.100")}>

                                <Box p={6}>
                                    <Stack py={6} align={'center'}>
                                        <Circle w="100px" h="100px" bg={useColorModeValue("yellow.300","gray.500")} color={stepsColor}>
                                            <Box as="span" fontWeight="bold" fontSize="6xl">
                                                2
                                            </Box>
                                        </Circle>
                                    </Stack>
                                    <Stack align={'center'}>
                                        <Heading fontSize={'xl'} fontWeight={"500"}>
                                            Get sUSD
                                        </Heading>
                                        <Popover placement="top" trigger='hover'>
                                            <PopoverTrigger>
                                                <Text color={questionColor} fontSize={"sm"} cursor="pointer" fontWeight={"extrabold"}>Learn More</Text>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverBody letterSpacing="wide" textAlign={"left"}>
                                                    <UnorderedList fontSize={"sm"} lineHeight={1.8}>
                                                        <ListItem pb={2}>In <strong>mainnet,</strong> you will <strong>trade</strong> options in <strong>MATIC & USDC</strong>. </ListItem>
                                                        <ListItem>In <strong>test environment</strong>:</ListItem>
                                                        <UnorderedList>
                                                            <ListItem><strong>sMATIC </strong>
                                                                represents <strong>MATIC</strong></ListItem>
                                                            <ListItem><strong>sUSD </strong> represents <strong>USD stable coin</strong> </ListItem>
                                                            <ListItem>These are <strong>Option underlying asset</strong></ListItem>
                                                            <ListItem><Text>Rate:</Text>
                                                                <Text fontSize={"xs"} fontWeight={"bold"}>1 MATIC = 10,000 sMATIC</Text>
                                                                <Text fontSize={"xs"} fontWeight={"bold"}>1 MATIC = 10,000 sUSD</Text></ListItem>
                                                        </UnorderedList>
                                                    </UnorderedList>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    </Stack>
                                    <Button
                                        onClick={onTestTokenModalOpen}
                                        w={'full'}
                                        mt={8}
                                        colorScheme={useColorModeValue("sprout", "teal")}
                                        rounded={'full'}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}>
                                        Get sUSD
                                    </Button>
                                </Box>
                            </Box>
                            <Spacer/>
                            <Box
                                 maxW="280px"
                                 minW="280px"
                                 shadow={useColorModeValue("2xl", "2xl")} borderRadius="2xl" overflow="hidden"
                                 bg={useColorModeValue("white", "dark.100")}>

                                <Box p={6}>
                                    <Stack py={6} align={'center'}>
                                        <Circle w="100px" h="100px" bg={useColorModeValue("yellow.300","gray.500")} color={stepsColor}>
                                            <Box as="span" fontWeight="bold" fontSize="6xl">
                                                3
                                            </Box>
                                        </Circle>
                                    </Stack>
                                    <Stack align={'center'}>
                                        <Heading fontSize={'xl'} fontWeight={"500"}>
                                            Deposit sUSD
                                        </Heading>
                                        <Popover placement="top" trigger='hover'>
                                            <PopoverTrigger>
                                                <Text color={questionColor} fontSize={"sm"} cursor="pointer" fontWeight={"extrabold"}>Learn More</Text>
                                            </PopoverTrigger>
                                            <PopoverContent fontSize="sm">
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverBody letterSpacing="wide" textAlign={"left"}>
                                                    <Text pb={4}> To buy Options, you need to deposit sUSD to
                                                        the Shrub platform.</Text>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    </Stack>
                                    <Button

                                        as={ReachLink} to={'/shrubfolio'}
                                        w={'full'}
                                        mt={8}
                                        colorScheme={useColorModeValue("sprout", "teal")}
                                        rounded={'full'}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}>
                                        Deposit sUSD
                                    </Button>
                                </Box>
                            </Box>
                        </Flex>
                    </Box>
                </Center>
            </Container>

            {!isMobile && <Container mt={25} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
                <Center>
                        <Box maxW="60rem" mb={8} textAlign={'center'}>
                            <Heading fontSize="50px">
                                Done with 1-2-3 above?
                            </Heading>
                        <Text pt="3" mb="8" fontSize="18px" color="gray.500">
                            Sweet. Let's buy some options!
                        </Text>
                        <Button
                            rightIcon={<ArrowForwardIcon/>}
                            size="lg"
                            px="50"
                            fontSize="25px"
                            py={10}
                            colorScheme={tradingBtnColor}
                            variant="solid"
                            borderRadius="full"
                            _hover={{transform: 'translateY(-2px)'}}
                            as={ReachLink} to={'/options'}
                        >
                            Start Trading
                        </Button>
                    </Box>
                </Center>
            </Container> }


            <Modal isOpen={isTestTokenModalOpen} onClose={onTestTokenModalClose} motionPreset="slideInBottom" scrollBehavior={isMobile ?"inside" : "outside"} size={isMobile ? 'full' : 'md' }>
                <ModalOverlay />
                <ModalContent top={isMobile ? '0' : '6rem'} boxShadow="dark-lg" borderRadius={isMobile ? 'none' : '2xl'}>
                    <ModalHeader> Get sUSD</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Faucet/>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpenConnectWallet} onClose={onCloseConnectWallet} motionPreset="slideInBottom" scrollBehavior={isMobile ?"inside" : "outside"}>
                <ModalOverlay />
                <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">
                    <ModalHeader>{ !active ? 'Connect Wallet' :
                      !isHidden ? <Text fontSize={16}>Account Details</Text>:
                        <Button variant="ghost" onClick={() => displayStatus(false)}>Back</Button>
                    } </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {!active || isHidden? <ConnectWalletModal/> : !isHidden &&<ConnectionStatus displayStatus={displayStatus}/>}
                        { !(web3Error && getErrorMessage(web3Error).title === "Wrong Network") && <TxStatusList/>}
                    </ModalBody>
                </ModalContent>
            </Modal>

        </>
    )
}


export default HomeView