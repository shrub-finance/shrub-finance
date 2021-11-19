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
import React, { useContext, useEffect, useState } from 'react'
import {handleErrorMessagesFactory} from '../utils/handleErrorMessages';
import useAddNetwork from "../hooks/useAddNetwork";
import {isMobile} from "react-device-detect";
import Faucet from "../components/Faucet";
import {useWeb3React} from "@web3-react/core";
import {getErrorMessage} from "../components/ConnectWallet";
import { BigNumber, ethers } from 'ethers'
import { getAvailableBalance, getBigWalletBalance, userOptionPosition } from '../utils/ethMethods'
import { TxContext } from '../components/Store'

const { Zero } = ethers.constants;


function HomeView(props: RouteComponentProps) {

    const [localError, setLocalError] = useState('');
    const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
    const { isOpen: isTestTokenModalOpen, onOpen: onTestTokenModalOpen, onClose: onTestTokenModalClose } = useDisclosure();
    const { pendingTxs } = useContext(TxContext);
    const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
    const addNetwork = useAddNetwork();
    const toast = useToast();
    const connectedColor = useColorModeValue("green.100", "teal.600");
    const bgConnect = useColorModeValue("white", "dark.100");
    const questionColor = useColorModeValue("blue", "yellow.300");
    const stepsColor = useColorModeValue("white","black");
    const connectedStepColor = useColorModeValue("green.400","white");
    const stepsBg = useColorModeValue("yellow.300","gray.500");
    const connectedStepBg = useColorModeValue("white","dark.100");
    const tradingBtnColor = useColorModeValue("sprout", "teal");

    // Copied from OptionDetails
    const {active, library, account, error, chainId} = useWeb3React();
    const [balances, setBalances] = useState<{shrub: {baseAsset: BigNumber, quoteAsset: BigNumber}, wallet: {baseAsset: BigNumber, quoteAsset: BigNumber}, optionPosition: BigNumber}>()

    function handleConnect() {
        if (!account) {
            if(!!error && getErrorMessage(error).title === "Wrong Network") {
                return addNetwork();
            }
            return toast({
                title: "No wallet detected",
                description: "Make sure your wallet is connected. Use 'Connect Wallet'.",
                status: "warning",
                position: "top",
                duration: 3000,
                variant: "shrubYellow",
                isClosable: true,
            })
        }
        console.log(addNetwork);
        return addNetwork();
    }


    // Get balances
    useEffect(() => {
        const quoteAsset = '0x6b1eDb6Da018865efc22cF7d2574c7b878e2E445';  //sMATIC
        const baseAsset = '0x7891337f1360713c47240Ac94d31a3FF25D62c9D';   //sUSD


        console.log('useEffect - 1 - get balances');
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
            const optionPosition = ethers.constants.Zero;
            setBalances({
                shrub: {quoteAsset: bigQuoteAssetBalanceShrub, baseAsset: bigBaseAssetBalanceShrub},
                wallet: {baseAsset: bigBaseAssetBalanceWallet, quoteAsset: bigQuoteAssetBalanceWallet},
                optionPosition
            })
        }
        main()
          .catch(console.error);
    },[active, account, pendingTxsState])

    const step1complete = !!account;
    const step2complete = balances && balances.shrub && balances.wallet && (!balances.shrub.baseAsset.eq(Zero) || !balances.wallet.baseAsset.eq(Zero));
    const step3complete = balances && balances.shrub && (!balances.shrub.baseAsset.eq(Zero));

    return (
      <>
          <Container mt={isMobile ? 30 : 50} p={5} flex='1' borderRadius='2xl' maxW='container.lg'>
              <Center>
                  <Box mb={10}>
                      <Heading maxW='60rem' as='h1'
                        // fontSize={{base: "4xl", md: "6xl", lg: "6xl"}}
                               fontSize={['4xl', '5xl', '6xl', '6xl']}
                               fontWeight='bold' textAlign='center'>
                          {/*Welcome to*/}
                          <Text
                            // as="span"
                            // bgGradient="linear(to-l, #7928CA, #FF0080)"
                            // bgClip="text"
                          >
                              Shrub Beta
                          </Text>
                      </Heading>
                      <Text mt='3' mb={16} color={useColorModeValue('gray.500', 'gray.400')}
                            fontWeight='bold'
                            fontSize='xl'
                            textAlign='center'
                            px={['4rem', '5rem', '17rem', '17rem']}
                      >
                          {isMobile ? 'Start trading with 3 easy steps' : 'Practice crypto options trading on the Polygon Mumbai blockchain'}
                      </Text>
                      <Flex
                        direction={{ base: 'column', md: 'row', lg: 'row' }}
                        alignItems={{ base: 'center', md: 'center', lg: 'center' }}>
                          {/* #1 Box */}
                          <Box
                            mb={{ base: '10', md: '0', lg: '0' }}
                            maxW='280px'
                            minW='280px'
                            mr={5}
                            shadow={useColorModeValue('2xl', '2xl')}
                            bg={step1complete ? connectedColor : bgConnect}
                            borderRadius='2xl' overflow='hidden'>

                              <Box p={6}>
                                  <Stack py={6} align={'center'}>
                                      <Circle w='100px' h='100px' bg={step1complete ? connectedStepBg : stepsBg}
                                              color={step1complete ? connectedStepColor : stepsColor}>
                                          <Box as='span' fontWeight='bold' fontSize='6xl'>
                                              {!step1complete ? 1 : <CheckIcon />}
                                          </Box>
                                      </Circle>
                                  </Stack>
                                  <Stack align={'center'}>
                                      <Heading fontSize={'xl'} fontWeight={'500'}>
                                          {step1complete && <PolygonIcon />} {step1complete ? 'Mumbai' : 'Connect to Mumbai'}
                                      </Heading>
                                      {!step1complete ? <Popover placement='top' trigger='hover'>
                                          <PopoverTrigger>
                                              <Text color={questionColor} fontWeight={'extrabold'} fontSize={'sm'}
                                                    cursor='pointer'>What is Mumbai?</Text>
                                          </PopoverTrigger>
                                          <PopoverContent>
                                              <PopoverArrow />
                                              <PopoverCloseButton />
                                              <PopoverBody letterSpacing='wide' textAlign={'left'}>
                                                  <UnorderedList lineHeight={1.8} fontSize={'sm'}>
                                                      <ListItem pb={2}> <Text> To beta test Shrub, you need to <strong>connect
                                                          your wallet</strong> to the Polygon Test Network
                                                          (Mumbai).</Text>
                                                      </ListItem>
                                                      <ListItem> Click the button below to automatically connect to
                                                          Mumbai.
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
                                    disabled={!!step1complete}
                                    colorScheme={useColorModeValue('sprout', 'teal')}
                                    rounded={'full'}
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                    }}>
                                      {step1complete ? 'Connected' : 'Connect to Mumbai'}
                                  </Button>
                              </Box>
                          </Box>
                          <Spacer />

                          {/* #2 Box */}
                          <Box
                            mb={{ base: '10', md: '0', lg: '0' }}
                            mr={5}
                            maxW='285px'
                            minW='285px'
                            shadow={useColorModeValue('2xl', '2xl')} borderRadius='2xl' overflow='hidden'
                          bg={step2complete ? connectedColor : bgConnect}>

                              <Box p={6}>
                                  <Stack py={6} align={'center'}>
                                      <Circle w='100px' h='100px'
                                              bg={ step2complete ? connectedStepBg: stepsBg }
                                              color={ step2complete ? connectedStepColor: stepsColor }>
                                          <Box as='span' fontWeight='bold' fontSize='6xl'>
                                              { step2complete ? <CheckIcon/> : 2}
                                          </Box>
                                      </Circle>
                                  </Stack>
                                  <Stack align={'center'}>
                                      <Heading fontSize={'xl'} fontWeight={'500'}>
                                        Buy sUSD
                                      </Heading>
                                      <Popover placement='top' trigger='hover'>
                                          <PopoverTrigger>
                                              <Text color={questionColor} fontSize={'sm'} cursor='pointer'
                                                    fontWeight={'extrabold'}>What is sUSD?</Text>
                                          </PopoverTrigger>
                                          <PopoverContent>
                                              <PopoverArrow />
                                              <PopoverCloseButton />
                                              <PopoverBody letterSpacing='wide' textAlign={'left'}>
                                                  <UnorderedList fontSize={'sm'} lineHeight={1.8}>
                                                      <ListItem pb={2}>In <strong>mainnet,</strong> you
                                                          will <strong>trade</strong> options in <strong>MATIC &
                                                              USDC</strong>. </ListItem>
                                                      <ListItem>In <strong>test environment</strong>:</ListItem>
                                                      <UnorderedList>
                                                          <ListItem><strong>sMATIC </strong>
                                                              represents <strong>MATIC</strong></ListItem>
                                                          <ListItem><strong>sUSD </strong> represents <strong>USD stable
                                                              coin</strong> </ListItem>
                                                          <ListItem>These are <strong>Option underlying
                                                              asset</strong></ListItem>
                                                          <ListItem><Text>Rate:</Text>
                                                              <Text fontSize={'xs'} fontWeight={'bold'}>1 MATIC = 10,000
                                                                  sMATIC</Text>
                                                              <Text fontSize={'xs'} fontWeight={'bold'}>1 MATIC = 10,000
                                                                  sUSD</Text></ListItem>
                                                      </UnorderedList>
                                                  </UnorderedList>
                                              </PopoverBody>
                                          </PopoverContent>
                                      </Popover>
                                  </Stack>
                                  <Button
                                    disabled={!step1complete}
                                    onClick={onTestTokenModalOpen}
                                    w={'full'}
                                    mt={8}
                                    colorScheme={useColorModeValue('sprout', 'teal')}
                                    rounded={'full'}
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                    }}>
                                    {step2complete ? 'Buy more sUSD' : 'Buy sUSD'}
                                  </Button>
                              </Box>
                          </Box>
                          <Spacer />

                          {/* #3 Box */}
                          <Box
                            maxW='280px'
                            minW='280px'
                            shadow={useColorModeValue('2xl', '2xl')} borderRadius='2xl' overflow='hidden'
                            bg={step3complete ? connectedColor : bgConnect}>
                              <Box p={6}>
                                  <Stack py={6} align={'center'}>
                                      <Circle w='100px' h='100px'
                                              bg={step3complete ? connectedStepBg : stepsBg}
                                              color={step3complete ? connectedStepColor : stepsColor}>
                                          <Box as='span' fontWeight='bold' fontSize='6xl'>
                                              {step3complete ? <CheckIcon/> : 3}
                                          </Box>
                                      </Circle>
                                  </Stack>
                                  <Stack align={'center'}>
                                      <Heading fontSize={'xl'} fontWeight={'500'}>
                                          Deposit sUSD
                                      </Heading>
                                      <Popover placement='top' trigger='hover'>
                                          <PopoverTrigger>
                                              <Text color={questionColor} fontSize={'sm'} cursor='pointer'
                                                    fontWeight={'extrabold'}>Why deposit sUSD?</Text>
                                          </PopoverTrigger>
                                          <PopoverContent fontSize='sm'>
                                              <PopoverArrow />
                                              <PopoverCloseButton />
                                              <PopoverBody letterSpacing='wide' textAlign={'left'}>
                                                  <Text pb={4}> To buy Options, you need to deposit sUSD to
                                                      the Shrub platform.</Text>
                                              </PopoverBody>
                                          </PopoverContent>
                                      </Popover>
                                  </Stack>
                                  <Button
                                    disabled={!step1complete || !step2complete}
                                    as={(!step1complete || !step2complete) ? Box : ReachLink} to={'/shrubfolio'}
                                    w={'full'}
                                    mt={8}
                                    colorScheme={useColorModeValue('sprout', 'teal')}
                                    rounded={'full'}
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                    }}>
                                    {step3complete ? 'Deposit More sUSD' : 'Deposit sUSD'}
                                  </Button>
                              </Box>
                          </Box>
                      </Flex>
                  </Box>
              </Center>
          </Container>

          <Container mt={25} p={5} flex='1' borderRadius='2xl' maxW='container.lg'>
              <Center>
                  <Box maxW='60rem' mb={8} textAlign={'center'}>
                      <Heading fontSize='50px' letterSpacing={'tight'}>
                          Done with 1-2-3 above?
                      </Heading>
                      <Text pt='3' mb='8' fontSize='18px' color={useColorModeValue('gray.500', 'gray.500')}>
                          Sweet. Let's buy some options!
                      </Text>
                      <Button
                        disabled={!step1complete || !step2complete || !step3complete}
                        rightIcon={<ArrowForwardIcon />}
                        size='lg'
                        px='50'
                        fontSize='25px'
                        py={10}
                        colorScheme={tradingBtnColor}
                        variant='solid'
                        borderRadius='full'
                        _hover={{ transform: 'translateY(-2px)' }}
                        // bgGradient={useColorModeValue("linear(to-r, blue.100, teal.200)", "linear(to-l, blue.700, teal.700)")}
                        // bgGradient="linear(to-r,green.300,blue.400,#6666d2)"
                        // _hover={{bgGradient:"linear(to-r,green.300,blue.600,blue.400)"}}

                        // bgGradient="linear(to-r,#74cecc,green.300,blue.400)"
                        // _hover={{bgGradient:"linear(to-r,#74cecc,blue.400,#6666d2)"}}
                        as={ReachLink} to={'/options'}
                      >
                          Start Trading
                      </Button>
                  </Box>
              </Center>
          </Container>

          {/*<Container mt={25} p={5} flex="1" borderRadius="2xl" maxW="container.lg">*/}
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
          {/*            borderRadius="2xl" overflow="hidden" bg={useColorModeValue("white", "dark.100")}>*/}
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
          {/*            bg={useColorModeValue("white", "dark.100")}>*/}
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
          {/*             bg={useColorModeValue("white", "dark.100")}>*/}
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

            <Modal isOpen={isTestTokenModalOpen} onClose={onTestTokenModalClose} motionPreset="slideInBottom" scrollBehavior={isMobile ?"inside" : "outside"} size={isMobile ? 'full' : 'md' }>
                <ModalOverlay />
                <ModalContent top={isMobile ? '0' : '6rem'} boxShadow="dark-lg" borderRadius={isMobile ? 'none' : '2xl'}>
                    <ModalHeader> Buy sUSD</ModalHeader>
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
