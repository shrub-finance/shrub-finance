import {
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Heading,
  Icon,
  Image,
  keyframes,
  Link,
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
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { motion } from "framer-motion";
import {
  approveAllErc721,
  getBlockTime,
  harvestShrub,
  isApprovedErc721,
  plant,
  water,
  wateringNextAvailable,
  waterWithFertilizer,
} from "../utils/ethMethods";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { ToastDescription, Txmonitor } from "./TxMonitoring";
import { TxContext } from "./Store";
import { IMAGE_ASSETS } from "../utils/imageAssets";

import { Feature } from "./Feature";
import { FaHandPointLeft, FaHeart, RiHeartAddFill } from "react-icons/all";
import { Fertilizer, Pot, Water, WateringCan } from "../assets/Icons";
import { itemType } from "../types";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Grow } from "./animations/TransformScale";

function SeedDetails({
  hooks,
  handleErrorMessages,
}: {
  hooks: {
    mySeedDataLoading: any;
    mySeedDataError: any;
    selectedItem: any;
    setSelectedItem: any;
    emptyPot: any;
    holdsPottedPlant: any;
    fungibleAssets: any;
  };
  handleErrorMessages: (errorOptions: {
    err?: Error | undefined;
    customMessage?: string | undefined;
  }) => void;
}) {
  const {
    mySeedDataLoading,
    mySeedDataError,
    selectedItem,
    setSelectedItem,
    emptyPot,
    holdsPottedPlant,
    fungibleAssets,
  } = hooks;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { pendingTxs } = useContext(TxContext);
  const [activeHash, setActiveHash] = useState<string>();
  const [pendingTxsState, pendingTxsDispatch] = pendingTxs;

  const { colorMode } = useColorMode();

  const [plantingApproved, setPlantingApproved] = useState(false);
  const [localError, setLocalError] = useState("");
  const [approving, setApproving] = React.useState(false);
  const [stillGrowing, setStillGrowing] = React.useState(true);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [modalState, setModalState] = useState<
    "plant" | "water" | "waterAll" | "fertilize" | "harvest" | "planting"
  >("plant");

  const borderColor = useColorModeValue("gray.100", "gray.700");
  const iconBg = useColorModeValue("green.100", "green.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const textColor1 = "yellow.900";
  const textBg = useColorModeValue("gray.100", "gray.900");
  const textBg2 = useColorModeValue("blue.50", "blue.900");
  const textBg3 = useColorModeValue("yellow.100", "yellow.200");
  const textBg4 = "green.100";

  const PAPERSEED_ADDRESS = process.env.REACT_APP_PAPERSEED_ADDRESS || "";
  const PAPER_POT_ADDRESS = process.env.REACT_APP_PAPER_POT_ADDRESS || "";

  const openSeaLink = `https://opensea.io/assets/matic/${
    selectedItem.category === "paperSeed"
      ? PAPERSEED_ADDRESS
      : PAPER_POT_ADDRESS
  }/${selectedItem.tokenId}`;

  const animationKeyframes = keyframes`
    0% {
      background-position: 0 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
`;

  const animation = `${animationKeyframes} 4s ease-out infinite`;

  const { account, error: web3Error, library, chainId } = useWeb3React();

  console.debug("rendering SeedDetails");

  // Disable action if not ready for harvest
  useEffect(() => {
    console.debug(
      "SeedDetails useEffect 2 - selectedItem.growth (set StillGrowing to false)"
    );
    if (selectedItem.growth === 10000) {
      if (stillGrowing !== false) {
        setStillGrowing(false);
        console.debug("setting stillGrowing false");
      }
    } else {
      if (stillGrowing !== true) {
        setStillGrowing(true);
        console.debug("setting stillGrowing true");
      }
    }
  }, [selectedItem.growth]);

  // Move errors to the top
  useEffect(() => {
    console.debug(
      "SeedDetails useEffect 3 - localError, web3Error (move errors to top)"
    );
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  // determine if planting is approved
  useEffect(() => {
    console.debug(
      "SeedDetails useEffect 5 - account, selectedItem, pendingTxsState (selected item changed)"
    );
    async function main() {
      if (!account || selectedItem.category !== "paperSeed") {
        console.debug("setting plantingApproved false");
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
      if (plantingApproved !== isApproved) {
        console.debug(`setting plantingApproved ${isApproved}`);
        setPlantingApproved(isApproved);
      }
    }
    main().catch((e) => {
      console.error(e);
      handleErrorMessages({ err: e });
    });
  }, [account, selectedItem, pendingTxsState]);

  const MotionModalContent = motion<ModalContentProps>(ModalContent);

  function handleModalClose() {
    setApproving(false);
    setActiveHash(undefined);
    setLocalError("");
    onClose();
  }

  function openModal() {
    onOpen();
  }

  async function handleBlockchainTx(
    description: string,
    callbackTx: () => Promise<ethers.ContractTransaction>,
    action?: string
  ) {
    setLocalError("");
    try {
      console.debug("setting approving true");
      setApproving(true);
      const tx = await callbackTx();
      pendingTxsDispatch({ type: "add", txHash: tx.hash, description });
      console.debug(`setting activeHash ${tx.hash}`);
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
          data: { blockNumber: receipt.blockNumber },
        });
        const growEvent = receipt.events?.find(
          (event) => event.event === "Grow"
        );
        console.log(growEvent);
        if (
          description === "Watering All" &&
          selectedItem.category === "water"
        ) {
          setSelectedItem({
            ...selectedItem,
            quantity:
              selectedItem.quantity - selectedItem.potsForWatering.length,
            potsForWatering: [],
          });
        }
        if (growEvent && growEvent.args) {
          const growth: number = growEvent.args.growthBps;
          const tokenId = growEvent.args.tokenId || ethers.constants.Zero;
          const growthDiff = growEvent.args.growthAmount;
          if (tokenId.eq(selectedItem.tokenId) && growth) {
            const timestamp = await getBlockTime(receipt.blockHash, library);
            const pottedPlantItem: itemType = {
              tokenId: selectedItem.tokenId,
              name: "Potted Plant",
              emotion: selectedItem.emotion,
              type: selectedItem.type,
              dna: selectedItem.dna,
              imageUrl: IMAGE_ASSETS.getPottedPlant(
                selectedItem.type,
                Math.floor(growth / 2000),
                selectedItem.emotion
              ),
              growth: growth,
              category: "pottedPlant",
              wateringNextAvailable: wateringNextAvailable(timestamp),
            };
            setSelectedItem(pottedPlantItem);
          }
        }
        const plantEvent = receipt.events?.find(
          (event) => event.event === "Plant"
        );
        if (plantEvent && plantEvent.args) {
          const eventAccount = plantEvent.args.account;
          const seedTokenId = plantEvent.args.seedTokenId;
          const tokenId = plantEvent.args.tokenId;
          if (
            account &&
            ethers.utils.getAddress(eventAccount) ===
              ethers.utils.getAddress(account) &&
            seedTokenId.eq(selectedItem.tokenId)
          ) {
            console.debug("everything matches");
            const pottedPlantItem: itemType = {
              tokenId: tokenId.toString(),
              name: "Potted Plant",
              emotion: selectedItem.emotion,
              type: selectedItem.type,
              dna: selectedItem.dna,
              imageUrl: IMAGE_ASSETS.getPottedPlant(
                selectedItem.type,
                0,
                selectedItem.emotion
              ),
              growth: 0,
              category: "pottedPlant",
              wateringNextAvailable: selectedItem.wateringNextAvailable,
            };
            setSelectedItem(pottedPlantItem);
          }
        }
        console.debug(`setting approving false`);
        setApproving(false);
        if (action !== "approve") {
          // setShowConfetti(true);
          // console.debug(`setting showConfetti true`);
        }
      } catch (e: any) {
        console.error(e);
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
        console.debug(`setting approving false`);
        setShowConfetti(false);
        console.debug(`setting showConfetti false`);
      }
    } catch (e: any) {
      if (e.message.includes("Must own a pot token to plant")) {
        setLocalError("You must own a pot to plant your seed");
      }
      handleErrorMessages({ err: e });
      setApproving(false);
      setShowConfetti(false);
    }
  }
  function handlePlanting() {
    return handleBlockchainTx("Planting", () =>
      plant(selectedItem.tokenId, library)
    );
  }

  function handleApprove() {
    return handleBlockchainTx(
      "Approving Paper Seeds for planting",
      () =>
        approveAllErc721(PAPERSEED_ADDRESS, PAPER_POT_ADDRESS, true, library),
      "approve"
    );
  }

  function handleWatering() {
    return handleBlockchainTx("Watering", () =>
      water([selectedItem.tokenId], library)
    );
  }

  function handleWaterAll() {
    return handleBlockchainTx("Watering All", () => {
      const idsForWatering = selectedItem.potsForWatering.map((s: any) => s.id);
      return water(idsForWatering, library);
    });
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

  function getSeedColor(type: string) {
    return type === "Wonder"
      ? "#ffd16b"
      : type === "Passion"
      ? "#fcaec5"
      : type === "Hope"
      ? "#b8ecfd"
      : type === "Power"
      ? "#eb7131"
      : "#000000";
  }

  const isActivelyPlanting =
    activeHash &&
    pendingTxsState[activeHash] &&
    pendingTxsState[activeHash].status === "confirming" &&
    pendingTxsState[activeHash].description === "Planting";

  return (
    <>
      {/*{activeHash && showConfetti && <Confetti />}*/}
      <Center mt={10} mb={4}>
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
            boxShadow={"dark-lg"}
            rounded={"xl"}
            pt={10}
            px={4}
            pb={4}
          >
            {/*image*/}
            <Center mt={{ base: "6", md: "0" }}>
              <Image
                objectFit={"cover"}
                maxH={{ base: "250px", md: "250px", lg: "250" }}
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                transform={
                  selectedItem.category === "pottedPlant"
                    ? "scale(2)"
                    : undefined
                }
              />
            </Center>
            {/*title*/}
            <Center mt={6}>
              <Heading fontSize={{ base: "lg", md: "xl", lg: "2xl" }}>
                {selectedItem.name}
              </Heading>
            </Center>
            {/*open sea link*/}
            <Center>
              <Link
                color={"gray.500"}
                fontSize={"xs"}
                href={openSeaLink}
                isExternal
                zIndex={2}
                fontWeight={"medium"}
              >
                View in Open Sea
                <ExternalLinkIcon mx="2px" />
              </Link>
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
                    {`You have: ${selectedItem.quantity} ${selectedItem.category}`}
                  </Badge>
                </Stack>
                {["water", "fertilizer"].includes(selectedItem.category) ? (
                  <Text pt={2} textAlign={"center"} textStyle={"reading"}>
                    <Icon
                      as={FaHandPointLeft}
                      w={6}
                      h={6}
                      mt={5}
                      mr={2}
                      verticalAlign={"bottom"}
                    />
                    To{" "}
                    {selectedItem.category === "water" ? "water" : "fertilizer"}
                    ,{" "}
                    {holdsPottedPlant
                      ? "select a potted plant on the left"
                      : "plant a seed first"}
                  </Text>
                ) : (
                  <Text pt={2} textAlign={"center"} textStyle={"reading"}>
                    <Icon
                      as={FaHandPointLeft}
                      w={6}
                      h={6}
                      mt={5}
                      mr={2}
                      verticalAlign={"bottom"}
                    />{" "}
                    To plant, select a seed on the left
                  </Text>
                )}
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
                    Class: {selectedItem.type}
                  </Badge>
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    DNA: {selectedItem.dna}
                  </Badge>
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    Emotion: {selectedItem.emotion}
                  </Badge>
                </Stack>
                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={4}
                >
                  <Badge
                    px={2}
                    py={1}
                    fontWeight={"600"}
                    rounded={"lg"}
                    bg={textBg3}
                    color={textColor1}
                  >
                    {selectedItem.category === "paperSeed"
                      ? `Rarity: ${
                          selectedItem.type === "Hope"
                            ? "Rare 💎"
                            : selectedItem.type === "Power"
                            ? "Legendary 👑"
                            : selectedItem.type === "Passion"
                            ? "Uncommon 💍"
                            : "Common"
                        }`
                      : `Growth: ${Math.floor(selectedItem.growth / 10) / 10}%`}
                  </Badge>
                </Stack>
                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={4}
                >
                  {selectedItem.category === "pottedPlant" && (
                    <Badge
                      px={2}
                      py={1}
                      fontWeight={"600"}
                      rounded={"md"}
                      color={"cyan.900"}
                      bg={textBg4}
                      letterSpacing={"wider"}
                    >
                      Watering Available:{" "}
                      {selectedItem.wateringNextAvailable >= new Date()
                        ? selectedItem.wateringNextAvailable.toLocaleString()
                        : "Now 🚀"}
                    </Badge>
                  )}
                </Stack>
              </>
            )}
            {/*Buttons*/}
            <Stack mt={6} direction={"row"} spacing={4}>
              {/*Water All button*/}
              {selectedItem.category === "water" && (
                <Tooltip
                  hasArrow
                  label={"Water all eligible potted plants!"}
                  shouldWrapChildren
                  mt="3"
                >
                  <Button
                    onClick={() => {
                      setModalState("waterAll");
                      openModal();
                    }}
                    flex={1}
                    fontSize={"xl"}
                    w={{ base: "315px", md: "420px" }}
                    rounded={"2xl"}
                    bgGradient="linear(to-l, #82caff, #d9efff, #a1d2e7)"
                    color={"black"}
                    boxShadow={"xl"}
                    _hover={{
                      bg: "shrub.200",
                    }}
                    _focus={{
                      bg: "shrub.100",
                    }}
                    isDisabled={
                      fungibleAssets.water === 0 ||
                      !selectedItem.potsForWatering ||
                      !selectedItem.potsForWatering.length ||
                      fungibleAssets.water < selectedItem.potsForWatering.length
                    }
                  >
                    Water All
                  </Button>
                </Tooltip>
              )}
              {/*Water Button*/}
              {selectedItem.category === "pottedPlant" && stillGrowing && (
                <Tooltip
                  hasArrow
                  label={
                    fungibleAssets.water === 0 ||
                    selectedItem.wateringNextAvailable > new Date()
                      ? `Watering will become available for this potted plant on ${selectedItem.wateringNextAvailable.toLocaleString()}`
                      : "Watering is available!"
                  }
                  shouldWrapChildren
                  mt="3"
                >
                  <Button
                    onClick={() => {
                      setModalState("water");
                      openModal();
                    }}
                    flex={1}
                    fontSize={"xl"}
                    w={{ base: "315px", md: "420px" }}
                    rounded={"2xl"}
                    bgGradient="linear(to-l, #82caff, #d9efff, #a1d2e7)"
                    color={"black"}
                    boxShadow={"xl"}
                    _hover={{
                      bg: "shrub.200",
                    }}
                    _focus={{
                      bg: "shrub.100",
                    }}
                    isDisabled={
                      fungibleAssets.water === 0 ||
                      selectedItem.wateringNextAvailable > new Date()
                    }
                  >
                    Water
                  </Button>
                </Tooltip>
              )}

              {/*Plant Button*/}
              {selectedItem.category === "paperSeed" && (
                <Tooltip
                  hasArrow
                  label={
                    emptyPot ? "You must have an empty pot to plant seed" : null
                  }
                  shouldWrapChildren
                  mt="3"
                >
                  <Button
                    onClick={() => {
                      setModalState("plant");
                      openModal();
                    }}
                    w={{ base: "315px", md: "420px" }}
                    flex={1}
                    fontSize={"xl"}
                    rounded={"2xl"}
                    bgGradient="linear(to-l, #8fff6e,rgb(227, 214, 6),#b1e7a1)"
                    color={"black"}
                    boxShadow={"xl"}
                    _hover={{
                      bg: "shrub.200",
                    }}
                    _focus={{
                      bg: "shrub.100",
                    }}
                    isDisabled={emptyPot}
                  >
                    Plant
                  </Button>
                </Tooltip>
              )}
            </Stack>
            {selectedItem.category === "pottedPlant" && (
              <Stack mt={4} direction={"row"} spacing={4}>
                {/*fertilize button*/}
                {stillGrowing && (
                  <Tooltip
                    hasArrow
                    label={
                      fungibleAssets.fertilizer === 0
                        ? "You do not have fertilizer. First earn some."
                        : // : "Fertilizer is available!"
                        selectedItem.wateringNextAvailable > new Date()
                        ? `Fertilizing will become available for this potted plant on ${selectedItem.wateringNextAvailable.toLocaleString()}`
                        : "Fertilizing is available!"
                    }
                    shouldWrapChildren
                    mt="3"
                  >
                    <Button
                      onClick={() => {
                        setModalState("fertilize");
                        openModal();
                      }}
                      flex={1}
                      w={{ base: "150px", md: "202px" }}
                      fontSize={"xl"}
                      rounded={"2xl"}
                      bgGradient="linear(to-l, #8fff6e,rgb(227, 214, 6),#b1e7a1)"
                      color={"black"}
                      boxShadow={"xl"}
                      _hover={{
                        bg: "shrub.200",
                      }}
                      _focus={{
                        bg: "shrub.100",
                      }}
                      isDisabled={
                        fungibleAssets.fertilizer === 0 ||
                        selectedItem.wateringNextAvailable > new Date()
                      }
                    >
                      Fertilize
                    </Button>
                  </Tooltip>
                )}

                {/*harvest button*/}
                <Tooltip
                  hasArrow
                  label={
                    // stillGrowing
                    //   ? "Your potted plant will be ready to harvest at growth 100%. Until then keep watering, fertilizing and taking care!"
                    //   : null
                    "Harvesting is not available yet."
                  }
                  shouldWrapChildren
                  mt="3"
                >
                  <Button
                    onClick={() => {
                      setModalState("harvest");
                      openModal();
                    }}
                    as={motion.div}
                    animation={!stillGrowing ? animation : undefined}
                    flex={1}
                    w={
                      stillGrowing
                        ? { base: "150px", md: "202px" }
                        : { base: "315px", md: "420px" }
                    }
                    fontSize={"xl"}
                    rounded={"2xl"}
                    bgGradient={
                      !stillGrowing
                        ? "linear(to-r, #49f4ff, #fff, #8fff6e 50%, #3fe5ff)"
                        : undefined
                    }
                    color={"black"}
                    boxShadow={"xl"}
                    _hover={{
                      bg: "shrub.200",
                    }}
                    _focus={{
                      bg: "shrub.100",
                    }}
                    backgroundSize="400% 400%"
                    // isDisabled={stillGrowing}
                    isDisabled
                  >
                    Harvest
                  </Button>
                </Tooltip>
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
        size={isMobile ? "full" : "xl"}
      >
        <ModalOverlay />
        <MotionModalContent
          minH={"470px"}
          top="6rem"
          boxShadow="dark-lg"
          borderRadius="2xl"
          animate={
            isActivelyPlanting && {
              backgroundColor: [
                colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
                getSeedColor(selectedItem.type),
                colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
              ],
            }
          }
          // @ts-ignore
          transition={
            isActivelyPlanting && {
              duration: 0.25,
              delay: 1.97,
            }
          }
        >
          <ModalHeader>
            {modalState === "plant"
              ? "Plant Your Seed"
              : modalState === "water"
              ? "Water Your Potted Plant"
              : modalState === "waterAll"
              ? "Water All Eligible Potted Plants"
              : modalState === "fertilize"
              ? "Fertilize Your Potted Plant"
              : modalState === "harvest"
              ? "Harvest your Shrub"
              : "Unhandled State"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {localError && (
              <SlideFade in={true} unmountOnExit={true}>
                <Alert status="error" borderRadius={9}>
                  <AlertIcon />
                  {localError}
                </Alert>
              </SlideFade>
            )}
            {
              // When transaction is in flight
              approving || activeHash ? (
                <Center mt={20}>
                  {" "}
                  <Txmonitor
                    txHash={activeHash}
                    seed={selectedItem.type}
                    emotion={selectedItem.emotion}
                    growth={selectedItem.growth}
                    potsForWatering={selectedItem.potsForWatering}
                  />
                </Center>
              ) : (
                // Base States based on action clicked
                <>
                  {modalState === "plant" ? (
                    <Stack spacing={4}>
                      <Text textStyle={"reading"} fontSize={"lg"}>
                        You are about to turn
                      </Text>
                      <Divider borderColor={borderColor} />
                      <Stack spacing={4}>
                        <Feature
                          icon={
                            selectedItem &&
                            selectedItem.category === "paperSeed" && (
                              <Avatar
                                name="Seed"
                                bg="yellow.100"
                                size="xs"
                                src={
                                  IMAGE_ASSETS.seeds[selectedItem.type][
                                    selectedItem.emotion
                                  ]
                                }
                              />
                            )
                          }
                          iconBg={""}
                          text={`1 ${selectedItem.name}`}
                        />
                        <Feature
                          icon={
                            <Icon as={Pot} color={"green.500"} w={5} h={5} />
                          }
                          iconBg={iconBg}
                          text={"1 Empty Pot"}
                        />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          Into
                        </Text>
                        <Feature
                          icon={
                            selectedItem &&
                            selectedItem.category === "paperSeed" && (
                              <Avatar
                                name="Seed"
                                bg="yellow.100"
                                size="sm"
                                src={IMAGE_ASSETS.getPottedPlant(
                                  selectedItem.type,
                                  0,
                                  selectedItem.emotion
                                )}
                              />
                            )
                          }
                          iconBg={""}
                          text={"1 Potted Plant"}
                        />
                        <Divider borderColor={borderColor} />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          You will grow it into a Shrub{" "}
                          <Icon as={FaHeart} color={"red.500"} w={5} h={5} />
                        </Text>
                      </Stack>
                      {!plantingApproved && (
                        <>
                          <Text textStyle={"reading"} fontSize={"lg"}>
                            You must first approve your seed for planting
                          </Text>
                          <Text
                            textTransform={"uppercase"}
                            color={textColor}
                            bg={textBg}
                            fontWeight={600}
                            fontSize={"sm"}
                            p={2}
                            alignSelf={"flex-start"}
                            rounded={"md"}
                          >
                            You only have to approve once
                          </Text>
                        </>
                      )}
                      <Text
                        textTransform={"uppercase"}
                        color={"blue.400"}
                        fontWeight={600}
                        fontSize={"sm"}
                        bg={textBg2}
                        p={2}
                        alignSelf={"flex-start"}
                        rounded={"md"}
                      >
                        This action is irreversible
                      </Text>
                    </Stack>
                  ) : modalState === "water" ? (
                    <Stack spacing={4} mb={20}>
                      <Text textStyle={"reading"} fontSize={"lg"}>
                        Watering will result in
                      </Text>
                      <Divider borderColor={borderColor} />
                      <Stack spacing={4}>
                        <Feature
                          icon={<Icon as={WateringCan} w={7} h={7} />}
                          iconBg={textBg3}
                          text={"1 Water being used"}
                        />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          And
                        </Text>
                        <Feature
                          icon={
                            <Icon
                              as={RiHeartAddFill}
                              color={"red.500"}
                              w={5}
                              h={5}
                            />
                          }
                          iconBg={"pink.100"}
                          text={
                            "The growth number of your potted plant increasing"
                          }
                        />
                        <Divider borderColor={borderColor} />
                      </Stack>
                      <Text
                        textTransform={"uppercase"}
                        color={"blue.400"}
                        bg={textBg2}
                        fontWeight={600}
                        fontSize={"sm"}
                        p={2}
                        alignSelf={"flex-start"}
                        rounded={"md"}
                      >
                        Can only be done once per day per potted plant
                      </Text>
                    </Stack>
                  ) : modalState === "waterAll" ? (
                    <Stack spacing={4} mb={20}>
                      <Text textStyle={"reading"} fontSize={"lg"}>
                        Watering will result in
                      </Text>
                      <Divider borderColor={borderColor} />
                      <Stack spacing={4}>
                        <Feature
                          icon={<Icon as={WateringCan} w={7} h={7} />}
                          iconBg={textBg3}
                          text={`${
                            selectedItem.potsForWatering &&
                            selectedItem.potsForWatering.length
                          } Waters being used`}
                        />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          And
                        </Text>
                        <Feature
                          icon={
                            <Icon
                              as={RiHeartAddFill}
                              color={"red.500"}
                              w={5}
                              h={5}
                            />
                          }
                          iconBg={"pink.100"}
                          text={
                            "The growth number of all your eligible potted plants increasing"
                          }
                        />
                        <Divider borderColor={borderColor} />
                      </Stack>
                      <Text
                        textTransform={"uppercase"}
                        color={"blue.400"}
                        bg={textBg2}
                        fontWeight={600}
                        fontSize={"sm"}
                        p={2}
                        alignSelf={"flex-start"}
                        rounded={"md"}
                      >
                        Can only be done once per day
                      </Text>
                    </Stack>
                  ) : modalState === "fertilize" ? (
                    <Stack spacing={4}>
                      <Text textStyle={"reading"} fontSize={"lg"}>
                        Fertilizing will result in
                      </Text>
                      <Divider borderColor={borderColor} />
                      <Stack spacing={4}>
                        <Feature
                          icon={<Icon as={Fertilizer} w={5} h={5} />}
                          iconBg={iconBg}
                          text={"1 Fertilizer"}
                        />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          And
                        </Text>
                        <Feature
                          icon={<Icon as={WateringCan} w={7} h={7} />}
                          iconBg={textBg3}
                          text={"1 Water"}
                        />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          Being used
                        </Text>
                        <Divider borderColor={borderColor} />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          <Icon
                            as={RiHeartAddFill}
                            color={"red.500"}
                            w={5}
                            h={5}
                          />{" "}
                          Done in place of normal daily watering
                        </Text>
                        <Divider borderColor={borderColor} />
                        <Text textStyle={"reading"} fontSize={"lg"}>
                          <Icon
                            as={RiHeartAddFill}
                            color={"red.500"}
                            w={5}
                            h={5}
                          />{" "}
                          Potted plant grows more when fertilized
                        </Text>
                      </Stack>
                      <Text
                        textTransform={"uppercase"}
                        color={textColor}
                        bg={textBg}
                        fontWeight={600}
                        fontSize={"sm"}
                        p={2}
                        alignSelf={"flex-start"}
                        rounded={"md"}
                      >
                        One-time effect only. Will not affect future watering
                      </Text>

                      <Text
                        textTransform={"uppercase"}
                        color={"blue.400"}
                        fontWeight={600}
                        fontSize={"sm"}
                        bg={textBg2}
                        p={2}
                        alignSelf={"flex-start"}
                        rounded={"md"}
                      >
                        Can only be done once per day per potted plant
                      </Text>
                    </Stack>
                  ) : modalState === "harvest" ? (
                    <Center>
                      <Box textStyle={"reading"}>
                        <Text>
                          Harvesting will result in your potted plant and 1
                          Empty Pot converting into a fully-grown Shrub.
                        </Text>
                        <Text>This is irreversible.</Text>
                      </Box>
                    </Center>
                  ) : (
                    <></>
                  )}
                  {/*The action button*/}
                  <Center>
                    <Button
                      p={6}
                      mt={8}
                      mb={4}
                      cursor={"pointer"}
                      onClick={
                        modalState === "plant"
                          ? plantingApproved
                            ? handlePlanting
                            : handleApprove
                          : modalState === "water"
                          ? handleWatering
                          : modalState === "waterAll"
                          ? handleWaterAll
                          : modalState === "fertilize"
                          ? handleFertilizing
                          : modalState === "harvest"
                          ? handleHarvesting
                          : () => console.log("unexpected state")
                      }
                      flex={1}
                      fontSize={"xl"}
                      rounded={"2xl"}
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
                          ? "Let's Plant"
                          : "Approve Seed for Planting"
                        : modalState === "water"
                        ? "Water"
                        : modalState === "waterAll"
                        ? "Water All"
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
          </ModalBody>
        </MotionModalContent>
      </Modal>
    </>
  );
}

export default SeedDetails;
