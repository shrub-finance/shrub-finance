import {
  Box,
  Heading,
  Text,
  Button,
  Center,
  useColorModeValue,
  Container,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  toast,
  useToast,
  SlideFade,
  Alert,
  AlertIcon,
  Link,
  Icon,
  Spacer,
  Flex,
  useColorMode,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import React, { useContext, useEffect, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { ToastDescription, TxStatusList } from "../components/TxMonitoring";
import {
  getBigWalletBalance,
  getAllowance,
  approveToken,
  toEthDate,
  fromEthDate,
  mint,
  mintPot,
  balanceOfErc1155,
} from "../utils/ethMethods";
import { TxContext } from "../components/Store";
import Confetti from "../assets/Confetti";
import { BigNumber, ethers } from "ethers";
import CountdownTimer from "../components/CountdownTimer";

type Phase = "before" | "mint" | "done";

const PAPERPOTMINT_ADDRESS = process.env.REACT_APP_PAPERPOTMINT_ADDRESS || "";
const PAPER_POT_ADDRESS = process.env.REACT_APP_PAPER_POT_ADDRESS || "";

function sIfMany(n: ethers.BigNumberish) {
  const bigN = ethers.BigNumber.from(n);
  return bigN.eq(1) ? "" : "s";
}

function MintPotView(props: RouteComponentProps) {
  const { Zero } = ethers.constants;
  const WETHAddress = process.env.REACT_APP_WETH_TOKEN_ADDRESS || "";
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [wethAllowance, setWethAllowance] = useState(Zero);
  const [accountPotCount, setAccountPotCount] = useState(Zero);
  const [phase, setPhase] = useState<Phase>();
  const [timerDate, setTimerDate] = useState<Date>();

  const toast = useToast();
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const { colorMode } = useColorMode();
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);
  const [walletTokenBalance, setWalletTokenBalance] = useState<BigNumber>();
  const [approving, setApproving] = useState(false);

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const bgColor = useColorModeValue("gray.100", "blackAlpha.400");
  const format = (val: string) => val;

  const [amountValue, setAmountValue] = useState("1");
  const invalidEntry = Number(amountValue) < 0 || isNaN(Number(amountValue));

  const mintPrice = ethers.constants.WeiPerEther.mul(50).div(1000); // 0.05 Eth
  const mintStartDate = toEthDate(new Date("2022-06-25T14:00:00Z"));
  const mintEndDate = toEthDate(new Date("2022-06-26T14:00:00Z"));
  const maxMintAmount = 10;

  async function handleBlockchainTx(
    description: string,
    callbackTx: () => Promise<ethers.ContractTransaction>
  ) {
    setLocalError("");
    setIsMinted(false);
    setIsLoading(true);
    try {
      if (!mintPrice) {
        throw new Error("mintPrice not found");
      }
      const tx = await callbackTx();
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait();
        setIsLoading(false);
        setIsMinted(true);
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
        setIsLoading(false);
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
      setIsLoading(false);
      handleErrorMessages({ err: e });
    }
  }

  function handleApprove() {
    return handleBlockchainTx("Approving WETH", () => {
      return approveToken(
        WETHAddress,
        ethers.BigNumber.from(amountValue).mul(mintPrice || 0),
        PAPERPOTMINT_ADDRESS,
        library
      );
    });
  }

  async function handleMintPot() {
    return handleBlockchainTx("Paper Pot Mint Successful!", () =>
      mintPot(amountValue, library)
    );
  }

  // Move errors to the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  // useEffect to set the phase
  useEffect(() => {
    const now = toEthDate(new Date());

    const phase =
      now < mintStartDate ? "before" : now < mintEndDate ? "mint" : "done";

    setPhase(phase);
    console.log(phase);

    const timerD =
      phase === "before"
        ? fromEthDate(mintStartDate)
        : phase === "mint"
        ? fromEthDate(mintEndDate)
        : undefined;
    setTimerDate(timerD);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  // useEffect for account
  useEffect(() => {
    if (!library || !account || !phase) {
      return;
    }

    async function accountAsync() {
      if (!account) {
        return;
      }

      // Check if account has pots
      try {
        const potCount = await balanceOfErc1155(PAPER_POT_ADDRESS, 1, library);
        setAccountPotCount(potCount);
      } catch (e) {
        console.error(e);
        // Continue along if this fails - it does not affect the rest of the chain
      }

      // Check the wallet balance
      try {
        const balanceObj = await getBigWalletBalance(WETHAddress, library);
        const { bigBalance } = balanceObj;
        setWalletTokenBalance(bigBalance);
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
        return;
      }

      // Check if approved for the balance amount
      try {
        const allowance = await getAllowance(
          WETHAddress,
          PAPERPOTMINT_ADDRESS,
          library
        );
        setWethAllowance(allowance);
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
        return;
      }
    }

    accountAsync();
  }, [account, phase, pendingTxsState]);

  const tooLarge =
    phase === "mint" &&
    ethers.BigNumber.from(amountValue || 0).gt(maxMintAmount);
  const noFunds =
    walletTokenBalance &&
    mintPrice &&
    walletTokenBalance.lt(mintPrice.mul(amountValue || 0));
  const noAllowance =
    mintPrice && wethAllowance.lt(mintPrice.mul(amountValue || 0));

  return (
    <>
      <Container
        mt={isMobile ? 30 : 0}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW="container.sm"
      >
        {isMinted && <Confetti />}
        <Center mt={12}>
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Alert status="error" borderRadius={9}>
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )}
        </Center>
        <Center mt={10}>
          <Box mb={{ base: 6, md: 10 }}>
            <Heading
              textAlign={"center"}
              fontSize={{ base: "30px", md: "60px" }}
              letterSpacing={"tight"}
              bgGradient="gold.100"
              maxW={{ base: "20rem", md: "40rem" }}
            >
              &#127881;Pot{" "}
              <Text
                as="span"
                background="gold.100"
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                Sale
              </Text>
              &#127881;
            </Heading>
            <Center mt={4} display={{ base: "flex", md: "flex", lg: "none" }}>
              {timerDate && <CountdownTimer targetDate={timerDate} />}
            </Center>

            <Center p={4} rounded="3xl" mt={{ base: 5, md: 0 }} mb={4}>
              <Box fontWeight="semibold">
                <Text fontSize={{ base: "md", md: "lg" }}>
                  You currently have {accountPotCount.toString()} Pot
                  {sIfMany(accountPotCount)}
                </Text>
                <Text fontSize={{ base: "md", md: "lg" }} pt={2}>
                  Mint price per pot {ethers.utils.formatEther(mintPrice)} WETH
                </Text>
              </Box>
            </Center>

            {/*Input boxes*/}
            {["mint"].includes(phase || "") && (
              <Box
                shadow={!isMobile ? "dark-lg" : undefined}
                p={!isMobile ? 6 : undefined}
                borderRadius={!isMobile ? "3xl" : undefined}
              >
                <VStack pt={2}>
                  <Box>
                    <FormLabel
                      fontSize={"sm"}
                      color={"gray.500"}
                      fontWeight={"medium"}
                    >
                      Quantity
                    </FormLabel>
                    <NumberInput
                      isInvalid={invalidEntry}
                      min={0}
                      max={10}
                      precision={0}
                      onChange={(valueString) => {
                        const [integerPart, decimalPart] =
                          valueString.split(".");
                        if (valueString.includes(".")) {
                          setAmountValue(integerPart || "0");
                          return;
                        }
                        if (integerPart && integerPart.length > 2) {
                          return;
                        }
                        if (valueString === "00") {
                          return;
                        }
                        if (isNaN(Number(valueString))) {
                          return;
                        }
                        if (
                          Number(valueString) !==
                          Math.round(Number(valueString) * 1e6) / 1e6
                        ) {
                          setAmountValue(Number(valueString).toFixed(6));
                          return;
                        }
                        setAmountValue(valueString);
                      }}
                      value={format(amountValue)}
                      size="lg"
                    >
                      <NumberInputField
                        h="6rem"
                        borderRadius="3xl"
                        shadow="sm"
                        fontWeight="medium"
                        fontSize="2xl"
                      />
                      <InputRightElement
                        pointerEvents="none"
                        p={14}
                        children={
                          <FormLabel
                            htmlFor="amount"
                            color="gray.500"
                            fontWeight="medium"
                          >
                            pots
                          </FormLabel>
                        }
                      />
                    </NumberInput>
                  </Box>
                  <Box>
                    <FormLabel
                      fontSize={"sm"}
                      color={"gray.500"}
                      fontWeight={"medium"}
                      pt={4}
                    >
                      Total
                    </FormLabel>

                    <Box
                      bg={bgColor}
                      borderRadius="3xl"
                      fontWeight="medium"
                      fontSize="2xl"
                      p={"1.813rem"}
                      w="325px"
                    >
                      {invalidEntry
                        ? "?"
                        : format(
                            mintPrice
                              ? ethers.utils.formatEther(
                                  mintPrice.mul(Number(amountValue))
                                )
                              : "-"
                          )}{" "}
                      WETH
                    </Box>
                  </Box>
                </VStack>
                {/*button*/}
                {!isMobile && (
                  <Text
                    mt="3"
                    fontSize="14px"
                    textAlign="center"
                    fontWeight="medium"
                    background="gold.100"
                    bgClip="text"
                    sx={{
                      "-webkit-text-stroke":
                        colorMode === "light" ? "1px #7e5807" : "transparent",
                    }}
                  >
                    Time to get your pot. Let's go!
                  </Text>
                )}
                <Center pt={6}>
                  {
                    <Button
                      onClick={noAllowance ? handleApprove : handleMintPot}
                      colorScheme={tradingBtnColor}
                      variant="solid"
                      rounded="2xl"
                      isLoading={isLoading}
                      isDisabled={
                        Number(amountValue) <= 0 || noFunds || tooLarge
                      }
                      size="lg"
                      px={["50", "70", "90", "90"]}
                      fontSize="25px"
                      py={10}
                      borderRadius="full"
                      _hover={{ transform: "translateY(-2px)" }}
                      bgGradient={"linear(to-r, #74cecc, green.300, blue.400)"}
                      loadingText={noAllowance ? "Approving..." : "Minting..."}
                    >
                      {
                        // If no account then Wrong Network and Connect Wallet
                        !account
                          ? !!web3Error &&
                            getErrorMessage(web3Error).title === "Wrong Network"
                            ? "Connect to Polygon"
                            : "Connect Wallet"
                          : tooLarge
                          ? `Quantity above allowed (max ${maxMintAmount.toString()})`
                          : noFunds
                          ? "Insufficient funds"
                          : noAllowance
                          ? "Approve WETH"
                          : "Mint Pot"
                      }
                    </Button>
                  }
                </Center>
              </Box>
            )}
          </Box>
        </Center>
      </Container>
      <Box
        position={{ base: "static", md: "static", lg: "fixed", xl: "fixed" }}
        bottom={0}
        left={4}
      >
        {!isMobile && timerDate && (
          <Box maxW="60rem" mb={4} mt={{ base: 10, md: 20 }}>
            <Text
              fontSize="sm"
              fontWeight={"bold"}
              color={useColorModeValue("gray.600", "gray.400")}
            >
              Sale End In:
            </Text>
            <Text
              fontSize={{ base: "20px", md: "20px", lg: "20px", xl: "30px" }}
              fontWeight="semibold"
            >
              <CountdownTimer targetDate={timerDate} />
            </Text>
          </Box>
        )}
        <Box fontSize={"xs"} color={useColorModeValue("gray.600", "gray.300")}>
          <Text fontWeight="bold">Paper Pot Address:</Text>
          <Text fontWeight="md"> {PAPERPOTMINT_ADDRESS}</Text>
          <Text fontWeight="bold">WETH Address:</Text>
          <Text fontWeight="md"> {WETHAddress}</Text>
        </Box>
      </Box>

      <Modal
        isOpen={isConnectWalletOpen}
        onClose={onConnectWalletClose}
        motionPreset="slideInBottom"
        scrollBehavior={isMobile ? "inside" : "outside"}
        size={isMobile ? "full" : "md"}
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

export default MintPotView;
