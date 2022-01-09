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
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Popover,
  UnorderedList,
  useToast,
  SlideFade,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  useRadioGroup,
  useBoolean,
} from "@chakra-ui/react";
import { ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import { PolygonIcon } from "../assets/Icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import useAddNetwork from "../hooks/useAddNetwork";
import { isMobile } from "react-device-detect";
import Faucet from "../components/Faucet";
import { useWeb3React } from "@web3-react/core";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { TxStatusList } from "../components/TxMonitoring";
import { BigNumber, ethers } from "ethers";
import {
  approveToken,
  depositEth,
  depositToken,
  getAllowance,
  getAvailableBalance,
  getBigWalletBalance,
  getLockedBalance,
  getWalletBalance,
  withdraw,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import { ToastDescription, Txmonitor } from "../components/TxMonitoring";
import { ShrubBalance, SupportedCurrencies } from "../types";
import { Currencies } from "../constants/currencies";

const { Zero } = ethers.constants;

function HomeView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const {
    isOpen: isTestTokenModalOpen,
    onOpen: onTestTokenModalOpen,
    onClose: onTestTokenModalClose,
  } = useDisclosure();
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const addNetwork = useAddNetwork();
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const toast = useToast();
  const connectedColor = useColorModeValue("green.100", "teal.500");
  const bgConnect = useColorModeValue("white", "dark.100");
  const questionColor = useColorModeValue("blue", "yellow.300");
  const stepsColor = useColorModeValue("white", "black");
  const connectedStepColor = useColorModeValue("green.400", "white");
  const stepsBg = useColorModeValue("yellow.300", "gray.500");
  const connectedStepBg = useColorModeValue("white", "dark.100");
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const mobileStepsBtnBg = useColorModeValue(
    "linear(to-r, sprout.200, teal.200)",
    "linear(to-l, blue.700, teal.700)"
  );
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);
  const [isBuyingSUSD, setIsBuyingSUSD] = useBoolean();

  // Copied from OptionDetails
  const {
    active,
    library,
    account,
    error: web3Error,
    chainId,
  } = useWeb3React();
  const [balances, setBalances] = useState<{
    shrub: { baseAsset: BigNumber; quoteAsset: BigNumber };
    wallet: { baseAsset: BigNumber; quoteAsset: BigNumber };
    optionPosition: BigNumber;
  }>();

  function openTestFaucetModal() {
    setIsBuyingSUSD.on();
    onTestTokenModalOpen();
  }

  function handleConnect() {
    if (!account) {
      if (!!web3Error && getErrorMessage(web3Error).title === "Wrong Network") {
        return addNetwork();
      } else {
        return onConnectWalletOpen();
      }
    }

    console.log(addNetwork);
    return addNetwork();
  }

  // Get balances
  useEffect(() => {
    const quoteAsset = "0x6b1eDb6Da018865efc22cF7d2574c7b878e2E445"; // sMATIC
    const baseAsset = "0x7891337f1360713c47240Ac94d31a3FF25D62c9D"; // sUSD

    console.log("useEffect - 1 - get balances");
    async function main() {
      if (!account) {
        return;
      }
      await setTimeout(() => Promise.resolve(), 50);
      const bigQuoteAssetBalanceShrub = await getAvailableBalance({
        address: account,
        tokenContractAddress: quoteAsset,
        provider: library,
      });
      const bigBaseAssetBalanceShrub = await getAvailableBalance({
        address: account,
        tokenContractAddress: baseAsset,
        provider: library,
      });
      const { bigBalance: bigQuoteAssetBalanceWallet } =
        await getBigWalletBalance(quoteAsset, library);
      const { bigBalance: bigBaseAssetBalanceWallet } =
        await getBigWalletBalance(baseAsset, library);
      const optionPosition = ethers.constants.Zero;
      setBalances({
        shrub: {
          quoteAsset: bigQuoteAssetBalanceShrub,
          baseAsset: bigBaseAssetBalanceShrub,
        },
        wallet: {
          baseAsset: bigBaseAssetBalanceWallet,
          quoteAsset: bigQuoteAssetBalanceWallet,
        },
        optionPosition,
      });
    }
    main().catch(console.error);
  }, [active, account, pendingTxsState]);

  const step1complete = !!account;
  const step2complete =
    balances &&
    balances.shrub &&
    balances.wallet &&
    (!balances.shrub.baseAsset.eq(Zero) || !balances.wallet.baseAsset.eq(Zero));
  const step3complete =
    balances && balances.shrub && !balances.shrub.baseAsset.eq(Zero);

  const alertColor = useColorModeValue("gray.100", "dark.300");
  const [withdrawDepositAction, setWithdrawDepositAction] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [walletTokenBalance, setWalletTokenBalance] = useState("");
  const [approving, setApproving] = useState(false);
  const [activeHash, setActiveHash] = useState<string>();
  const [shrubBalance, setShrubBalance] = useState({
    locked: { MATIC: 0, SMATIC: 0, SUSD: 0 },
    available: { MATIC: 0, SMATIC: 0, SUSD: 0 },
  } as ShrubBalance);
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();
  const [amountValue, setAmountValue] = useState("0");
  const [modalCurrency, setModalCurrency] =
    useState<SupportedCurrencies>("SUSD");
  // radio buttons
  const format = (val: string) => val;
  const parse = (val: string) => val.replace(/^\$/, "");
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "currency",
    defaultValue: modalCurrency,
    onChange: (value: SupportedCurrencies) => setModalCurrency(value),
  });
  const [showDepositButton, setShowDepositButton] = useState(false);
  const btnBg = useColorModeValue("sprout", "teal");

  const connectWalletTimeout = useRef<NodeJS.Timeout>();

  // shrub balance display
  useEffect(() => {
    setLocalError("");
    async function shrubBalanceHandler() {
      await setTimeout(() => Promise.resolve(), 50);
      if (!active || !account) {
        connectWalletTimeout.current = setTimeout(() => {
          handleErrorMessages({ customMessage: "Please connect your wallet" });
          console.error("Please connect wallet");
        }, 500);
        return;
      }
      if (connectWalletTimeout.current) {
        clearTimeout(connectWalletTimeout.current);
      }

      const shrubBalanceObj: ShrubBalance = { locked: {}, available: {} };
      for (const currencyObj of Object.values(Currencies)) {
        const { symbol, address: tokenContractAddress } = currencyObj;
        const bigBalance = await getAvailableBalance({
          address: account,
          tokenContractAddress,
          provider: library,
        });
        const bigLockedBalance = await getLockedBalance(
          account,
          tokenContractAddress,
          library
        );
        const balance = ethers.utils.formatUnits(bigBalance, 18);
        const lockedBalance = ethers.utils.formatUnits(bigLockedBalance, 18);
        shrubBalanceObj.available[symbol] = Number(balance);
        shrubBalanceObj.locked[symbol] = Number(lockedBalance);
      }
      setShrubBalance(shrubBalanceObj);
    }
    shrubBalanceHandler().catch(console.error);
  }, [active, account, library, pendingTxsState]);

  // determine if approved
  useEffect(() => {
    console.log("running setIsApproved");
    if (!library) {
      return;
    }
    async function handleApprove() {
      await setTimeout(() => Promise.resolve(), 50);
      setWalletTokenBalance("-");
      if (modalCurrency !== "MATIC") {
        try {
          const allowance = await getAllowance(
            Currencies[modalCurrency].address,
            library
          );
          console.log(allowance);
          if (allowance.gt(ethers.BigNumber.from(0))) {
            setIsApproved(true);
          } else {
            setIsApproved(false);
          }
        } catch (e: any) {
          handleErrorMessages(e);
          console.error(e);
        }
        try {
          const balance = await getWalletBalance(
            Currencies[modalCurrency].address,
            library
          );
          setWalletTokenBalance(balance);
        } catch (e: any) {
          handleErrorMessages(e);
          console.error(e);
        }
      }
    }
    handleApprove();
  }, [modalCurrency, account, pendingTxsState, active]);

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
    setLocalError("");
    // setAmountValue('');
    setModalCurrency(modalCurrency);
  }

  function handleWithdrawDepositModalOpen(buttonText?: any) {
    return async function handleClick() {
      onOpenModal();
      setWithdrawDepositAction(buttonText);
      setLocalError("");
      // setAmountValue('');
      setModalCurrency(modalCurrency);
    };
  }

  // inside withdraw deposit modal
  async function handleDepositWithdraw(event: any, approve?: string) {
    try {
      if (!active || !account) {
        handleErrorMessages({ customMessage: "Please connect your wallet" });
        return;
      }
      setApproving(true);
      let tx;
      if (approve === "approve") {
        setShowDepositButton(true);
        tx = await approveToken(
          Currencies[modalCurrency].address,
          ethers.utils.parseUnits(amountValue || "0"),
          library
        );
      } else if (withdrawDepositAction === "Deposit") {
        setShowDepositButton(false);
        if (modalCurrency === "MATIC") {
          tx = await depositEth(ethers.utils.parseUnits(amountValue), library);
        } else {
          // Deposit SUSD
          tx = await depositToken(
            Currencies[modalCurrency].address,
            ethers.utils.parseUnits(amountValue),
            library
          );
        }
      } else {
        setShowDepositButton(false);
        // Withdraw
        tx = await withdraw(
          Currencies[modalCurrency].address,
          ethers.utils.parseUnits(amountValue),
          library
        );
      }
      setApproving(false);
      const description =
        approve === "approve"
          ? "Approving SUSD"
          : `${withdrawDepositAction} ${amountValue} ${modalCurrency}`;
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait();
        const toastDescription = ToastDescription(
          description,
          receipt.transactionHash,
          chainId
        );
        toast({
          title: "Transaction Confirmed",
          description: toastDescription,
          status: "success",
          isClosable: true,
          variant: "solid",
          position: "top-right",
        });
        pendingTxsDispatch({
          type: "update",
          txHash: receipt.transactionHash,
          status: "confirmed",
        });
      } catch (e: any) {
        const toastDescription = ToastDescription(
          description,
          e.transactionHash,
          chainId
        );
        pendingTxsDispatch({
          type: "update",
          txHash: e.transactionHash || e.hash,
          status: "failed",
        });
        toast({
          title: "Transaction Failed",
          description: toastDescription,
          status: "error",
          isClosable: true,
          variant: "solid",
          position: "top-right",
        });
      }
    } catch (e: any) {
      setApproving(false);
      setShowDepositButton(false);
      handleErrorMessages({ err: e });
    }
  }
  async function fillSendMax() {
    if (withdrawDepositAction === "Deposit") {
      const walletBalanceValue = await getWalletBalance(
        Currencies[modalCurrency].address,
        library
      );
      setAmountValue(walletBalanceValue);
    } else if (withdrawDepositAction === "Withdraw") {
      setAmountValue(String(shrubBalance.available[modalCurrency]));
    }
  }

  return (
    <>
      <Container
        mt={isMobile ? 30 : 50}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.lg"
      >
        <Center mt={10}>
          <Box mb={10}>
            <Heading
              maxW="60rem"
              fontSize={["5xl", "6xl", "90px", "90px"]}
              fontWeight="bold"
              textAlign="center"
            >
              <Text as="span">Shrub</Text>
              <Text
                as="span"
                bgGradient="linear(to-l, #7928CA, #FF0080)"
                bgClip="text"
              >
                {" "}
                Beta
              </Text>
            </Heading>
            <Text
              mt="3"
              mb={{ base: "16px", md: "20", lg: "20" }}
              color={useColorModeValue("gray.500", "gray.400")}
              fontSize="18px"
              textAlign="center"
              px={["4rem", "5rem", "17rem", "17rem"]}
            >
              {isMobile
                ? "Get started in 3 easy steps"
                : "Practice crypto options trading on the Polygon Mumbai blockchain"}
            </Text>

            {!isMobile && (
              <Box maxW="60rem" mb={8} textAlign={"center"}>
                <Heading fontSize="50px">Get started in 3 easy steps!</Heading>
              </Box>
            )}
            <Flex
              direction={{ base: "column", md: "row", lg: "row" }}
              alignItems={{ base: "center", md: "center", lg: "center" }}
            >
              {!isMobile ? (
                <Box
                  mb={{ base: "10", md: "0", lg: "0" }}
                  maxW="280px"
                  minW="280px"
                  mr={5}
                  shadow="2xl"
                  bg={step1complete ? connectedColor : bgConnect}
                  borderRadius="2xl"
                  overflow="hidden"
                >
                  <Box p={6}>
                    <Stack py={6} align={"center"}>
                      <Circle
                        w="100px"
                        h="100px"
                        bg={step1complete ? connectedStepBg : stepsBg}
                        color={step1complete ? connectedStepColor : stepsColor}
                      >
                        <Box as="span" fontWeight="bold" fontSize="6xl">
                          {!step1complete ? 1 : <CheckIcon />}
                        </Box>
                      </Circle>
                    </Stack>
                    <Stack align={"center"}>
                      <Heading fontSize={"xl"} fontWeight={"500"}>
                        {step1complete && <PolygonIcon />}{" "}
                        {step1complete
                          ? "Mumbai"
                          : !!web3Error &&
                            getErrorMessage(web3Error).title === "Wrong Network"
                          ? "Connect to Mumbai"
                          : "Connect Wallet"}
                      </Heading>
                      {!step1complete ? (
                        <Popover placement="top" trigger="hover">
                          <PopoverTrigger>
                            <Text
                              color={questionColor}
                              fontWeight={"extrabold"}
                              fontSize={"sm"}
                              cursor="pointer"
                            >
                              Learn More
                            </Text>
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody
                              letterSpacing="wide"
                              textAlign={"left"}
                            >
                              <UnorderedList lineHeight={1.8} fontSize={"sm"}>
                                <ListItem pb={2}>
                                  {" "}
                                  <Text>
                                    {" "}
                                    To beta test Shrub, you need to{" "}
                                    <strong>connect your wallet</strong> to the
                                    Polygon Test Network (Mumbai).
                                  </Text>
                                </ListItem>
                                <ListItem>
                                  {" "}
                                  Click the button below to automatically
                                  connect to Mumbai.
                                </ListItem>
                              </UnorderedList>
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Box>Testnet</Box>
                      )}
                    </Stack>
                    <Button
                      onClick={handleConnect}
                      w={"full"}
                      mt={8}
                      disabled={step1complete}
                      colorScheme={tradingBtnColor}
                      variant={step1complete ? "unstyled" : "solid"}
                      rounded="2xl"
                      _hover={
                        step1complete
                          ? {
                              cursor: "text",
                            }
                          : {
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }
                      }
                    >
                      {step1complete
                        ? "Connected"
                        : !!web3Error &&
                          getErrorMessage(web3Error).title === "Wrong Network"
                        ? "Connect to Mumbai"
                        : "Connect Wallet"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={step1complete}
                  w={"full"}
                  mt={8}
                  p={8}
                  fontSize={"xl"}
                  bgGradient={mobileStepsBtnBg}
                  rounded={"2xl"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                >
                  {account
                    ? "Connected"
                    : !!web3Error &&
                      getErrorMessage(web3Error).title === "Wrong Network"
                    ? "Step 1: Connect to Mumbai"
                    : "Step 1: Connect Wallet"}
                </Button>
              )}
              <Spacer />
              {!isMobile ? (
                <Box
                  mb={{ base: "10", md: "0", lg: "0" }}
                  mr={5}
                  maxW="285px"
                  minW="285px"
                  shadow="2xl"
                  borderRadius="2xl"
                  overflow="hidden"
                  bg={step2complete ? connectedColor : bgConnect}
                >
                  <Box p={6}>
                    <Stack py={6} align={"center"}>
                      <Circle
                        w="100px"
                        h="100px"
                        bg={step2complete ? connectedStepBg : stepsBg}
                        color={step2complete ? connectedStepColor : stepsColor}
                      >
                        <Box as="span" fontWeight="bold" fontSize="6xl">
                          {step2complete ? <CheckIcon /> : 2}
                        </Box>
                      </Circle>
                    </Stack>
                    <Stack align={"center"}>
                      <Heading fontSize={"xl"} fontWeight={"500"}>
                        Get sUSD
                      </Heading>
                      <Popover placement="top" trigger="hover">
                        <PopoverTrigger>
                          <Text
                            color={questionColor}
                            fontSize={"sm"}
                            cursor="pointer"
                            fontWeight={"extrabold"}
                          >
                            Learn More
                          </Text>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverBody letterSpacing="wide" textAlign={"left"}>
                            <UnorderedList fontSize={"sm"} lineHeight={1.8}>
                              <ListItem pb={2}>
                                In <strong>mainnet,</strong> you will{" "}
                                <strong>trade</strong> options in{" "}
                                <strong>MATIC & USDC</strong>.{" "}
                              </ListItem>
                              <ListItem>
                                In <strong>test environment</strong>:
                              </ListItem>
                              <UnorderedList>
                                <ListItem>
                                  <strong>sMATIC </strong>
                                  represents <strong>MATIC</strong>
                                </ListItem>
                                <ListItem>
                                  <strong>sUSD </strong> represents{" "}
                                  <strong>USD stable coin</strong>{" "}
                                </ListItem>
                                <ListItem>
                                  These are{" "}
                                  <strong>Option underlying asset</strong>
                                </ListItem>
                                <ListItem>
                                  <Text>Rate:</Text>
                                  <Text fontSize={"xs"} fontWeight={"bold"}>
                                    1 MATIC = 10,000 sMATIC
                                  </Text>
                                  <Text fontSize={"xs"} fontWeight={"bold"}>
                                    1 MATIC = 10,000 sUSD
                                  </Text>
                                </ListItem>
                              </UnorderedList>
                            </UnorderedList>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Stack>
                    <Button
                      onClick={openTestFaucetModal}
                      disabled={!step1complete || step2complete}
                      w={"full"}
                      mt={8}
                      colorScheme={tradingBtnColor}
                      variant={step2complete ? "unstyled" : "solid"}
                      rounded="2xl"
                      _hover={
                        step2complete
                          ? {
                              cursor: "text",
                            }
                          : {
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }
                      }
                    >
                      {step2complete ? "Complete" : "Get sUSD"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  onClick={openTestFaucetModal}
                  disabled={!step1complete || step2complete}
                  w={"full"}
                  mt={8}
                  p={8}
                  fontSize={"xl"}
                  bgGradient={mobileStepsBtnBg}
                  rounded={"2xl"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                >
                  {step2complete ? "Complete" : "Step 2: Get sUSD"}
                </Button>
              )}
              <Spacer />

              {!isMobile ? (
                <Box
                  maxW="280px"
                  minW="280px"
                  shadow="2xl"
                  borderRadius="2xl"
                  overflow="hidden"
                  bg={step3complete ? connectedColor : bgConnect}
                >
                  <Box p={6}>
                    <Stack py={6} align={"center"}>
                      <Circle
                        w="100px"
                        h="100px"
                        bg={step3complete ? connectedStepBg : stepsBg}
                        color={step3complete ? connectedStepColor : stepsColor}
                      >
                        <Box as="span" fontWeight="bold" fontSize="6xl">
                          {step3complete ? <CheckIcon /> : 3}
                        </Box>
                      </Circle>
                    </Stack>
                    <Stack align={"center"}>
                      <Heading fontSize={"xl"} fontWeight={"500"}>
                        Deposit sUSD
                      </Heading>
                      <Popover placement="top" trigger="hover">
                        <PopoverTrigger>
                          <Text
                            color={questionColor}
                            fontSize={"sm"}
                            cursor="pointer"
                            fontWeight={"extrabold"}
                          >
                            Learn More
                          </Text>
                        </PopoverTrigger>
                        <PopoverContent fontSize="sm">
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverBody letterSpacing="wide" textAlign={"left"}>
                            <Text pb={4}>
                              {" "}
                              To buy Options, you need to deposit sUSD to the
                              Shrub platform.
                            </Text>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Stack>
                    <Button
                      disabled={
                        !step1complete || !step2complete || step3complete
                      }
                      w={"full"}
                      onClick={handleWithdrawDepositModalOpen("Deposit")}
                      mt={8}
                      colorScheme={tradingBtnColor}
                      rounded="2xl"
                      variant={step3complete ? "unstyled" : "solid"}
                      _hover={
                        step3complete
                          ? {
                              cursor: "text",
                            }
                          : {
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }
                      }
                    >
                      {step3complete ? "Complete" : "Deposit sUSD"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  p={8}
                  fontSize={"xl"}
                  bgGradient={mobileStepsBtnBg}
                  rounded={"2xl"}
                  disabled={!step1complete || !step2complete || step3complete}
                  w={"full"}
                  onClick={handleWithdrawDepositModalOpen("Deposit")}
                  mt={8}
                  _hover={
                    step3complete
                      ? {
                          cursor: "text",
                        }
                      : {
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }
                  }
                >
                  {step3complete ? "Complete" : "Step 3: Deposit sUSD"}
                </Button>
              )}
            </Flex>
          </Box>
        </Center>
      </Container>
      <Container mt={25} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
        <Center>
          <Box maxW="60rem" mb={8} textAlign={"center"}>
            <Heading fontSize="50px" letterSpacing={"tight"}>
              Done with 1-2-3 above?
            </Heading>
            <Text
              pt="3"
              mb="8"
              fontSize="18px"
              color={useColorModeValue("gray.500", "gray.500")}
            >
              Sweet. Let's buy some options!
            </Text>
            <Button
              disabled={!step1complete || !step2complete || !step3complete}
              rightIcon={<ArrowForwardIcon />}
              size="lg"
              px="50"
              fontSize="25px"
              py="10"
              colorScheme={tradingBtnColor}
              variant="solid"
              borderRadius="full"
              _hover={{ transform: "translateY(-2px)" }}
              bgGradient={
                step1complete && step2complete && step3complete
                  ? "linear(to-r,#74cecc,green.300,blue.400)"
                  : undefined
              }
              as={ReachLink}
              to={"/options"}
            >
              Start Trading
            </Button>
          </Box>
        </Center>
      </Container>

      <Modal
        isOpen={isTestTokenModalOpen}
        onClose={onTestTokenModalClose}
        motionPreset="slideInBottom"
        scrollBehavior={isMobile ? "inside" : "outside"}
        size={isMobile ? "full" : "md"}
      >
        <ModalOverlay />
        <ModalContent
          boxShadow="dark-lg"
          borderRadius={isMobile ? "none" : "2xl"}
        >
          <ModalHeader> Get sUSD</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Faucet hooks={{ isBuyingSUSD, setIsBuyingSUSD }} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/*withdraw deposit modal*/}
      <Modal
        motionPreset="slideInBottom"
        onClose={handleWithdrawDepositModalClose}
        isOpen={isOpenModal}
        size={isMobile ? "full" : "md"}
        scrollBehavior={isMobile ? "inside" : "outside"}
      >
        <ModalOverlay />
        <ModalContent borderRadius={isMobile ? "none" : "2xl"}>
          <ModalHeader>{withdrawDepositAction} sUSD</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!approving && !activeHash && (
              <>
                <Stack direction={["column"]} spacing="40px" mb="40px">
                  {localError && (
                    <SlideFade in={true} unmountOnExit={true}>
                      <Alert status="error" borderRadius={9}>
                        <AlertIcon />
                        {localError}
                      </Alert>
                    </SlideFade>
                  )}

                  {(modalCurrency === "MATIC" ||
                    (isApproved && withdrawDepositAction === "Deposit") ||
                    withdrawDepositAction === "Withdraw") && (
                    <FormControl id="amount">
                      <Flex pt={4}>
                        <Spacer />
                        <Button
                          variant={"link"}
                          colorScheme={"black"}
                          size={"xs"}
                          mb={3}
                          rounded={"lg"}
                          onClick={fillSendMax}
                        >
                          MAX:{" "}
                          {withdrawDepositAction === "Deposit"
                            ? walletTokenBalance
                            : String(shrubBalance.available[modalCurrency])}
                        </Button>
                      </Flex>

                      <NumberInput
                        onChange={(valueString) =>
                          setAmountValue(parse(valueString))
                        }
                        value={format(amountValue)}
                        size="lg"
                      >
                        <NumberInputField
                          h="6rem"
                          rounded="3xl"
                          shadow="sm"
                          fontWeight="bold"
                          fontSize="2xl"
                        />
                        <InputRightElement
                          pointerEvents="none"
                          p={14}
                          children={
                            <FormLabel
                              htmlFor="amount"
                              color="gray.500"
                              fontWeight="bold"
                            >
                              sUSD
                            </FormLabel>
                          }
                        />
                      </NumberInput>
                    </FormControl>
                  )}
                </Stack>
                {modalCurrency !== "MATIC" &&
                  withdrawDepositAction === "Deposit" &&
                  !isApproved && (
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
                        colorScheme={btnBg}
                        size={"lg"}
                        isFullWidth={true}
                        rounded="2xl"
                        onClick={() => {
                          if (active) {
                            handleDepositWithdraw(undefined, "approve");
                          }
                        }}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                {(modalCurrency === "MATIC" ||
                  isApproved ||
                  withdrawDepositAction === "Withdraw") && (
                  <Button
                    rounded="2xl"
                    mb={1.5}
                    size={"lg"}
                    colorScheme={btnBg}
                    isFullWidth={true}
                    isDisabled={amountValue === "0" || amountValue === ""}
                    onClick={handleDepositWithdraw}
                  >
                    {withdrawDepositAction}
                  </Button>
                )}
              </>
            )}
            {(approving || activeHash) && (
              <Txmonitor
                txHash={activeHash}
                showDeposit={showDepositButton}
                goToDeposit={goToDeposit}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isConnectWalletOpen}
        onClose={onConnectWalletClose}
        motionPreset="slideInBottom"
        scrollBehavior={isMobile ? "inside" : "outside"}
      >
        <ModalOverlay />
        <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">
          <ModalHeader>
            {!active ? (
              "Connect Wallet"
            ) : !isHidden ? (
              <Text fontSize={16}>Account Details</Text>
            ) : (
              <Button variant="ghost" onClick={() => displayStatus(false)}>
                Back
              </Button>
            )}{" "}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!active || isHidden ? (
              <ConnectWalletModal />
            ) : (
              !isHidden && <ConnectionStatus displayStatus={displayStatus} />
            )}
            {!(
              web3Error && getErrorMessage(web3Error).title === "Wrong Network"
            ) && <TxStatusList />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default HomeView;
