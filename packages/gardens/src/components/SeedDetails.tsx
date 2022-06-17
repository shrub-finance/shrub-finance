import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalContentProps,
  ModalHeader,
  ModalOverlay,
  SlideFade,
  Spinner,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FlyingSeed, PlantingPot, WonderPot } from "../assets/Icons";
import { TransformScale } from "./animations/TransformScale";
import { Disappear, Appear } from "./animations/Fade";
import { motion, useAnimation } from "framer-motion";
import {
  approveAllErc721,
  approveToken,
  harvestShrub,
  isApprovedErc721,
  mint,
  mintWL,
  plant,
  water,
  waterWithFertilizer,
} from "../utils/ethMethods";
import { useWeb3React } from "@web3-react/core";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { ethers } from "ethers";
import { ToastDescription, Txmonitor } from "./TxMonitoring";
import { TxContext } from "./Store";

function SeedDetails({
  hooks,
  handleErrorMessages,
}: {
  hooks: {
    mySeedDataLoading: any;
    mySeedDataError: any;
    selectedItem: any;
  };
  handleErrorMessages: (errorOptions: {
    err?: Error | undefined;
    customMessage?: string | undefined;
  }) => void;
}) {
  const { mySeedDataLoading, mySeedDataError, selectedItem } = hooks;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const controls = useAnimation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { pendingTxs } = useContext(TxContext);
  const [plantingApproved, setPlantingApproved] = useState(false);
  const [localError, setLocalError] = useState("");
  const [approving, setApproving] = React.useState(false);
  const [modalState, setModalState] = useState<
    "plant" | "water" | "fertilize" | "harvest" | "planting"
  >("plant");
  const [activeHash, setActiveHash] = useState<string>();
  // const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

  const {
    active,
    account,
    error: web3Error,
    library,
    chainId,
  } = useWeb3React();

  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;

  const PAPERSEED_ADDRESS = process.env.REACT_APP_PAPERSEED_ADDRESS || "";
  const PAPER_POT_ADDRESS = process.env.REACT_APP_PAPER_POT_ADDRESS || "";

  // Move errors to the top
  useEffect(() => {
    console.log("useEffect - error to top");
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  // On selection changing
  useEffect(() => {
    console.log("useEffect - selection changing");
    async function main() {
      if (!account || selectedItem.category !== "paperSeed") {
        setPlantingApproved(false);
        return;
      }
      // Check the approvalStatus
      const isApproved = await isApprovedErc721(
        PAPERSEED_ADDRESS,
        account,
        selectedItem.tokenId,
        PAPER_POT_ADDRESS,
        library
      );
      setPlantingApproved(isApproved);
    }
    main().catch((e) => {
      console.error(e);
      handleErrorMessages({ err: e });
    });
  }, [account, selectedItem]);

  // Start animation
  useEffect(() => {
    console.log("useEffect - isOpen");
    if (!isOpen) {
      return;
    }
    console.log(" animation effect starts");
    setTimeout(() => {
      controls.start("final");
    }, 1);
  }, []);

  // Scroll to top on error
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  const MotionModalContent = motion<ModalContentProps>(ModalContent);
  // console.log(selectedItem);

  // async function handleApprove() {
  //   const description = "Approving Paper Seeds for planting";
  //   try {
  //     console.log(PAPERSEED_ADDRESS, PAPER_POT_ADDRESS);
  //     const tx = await approveAllErc721(
  //       PAPERSEED_ADDRESS,
  //       PAPER_POT_ADDRESS,
  //       true,
  //       library
  //     );
  //     pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
  //     setActiveHash(tx.hash);
  //     try {
  //       const receipt = await tx.wait();
  //       const toastDescription = ToastDescription(
  //         description,
  //         receipt.transactionHash,
  //         chainId
  //       );
  //       toast({
  //         title: "Transaction Confirmed",
  //         description: toastDescription,
  //         status: "success",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: receipt.transactionHash,
  //         status: "confirmed",
  //       });
  //     } catch (e: any) {
  //       const toastDescription = ToastDescription(
  //         description,
  //         e.transactionHash,
  //         chainId
  //       );
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: e.transactionHash || e.hash,
  //         status: "failed",
  //       });
  //       toast({
  //         title: "Transaction Failed",
  //         description: toastDescription,
  //         status: "error",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //     }
  //   } catch (e: any) {
  //     handleErrorMessages({ err: e });
  //   }
  // }
  //
  // async function handlePlanting() {
  //   setLocalError("");
  //   // setIsMinted(false);
  //   // setNftImageId("");
  //   // setTokenId(0);
  //   // setNftTitle("");
  //   // setIsLoading(true);
  //   const description = "Planting";
  //   try {
  //     const tx = await plant(selectedItem.tokenId, library);
  //     pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
  //     setActiveHash(tx.hash);
  //     try {
  //       const receipt = await tx.wait();
  //       // setIsMinted(true);
  //       const toastDescription = ToastDescription(
  //         description,
  //         receipt.transactionHash,
  //         chainId
  //       );
  //       toast({
  //         title: "Transaction Confirmed",
  //         description: toastDescription,
  //         status: "success",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: receipt.transactionHash,
  //         status: "confirmed",
  //       });
  //     } catch (e: any) {
  //       const toastDescription = ToastDescription(
  //         description,
  //         e.transactionHash,
  //         chainId
  //       );
  //       pendingTxsDispatch({
  //         type: "update",
  //         txHash: e.transactionHash || e.hash,
  //         status: "failed",
  //       });
  //       toast({
  //         title: "Transaction Failed",
  //         description: toastDescription,
  //         status: "error",
  //         isClosable: true,
  //         variant: "solid",
  //         position: "top-right",
  //       });
  //     }
  //   } catch (e: any) {
  //     handleErrorMessages({ err: e });
  //   }
  // }

  function handleModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    onClose();
  }

  function openModal() {
    onOpen();
  }

  async function handleBlockchainTx(
    description: string,
    callbackTx: () => Promise<ethers.ContractTransaction>
  ) {
    setLocalError("");
    try {
      setApproving(true);
      const tx = await callbackTx();
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      setActiveHash(tx.hash);
      try {
        const receipt = await tx.wait();
        // setIsMinted(true);
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
          data: { blockNumber: receipt.blockNumber },
        });
        setApproving(false);
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
        setApproving(false);
      }
    } catch (e: any) {
      handleErrorMessages({ err: e });
      setApproving(false);
    }
  }

  function handlePlanting() {
    return handleBlockchainTx("Planting", () =>
      plant(selectedItem.tokenId, library)
    );
  }

  function handleApprove() {
    return handleBlockchainTx("Approving Paper Seeds for planting", () =>
      approveAllErc721(PAPERSEED_ADDRESS, PAPER_POT_ADDRESS, true, library)
    );
  }

  function handleWatering() {
    return handleBlockchainTx("Watering", () =>
      water([selectedItem.tokenId], library)
    );
  }

  function handleFertilizing() {
    return handleBlockchainTx("Fertilizing", () =>
      waterWithFertilizer([selectedItem.tokenId], library)
    );
  }

  function handleHarvesting() {
    return handleBlockchainTx("Harvesting Shrub", () =>
      harvestShrub(selectedItem.tokenId, library)
    );
  }

  return (
    <>
      <Center mt={10}>
        {localError && (
          <SlideFade in={true} unmountOnExit={true}>
            <Alert status="error" borderRadius={9}>
              <AlertIcon />
              {localError}
            </Alert>
          </SlideFade>
        )}
      </Center>
      <Box minW={{ base: "290", md: "400" }} maxH="614px">
        {mySeedDataLoading || mySeedDataError ? (
          <Center p={10}>
            <Spinner size="xl" />
          </Center>
        ) : (
          <Box
            w={"full"}
            layerStyle="shrubBg"
            boxShadow={"2xl"}
            rounded={"xl"}
            p={4}
          >
            {/*image*/}
            <Center mt={{ base: "6", md: "0" }}>
              <Image
                objectFit={"cover"}
                maxH={{ base: "250px", md: "250px", lg: "250" }}
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
              />
            </Center>
            {/*title*/}
            <Center mt={6}>
              <Heading fontSize={{ base: "lg", md: "xl", lg: "2xl" }}>
                {selectedItem.name}
              </Heading>
            </Center>
            {/*Traits*/}
            {["pot", "water", "fertilizer"].includes(selectedItem.category) && (
              <>
                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={6}
                >
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    {`You have: ${selectedItem.quantity}`}
                  </Badge>
                  {/*<Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>*/}
                  {/*  Emotion: {selectedItem.emotion}*/}
                  {/*</Badge>*/}
                </Stack>
                {/*<Stack*/}
                {/*  align={"center"}*/}
                {/*  justify={"center"}*/}
                {/*  direction={"row"}*/}
                {/*  mt={2}*/}
                {/*>*/}
                {/*  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>*/}
                {/*    Class: {selectedItem.type}*/}
                {/*  </Badge>*/}
                {/*  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>*/}
                {/*    DNA: {selectedItem.dna}*/}
                {/*  </Badge>*/}
                {/*</Stack>*/}
              </>
            )}
            {["paperSeed", "pottedPlant"].includes(selectedItem.category) && (
              <>
                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={6}
                >
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    {selectedItem.category === "paperSeed"
                      ? `Rarity: ${
                          selectedItem.type === "Hope"
                            ? "Rare"
                            : selectedItem.type === "Power"
                            ? "Legendary"
                            : selectedItem.type === "Passion"
                            ? "Uncommon"
                            : "Common"
                        }`
                      : `Growth: ${Math.floor(selectedItem.growth / 10) / 10}%`}
                  </Badge>
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    Emotion: {selectedItem.emotion}
                  </Badge>
                </Stack>
                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={2}
                >
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    Class: {selectedItem.type}
                  </Badge>
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    DNA: {selectedItem.dna}
                  </Badge>
                </Stack>
              </>
            )}
            {/*Buttons*/}
            <Stack mt={8} direction={"row"} spacing={4}>
              {/*Water Button*/}
              {selectedItem.category === "pottedPlant" && (
                <Button
                  onClick={() => {
                    setModalState("water");
                    openModal();
                  }}
                  flex={1}
                  fontSize={"sm"}
                  rounded={"full"}
                  _focus={{
                    bg: "gray.200",
                  }}
                >
                  Water
                </Button>
              )}
              {/*Plant Button*/}
              {selectedItem.category === "paperSeed" && (
                <Button
                  onClick={() => {
                    setModalState("plant");
                    openModal();
                  }}
                  flex={1}
                  fontSize={"sm"}
                  rounded={"full"}
                  bgGradient="linear(to-l, #8fff6e,rgb(227, 214, 6),#b1e7a1)"
                  color={"black"}
                  boxShadow={"xl"}
                  _hover={{
                    bg: "shrub.200",
                  }}
                  _focus={{
                    bg: "shrub.100",
                  }}
                >
                  Plant
                </Button>
              )}
            </Stack>
            {selectedItem.category === "pottedPlant" && (
              <Stack mt={8} direction={"row"} spacing={4}>
                <Button
                  onClick={() => {
                    setModalState("fertilize");
                    openModal();
                  }}
                  flex={1}
                  fontSize={"sm"}
                  rounded={"full"}
                  _focus={{
                    bg: "gray.200",
                  }}
                >
                  Fertilize
                </Button>
                <Button
                  onClick={() => {
                    setModalState("harvest");
                    openModal();
                  }}
                  flex={1}
                  fontSize={"sm"}
                  rounded={"full"}
                  _focus={{
                    bg: "gray.200",
                  }}
                >
                  Harvest
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </Box>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        motionPreset="slideInBottom"
        scrollBehavior={isMobile ? "inside" : "outside"}
        size={"xl"}
      >
        <ModalOverlay />
        <MotionModalContent
          minH={"470px"}
          top="6rem"
          boxShadow="dark-lg"
          borderRadius="2xl"
          animate={{
            backgroundColor: [
              colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
              "#ffd06b",
              colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
            ],
          }}
          //@ts-ignore
          transition={{
            duration: 0.25,
            delay: 1.97,
          }}
        >
          <ModalHeader>
            {modalState === "plant"
              ? "Plant Your Seed"
              : modalState === "water"
              ? "Water Your Potted Plant"
              : modalState === "fertilize"
              ? "Fertilize Your Potted Plant"
              : modalState === "harvest"
              ? "Harvest your Shrub"
              : "Unhandled State"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={40}>
            {
              // When transaction is in flight
              approving || activeHash ? (
                <Txmonitor txHash={activeHash} />
              ) : (
                // Base States based on action clicked
                <>
                  {modalState === "plant" ? (
                    <Center>
                      <Box textStyle={"reading"}>
                        <Text>Planting will result in</Text>
                        <Text>{selectedItem.name}</Text>
                        <Text>and</Text>
                        <Text>1 Empty Pot</Text>
                        <Text>
                          converting into a potted plant that you can grow into
                          a Shrub
                        </Text>
                        <Text>This is irrevesible.</Text>
                        {!plantingApproved && (
                          <Text>
                            You must also first approve your seed for planting
                          </Text>
                        )}
                      </Box>
                    </Center>
                  ) : modalState === "water" ? (
                    <Center>
                      <Box textStyle={"reading"}>
                        <Text>Watering will result in</Text>
                        <Text>1 Water being consumed</Text>
                        <Text>
                          And in turn increasing the growth number of your
                          potted plant.
                        </Text>
                        <Text>
                          This can only be done once per day for each potted
                          plant.
                        </Text>
                      </Box>
                    </Center>
                  ) : modalState === "fertilize" ? (
                    <Center>
                      <Box textStyle={"reading"}>
                        <Text>Fertilizing will result in</Text>
                        <Text>1 Fertilizer</Text>
                        <Text>plus</Text>
                        <Text>1 Water being consumed</Text>
                        <Text>
                          This is done in place of a normal daily watering
                        </Text>
                        <Text>
                          Your potted plant will grow more compared to when
                          simply watered
                        </Text>
                        <Text>
                          This is a one-time effect, it will not affect future
                          waterings
                        </Text>
                        <Text>
                          This can only be done once per day for each potted
                          plant.
                        </Text>
                      </Box>
                    </Center>
                  ) : modalState === "harvest" ? (
                    <Center>
                      <Box textStyle={"reading"}>
                        <Text>Harvesting will result in</Text>
                        <Text>your potted plant</Text>
                        <Text>and</Text>
                        <Text>1 Empty Pot</Text>
                        <Text>converting into a fully-grown Shrub.</Text>
                        <Text>This is irrevesible.</Text>
                      </Box>
                    </Center>
                  ) : (
                    <></>
                  )}
                  // The action button
                  <Center>
                    <Button
                      onClick={
                        modalState === "plant"
                          ? plantingApproved
                            ? handlePlanting
                            : handleApprove
                          : modalState === "water"
                          ? handleWatering
                          : modalState === "fertilize"
                          ? handleFertilizing
                          : modalState === "harvest"
                          ? handleHarvesting
                          : () => console.log("unexpected state")
                      }
                      flex={1}
                      fontSize={"sm"}
                      rounded={"full"}
                      bgGradient="linear(to-l, #8fff6e,rgb(227, 214, 6),#b1e7a1)"
                      color={"black"}
                      boxShadow={"xl"}
                      _hover={{
                        bg: "shrub.200",
                      }}
                      _focus={{
                        bg: "shrub.100",
                      }}
                    >
                      {modalState === "plant"
                        ? plantingApproved
                          ? "Plant"
                          : "Approve Seed for Planting"
                        : modalState === "water"
                        ? "Water"
                        : modalState === "fertilize"
                        ? "Fertilize"
                        : modalState === "harvest"
                        ? "Harvest"
                        : "Unexpected State"}
                    </Button>
                  </Center>
                </>
              )
            }
            {/*Animation once planting occurs*/}
            {/*<Center>*/}
            {/*  {TransformScale(<FlyingSeed boxSize={20} />, controls)}*/}
            {/*</Center>*/}
            {/*<Center>*/}
            {/*  {Disappear(<PlantingPot boxSize={40} />, controls)}*/}
            {/*  {Appear(<WonderPot boxSize={40} />, controls)}*/}
            {/*</Center>*/}
          </ModalBody>
        </MotionModalContent>
      </Modal>
    </>
  );
}

export default SeedDetails;
