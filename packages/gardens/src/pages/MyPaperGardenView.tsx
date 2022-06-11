import {
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
  SlideFade,
  Alert,
  AlertIcon,
  Image,
  Link,
  Spinner,
  Box,
  Grid,
  DrawerCloseButton,
  DrawerOverlay,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  Drawer,
  VStack,
  useBreakpointValue,
  useColorMode,
  HStack,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  useToast,
  GridItem,
} from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import React, { useContext, useEffect, useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { isMobile } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import { useLazyQuery } from "@apollo/client";
import {
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "../components/ConnectWallet";
import { ToastDescription, TxStatusList } from "../components/TxMonitoring";
import { MY_GARDENS_QUERY } from "../constants/queries";
import { SeedBasketImg } from "../assets/Icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import SeedDetails from "../components/SeedDetails";
import { BigNumber, ethers } from "ethers";
import { TxContext } from "../components/Store";
import {
  accountWL,
  approveToken,
  balanceOfErc1155,
  getAllowance,
  getBigWalletBalance,
  getTicketData,
  redeemNFTTicket,
} from "../utils/ethMethods";
import CountdownTimer from "../components/CountdownTimer";
import GardenGrid from "../components/GardenGrid";
import { IMAGE_ASSETS } from "../utils/imageAssets";

function MyPaperGardenView(props: RouteComponentProps) {
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure();
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const drawerSize = useBreakpointValue({
    base: "xs",
    md: "sm",
  });
  //@ts-ignore
  const openDrawer: boolean = useBreakpointValue({
    base: isOpen,
    md: false,
  });

  const btnShadow = useColorModeValue("md", "dark-lg");

  const [isHidden, setIsHidden] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mySeedRows, setMySeedRows] = useState<JSX.Element[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    tokenId: string;
    name: string;
    emotion: string;
    type: string;
    dna: number;
    imageUrl: string;
    category: string;
    quantity?: number;
    growth?: number;
  }>({
    tokenId: "",
    name: "",
    emotion: "",
    type: "",
    dna: 0,
    imageUrl: "",
    category: "",
  });
  const [redeemAmount, setRedeemAmount] = useState("1");

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const { Zero } = ethers.constants;

  // FROM NFTTICKET VIEW
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;
  const [activeHash, setActiveHash] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [wethAllowance, setWethAllowance] = useState(Zero);
  const [ticketData, setTicketData] = useState<any>();
  const [timerDate, setTimerDate] = useState<Date>();
  const [redeemPrice, setRedeemPrice] = useState<BigNumber>();
  const [accountTicketCount, setAccountTicketCount] = useState(Zero);
  const toast = useToast();
  const tradingBtnColor = useColorModeValue("sprout", "teal");
  const { colorMode } = useColorMode();
  const [walletTokenBalance, setWalletTokenBalance] = useState<BigNumber>();
  const [approving, setApproving] = useState(false);

  const NFT_TICKET_TOKEN_ID = process.env.REACT_APP_TICKET_TOKEN_ID || "";
  const NFT_TICKET_ADDRESS = process.env.REACT_APP_NFT_TICKET_ADDRESS || "";
  const WETHAddress = process.env.REACT_APP_WETH_TOKEN_ADDRESS || "";

  const bgColor = useColorModeValue("gray.100", "blackAlpha.400");
  const format = (val: string) => val;
  const [
    getMySeedDataQuery,
    { loading: mySeedDataLoading, error: mySeedDataError, data: mySeedData },
  ] = useLazyQuery(MY_GARDENS_QUERY, {
    variables: {
      user: account && account.toLowerCase(),
    },
  });
  const invalidEntry = Number(redeemAmount) < 0 || isNaN(Number(redeemAmount));

  // console.log(mySeedData);
  const holdsSeed = mySeedData && mySeedData.seeds && mySeedData.seeds.length;
  const tickets =
    mySeedData && mySeedData.user && Number(mySeedData.user.ticketCount);
  const fungibleAssets: { [asset: string]: number } = mySeedData &&
    mySeedData.user && {
      pots: Number(mySeedData.user.potCount),
      water: Number(mySeedData.user.waterCount),
      fertilizer: Number(mySeedData.user.fertilizerCount),
    };
  const holdsFungibleAsset =
    fungibleAssets && Object.values(fungibleAssets).some((val) => val > 0);
  const holdsPottedPlant =
    mySeedData &&
    mySeedData.user &&
    mySeedData.user.pottedPlants &&
    mySeedData.user.pottedPlants.length;
  // console.log(fungibleAssets);
  // console.log(holdsFungibleAsset);

  const tooLarge =
    tickets && ethers.BigNumber.from(redeemAmount || 0).gt(tickets);
  const noFunds =
    walletTokenBalance &&
    redeemPrice &&
    walletTokenBalance.lt(redeemPrice.mul(redeemAmount || 0));
  const noAllowance =
    redeemPrice && wethAllowance.lt(redeemPrice.mul(redeemAmount || 0));

  // run on init - setTicketData
  useEffect(() => {
    if (!library) {
      return;
    }
    async function init() {
      console.log("getting ticketData");
      const td = await getTicketData(NFT_TICKET_TOKEN_ID, library);
      const {
        contractAddress,
        startDate,
        endDate,
        redeemPrice,
        maxSupply,
        active,
        paused,
      } = td;
      setTicketData({
        contractAddress,
        startDate,
        endDate,
        redeemPrice,
        maxSupply,
        active,
        paused,
      });
      console.log(td);
    }
    init().catch((err) => console.error(err));
  }, [library]);

  // big useEffect from setTicketData to get a bunch of stuff - on account change
  // useEffect for account
  useEffect(() => {
    console.log(ticketData);
    if (!library || !account || !ticketData) {
      return;
    }
    console.log("running useEffect-account");

    async function accountAsync() {
      if (!account) {
        return;
      }
      // Check if account has tickets
      console.log("checking ticket count");
      try {
        const ticketCount = await balanceOfErc1155(
          NFT_TICKET_ADDRESS,
          NFT_TICKET_TOKEN_ID,
          library
        );
        setAccountTicketCount(ticketCount);
      } catch (e) {
        console.error(e);
        // Continue along if this fails - it does not affect the rest of the chain
      }

      // Check the redemption price
      console.log("checking redemption price");
      try {
        setRedeemPrice(ticketData.redeemPrice);
      } catch (e: any) {
        handleErrorMessages(e);
        console.error(e);
        return;
      }

      // Check the wallet balance
      console.log("checking balance");
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
      console.log("checking approved");
      try {
        const allowance = await getAllowance(
          WETHAddress,
          NFT_TICKET_ADDRESS,
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
  }, [account, ticketData]);

  useEffect(() => {
    setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  useEffect(() => {
    console.log(mySeedData);
    const tempMySeedDataRows: JSX.Element[] = [];

    if (holdsFungibleAsset) {
      // handle pots
      if (fungibleAssets.pots) {
        tempMySeedDataRows.push(
          <GardenGrid
            id={"pot"}
            name={`Pot x ${fungibleAssets.pots}`}
            onClick={() => {
              setSelectedItem({
                tokenId: "1",
                name: "Empty Pot",
                emotion: "empty",
                type: "pot",
                dna: 0,
                imageUrl: IMAGE_ASSETS.emptyPot,
                category: "pot",
                quantity: fungibleAssets.pots,
              });
              onOpen();
            }}
            imgCallback={() => IMAGE_ASSETS.emptyPot}
          />
        );
      }
      // handle water
      if (fungibleAssets.water) {
        tempMySeedDataRows.push(
          <GardenGrid
            id={"water"}
            name={`Water x ${fungibleAssets.water}`}
            onClick={() => {
              setSelectedItem({
                tokenId: "3",
                name: "Water",
                emotion: "empty",
                type: "water",
                dna: 0,
                imageUrl: IMAGE_ASSETS.waterCan,
                category: "water",
                quantity: fungibleAssets.water,
              });
              onOpen();
            }}
            imgCallback={() => IMAGE_ASSETS.waterCan}
          />
        );
      }
      // handle fertilizer
      if (fungibleAssets.fertilizer) {
        tempMySeedDataRows.push(
          <GardenGrid
            id={"fertilizer"}
            name={`Fertilizer x ${fungibleAssets.fertilizer}`}
            onClick={() => {
              setSelectedItem({
                tokenId: "2",
                name: "Fertilizer",
                emotion: "empty",
                type: "water",
                dna: 0,
                imageUrl: IMAGE_ASSETS.fertilizer,
                category: "fertilizer",
                quantity: fungibleAssets.fertilizer,
              });
              onOpen();
            }}
            imgCallback={() => IMAGE_ASSETS.fertilizer}
          />
        );
      }
    }

    if (holdsPottedPlant) {
      // id, name, image
      for (const pottedPlant of mySeedData.user.pottedPlants) {
        const { id, growth, seed } = pottedPlant;
        const { name, dna, emotion, type } = seed;
        const imageUrl =
          // @ts-ignore
          IMAGE_ASSETS[`pottedPlant${type}${Math.floor(growth / 2000)}`];
        console.log(`pottedPlant${type}${Math.floor(growth / 2000)}`);
        console.log(imageUrl);
        tempMySeedDataRows.push(
          <GardenGrid
            id={id}
            name={`#${id}`}
            onClick={() => {
              setSelectedItem({
                tokenId: id,
                name: "Potted Plant",
                emotion: emotion,
                type: type,
                dna: dna,
                imageUrl: imageUrl,
                growth: growth,
                category: "pottedPlant",
              });
              onOpen();
            }}
            imgCallback={() => imageUrl}
          />
        );
      }
    }

    if (holdsSeed) {
      const mySeeds: {
        id: string;
        dna: number;
        type: "Wonder" | "Passion" | "Hope" | "Power";
        name: string;
        emotion: "happy" | "sad";
      }[] = [...mySeedData.seeds].sort((a, b) => Number(a.id) - Number(b.id));

      for (const item of mySeeds) {
        const { id, dna, type, name, emotion } = item;
        // let type: 'wonder' | 'passion' | 'hope' | 'power'
        // type = uppercaseType.toLowerCase()
        const seedNumber = name.split("#")[1];
        console.log(type, emotion);
        const imageUrl = IMAGE_ASSETS.seeds[type][emotion];
        tempMySeedDataRows.push(
          <GardenGrid
            id={name}
            name={`#${seedNumber}`}
            onClick={() => {
              setSelectedItem({
                tokenId: id,
                name,
                emotion,
                type,
                dna,
                imageUrl,
                category: "paperSeed",
              });
              onOpen();
            }}
            imgCallback={() => imageUrl}
          />
          // <Box
          //   as="button"
          //   key={name}
          //   // shadow={btnShadow}
          //   shadow={"dark-lg"}
          //   borderRadius="md"
          //   minW={20}
          //   h={32}
          //   p={2}
          //   cursor="pointer"
          //   _hover={{
          //     transform: "translateY(-2px)",
          //     boxShadow: "lg",
          //   }}
          //   _focus={{
          //     borderWidth: "2px",
          //     borderColor: "seed.600",
          //   }}
          //   onClick={() => {
          //     setSelectedItem({ name, emotion, type, dna });
          //     onOpen();
          //   }}
          // >
          //   <VStack>
          //     <Box>
          //       <Image
          //         w={20}
          //         h={20}
          //         src={
          //           emotion === "sad"
          //             ? `https://shrub.finance/${type.toLowerCase()}-sad.svg`
          //             : `https://shrub.finance/${type.toLowerCase()}.svg`
          //         }
          //         alt="Seed"
          //       />
          //     </Box>
          //     <Text fontWeight={600} color="gray.500" fontSize="sm">
          //       #{seedNumber}
          //     </Text>
          //   </VStack>
          // </Box>
        );
      }
      setSelectedItem({
        tokenId: mySeeds[0].id,
        name: mySeeds[0].name,
        emotion: mySeeds[0].emotion,
        type: mySeeds[0].type,
        dna: mySeeds[0].dna,
        imageUrl: IMAGE_ASSETS.seeds[mySeeds[0].type][mySeeds[0].emotion],
        category: "paperSeed",
      });
    }

    // TODO: handle shrubs
    setMySeedRows(tempMySeedDataRows);
    if (mySeedData && mySeedData.seeds) {
      setIsInitialized(true);
    }
  }, [mySeedData]);

  useEffect(() => {
    async function main() {
      if (!account) {
        return;
      }
      getMySeedDataQuery();
    }
    main().catch((err) => {
      handleErrorMessages({ err });
      console.error(err);
    });
  }, [account]);

  // Fun Functions
  async function handleApprove() {
    const description = "Approving WETH";
    try {
      if (!redeemPrice) {
        throw new Error("mintPrice not found");
      }
      const tx = await approveToken(
        WETHAddress,
        ethers.BigNumber.from(redeemAmount).mul(redeemPrice),
        NFT_TICKET_ADDRESS,
        library
      );
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
      handleErrorMessages({ err: e });
    }
  }

  async function handleRedeemNFT() {
    setLocalError("");
    setIsLoading(true);
    const description = "Redeemed NFT Tickets for Pot";
    try {
      if (!redeemPrice) {
        throw new Error("mintPrice not found");
      }
      console.log(NFT_TICKET_TOKEN_ID);
      const tx = await redeemNFTTicket(
        NFT_TICKET_TOKEN_ID,
        redeemAmount,
        library
      );
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
      setIsLoading(false);
      handleErrorMessages({ err: e });
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
        {/*error states*/}
        <Center mt={10} mb={6}>
          {localError && (
            <SlideFade in={true} unmountOnExit={true}>
              <Alert variant={"shrubYellow"} status="info" borderRadius={9}>
                <AlertIcon />
                {localError}
              </Alert>
            </SlideFade>
          )}
        </Center>
        {/*heading*/}
        <Center>
          <VStack mb={{ base: 8, md: 14 }}>
            <Heading
              fontSize={{ base: "30px", md: "30px", lg: "50px" }}
              letterSpacing={"tight"}
              textAlign={"center"}
              maxW="60rem"
            >
              My Paper Garden
            </Heading>
            <Text
              textAlign="center"
              px={"5"}
              fontSize={{ base: "15px", md: "15px", lg: "18px" }}
            >
              Place where seeds grow into Shrubs!
            </Text>
          </VStack>
        </Center>
        {/*NFT Ticket view*/}
        <Container
          mt={isMobile ? 30 : 30}
          p={5}
          flex="1"
          borderRadius="2xl"
          maxW="container.lg"
        >
          <Center>
            <Heading>You have {accountTicketCount.toString()} Tickets</Heading>
          </Center>
          <Center>
            <HStack>
              {/*Ticket info*/}
              <Center mt={{ base: 5, md: 10 }}>
                <Box
                  bgColor={useColorModeValue("gray.200", "gray.700")}
                  p={10}
                  rounded="3xl"
                >
                  <Box
                    fontSize={{ base: "18px", md: "20px" }}
                    mt={4}
                    fontWeight="semibold"
                  >
                    <Text
                      fontSize="sm"
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
                      Redemption Date
                    </Text>
                    <Text>Thursday, June 16</Text>
                  </Box>
                  <Box
                    fontSize={{ base: "18px", md: "20px" }}
                    mt={8}
                    fontWeight="semibold"
                  >
                    <Text
                      fontSize="sm"
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
                      Redemption End Date
                    </Text>
                    <Text>Thursday, June 23</Text>
                  </Box>
                  <Box
                    fontSize={{ base: "18px", md: "20px" }}
                    mt={8}
                    fontWeight="semibold"
                  >
                    <Text
                      fontSize="sm"
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
                      Redemption Price
                    </Text>
                    <Text>0.015 WETH</Text>
                  </Box>
                  <Box
                    fontSize={{ base: "18px", md: "20px" }}
                    mt={8}
                    fontWeight="semibold"
                  >
                    <Text
                      fontSize="sm"
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
                      Time until redemption
                    </Text>
                    <CountdownTimer
                      targetDate={new Date("2022-06-17T22:00:00Z")}
                    ></CountdownTimer>
                    {/*<Text>0.015 WETH</Text>*/}
                  </Box>
                </Box>
              </Center>

              {/*Redemption logic*/}
              {/*<Box>*/}
              {/*  <Heading>*/}
              {/*    You have {accountTicketCount.toString()} Tickets*/}
              {/*  </Heading>*/}
              {/*<VStack>*/}
              {/*  /!*Quantity*!/*/}
              {/*  <Box>*/}
              {/*    <Center>*/}
              {/*      <FormLabel*/}
              {/*        fontSize={"sm"}*/}
              {/*        color={"gray.500"}*/}
              {/*        fontWeight={"medium"}*/}
              {/*      >*/}
              {/*        Quantity*/}
              {/*      </FormLabel>*/}
              {/*    </Center>*/}
              {/*    <NumberInput*/}
              {/*      isInvalid={invalidEntry}*/}
              {/*      min={0}*/}
              {/*      max={10}*/}
              {/*      precision={0}*/}
              {/*      onChange={(valueString) => {*/}
              {/*        const [integerPart, decimalPart] =*/}
              {/*          valueString.split(".");*/}
              {/*        if (valueString.includes(".")) {*/}
              {/*          setRedeemAmount(integerPart || "0");*/}
              {/*          return;*/}
              {/*        }*/}
              {/*        if (integerPart && integerPart.length > 2) {*/}
              {/*          return;*/}
              {/*        }*/}
              {/*        if (valueString === "00") {*/}
              {/*          return;*/}
              {/*        }*/}
              {/*        if (isNaN(Number(valueString))) {*/}
              {/*          return;*/}
              {/*        }*/}
              {/*        if (*/}
              {/*          Number(valueString) !==*/}
              {/*          Math.round(Number(valueString) * 1e6) / 1e6*/}
              {/*        ) {*/}
              {/*          setRedeemAmount(Number(valueString).toFixed(6));*/}
              {/*          return;*/}
              {/*        }*/}
              {/*        setRedeemAmount(valueString);*/}
              {/*      }}*/}
              {/*      value={format(redeemAmount)}*/}
              {/*      size="lg"*/}
              {/*    >*/}
              {/*      <NumberInputField*/}
              {/*        h="6rem"*/}
              {/*        borderRadius="3xl"*/}
              {/*        shadow="sm"*/}
              {/*        fontWeight="medium"*/}
              {/*        fontSize="2xl"*/}
              {/*      />*/}
              {/*      <InputRightElement*/}
              {/*        pointerEvents="none"*/}
              {/*        p={14}*/}
              {/*        children={*/}
              {/*          <FormLabel*/}
              {/*            htmlFor="amount"*/}
              {/*            color="gray.500"*/}
              {/*            fontWeight="medium"*/}
              {/*            minW={"100"}*/}
              {/*          >*/}
              {/*            tickets*/}
              {/*          </FormLabel>*/}
              {/*        }*/}
              {/*      />*/}
              {/*    </NumberInput>*/}
              {/*  </Box>*/}
              {/*  /!*Redeem Price*!/*/}
              {/*  <Box>*/}
              {/*    <Center>*/}
              {/*      <FormLabel*/}
              {/*        fontSize={"sm"}*/}
              {/*        color={"gray.500"}*/}
              {/*        fontWeight={"medium"}*/}
              {/*      >*/}
              {/*        Total*/}
              {/*      </FormLabel>*/}
              {/*    </Center>*/}
              {/*    <Box*/}
              {/*      bg={bgColor}*/}
              {/*      borderRadius="3xl"*/}
              {/*      fontWeight="medium"*/}
              {/*      fontSize="2xl"*/}
              {/*      p={"1.813rem"}*/}
              {/*    >*/}
              {/*      {invalidEntry*/}
              {/*        ? "?"*/}
              {/*        : format(*/}
              {/*            redeemPrice*/}
              {/*              ? ethers.utils.formatEther(*/}
              {/*                  redeemPrice.mul(Number(redeemAmount))*/}
              {/*                )*/}
              {/*              : "-"*/}
              {/*          )}{" "}*/}
              {/*      WETH*/}
              {/*    </Box>*/}
              {/*  </Box>*/}
              {/*  /!*Approve/Redeem button*!/*/}
              {/*  <Box>*/}
              {/*    <Button*/}
              {/*      onClick={noAllowance ? handleApprove : handleRedeemNFT}*/}
              {/*      colorScheme={tradingBtnColor}*/}
              {/*      variant="solid"*/}
              {/*      rounded="2xl"*/}
              {/*      isLoading={isLoading}*/}
              {/*      isDisabled={Number(redeemAmount) <= 0 || noFunds}*/}
              {/*      size="lg"*/}
              {/*      px={["50", "70", "90", "90"]}*/}
              {/*      fontSize="25px"*/}
              {/*      py={10}*/}
              {/*      borderRadius="full"*/}
              {/*      _hover={{ transform: "translateY(-2px)" }}*/}
              {/*      bgGradient={"linear(to-r,#74cecc,green.300,blue.400)"}*/}
              {/*      loadingText={*/}
              {/*        noAllowance*/}
              {/*          ? "Approving..."*/}
              {/*          : !localError*/}
              {/*          ? "Redeeming..."*/}
              {/*          : "Redeem Ticket"*/}
              {/*      }*/}
              {/*    >*/}
              {/*      {*/}
              {/*        // If no account then Wrong Network and Connect Wallet*/}
              {/*        !account*/}
              {/*          ? !!web3Error &&*/}
              {/*            getErrorMessage(web3Error).title === "Wrong Network"*/}
              {/*            ? "Connect to Polygon"*/}
              {/*            : "Connect Wallet"*/}
              {/*          : tooLarge*/}
              {/*          ? "Quantity above number of tickets"*/}
              {/*          : noFunds*/}
              {/*          ? "Insufficient funds"*/}
              {/*          : noAllowance*/}
              {/*          ? "Approve WETH"*/}
              {/*          : "Redeem Ticket"*/}
              {/*      }*/}
              {/*    </Button>*/}
              {/*  </Box>*/}
              {/*</VStack>*/}
              {/*</Box>*/}
            </HStack>
          </Center>
        </Container>

        {/*Main Grid view*/}
        {!isInitialized ? (
          <Center p={10}>
            <Spinner size="xl" />
          </Center>
        ) : (!holdsSeed && !tickets && !holdsFungibleAsset) || !account ? (
          <></>
        ) : // <Grid templateColumns="repeat(1, 1fr)">
        //   <Center>
        //     <SeedBasketImg boxSize={220} />
        //   </Center>
        //   <Center>
        //     <Box maxW="30rem" mb={8} fontSize="20px" textStyle={"reading"}>
        //       <Text pt="8">
        //         {!account
        //           ? "Please connect your wallet"
        //           : !holdsSeed
        //           ? "Your garden has no seeds"
        //           : ""}
        //       </Text>
        //     </Box>
        //   </Center>
        //   <Center>
        //     {!holdsSeed && !tickets && account && (
        //       <Link
        //         href="https://opensea.io/collection/shrub-paper-gardens"
        //         isExternal
        //         cursor="pointer"
        //         rounded="3xl"
        //         size="sm"
        //         px="6"
        //         fontSize="25px"
        //         fontWeight="semibold"
        //         py="5"
        //         _hover={{ transform: "translateY(-2px)" }}
        //         bgGradient="linear(to-r, #74cecc, green.300, #e3d606)"
        //         color={useColorModeValue("white", "black")}
        //       >
        //         Get a Seed <ExternalLinkIcon mx="2px" />
        //       </Link>
        //     )}
        //   </Center>
        // </Grid>
        holdsSeed || holdsFungibleAsset ? (
          // Only show the grid view if the user has items that will show in the grid
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
            gap="20"
          >
            {/*all seeds*/}
            <Box>
              <Grid
                templateColumns={
                  mySeedDataLoading || mySeedDataError
                    ? "repeat(1, 1fr)"
                    : { base: "repeat(4, 1fr)", md: "repeat(5, 1fr)" }
                }
                gap={2}
                minH={"620px"}
                overflow="scroll"
                maxH="620px"
                shadow="2xl"
                layerStyle={"shrubBg"}
                borderRadius="2xl"
                p={4}
              >
                {mySeedDataLoading || mySeedDataError ? (
                  <Center p={10}>
                    <Spinner size="xl" />
                  </Center>
                ) : (
                  mySeedRows
                )}
              </Grid>
            </Box>
            {/*seed details*/}
            <Box display={{ base: "none", md: "block" }}>
              <SeedDetails
                hooks={{
                  mySeedDataLoading,
                  mySeedDataError,
                  selectedItem,
                }}
                handleErrorMessages={handleErrorMessages}
              />
            </Box>
            <Drawer
              isOpen={openDrawer}
              placement="right"
              onClose={onClose}
              size={drawerSize}
              preserveScrollBarGap={true}
            >
              <DrawerOverlay />
              <DrawerContent pt={10}>
                <DrawerCloseButton />
                <DrawerBody>
                  <SeedDetails
                    hooks={{
                      mySeedDataLoading,
                      mySeedDataError,
                      selectedItem,
                    }}
                    handleErrorMessages={handleErrorMessages}
                  />
                </DrawerBody>
                {/*<DrawerFooter>*/}
                {/*  <Button variant="outline" mr={3} onClick={onClose}>*/}
                {/*    Close*/}
                {/*  </Button>*/}
                {/*  <Button colorScheme="blue">Save</Button>*/}
                {/*</DrawerFooter>*/}
              </DrawerContent>
            </Drawer>
          </Grid>
        ) : (
          <></>
        )}
      </Container>

      {/*Modal View*/}
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

export default MyPaperGardenView;
