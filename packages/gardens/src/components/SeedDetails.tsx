import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Heading,
  Image,
  keyframes,
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
import { IMAGE_ASSETS } from "../utils/imageAssets";
import Confetti from "../assets/Confetti";

function SeedDetails({
  hooks,
  handleErrorMessages,
}: {
  hooks: {
    mySeedDataLoading: any;
    mySeedDataError: any;
    selectedItem: any;
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
    emptyPot,
    holdsPottedPlant,
    fungibleAssets,
  } = hooks;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const controls = useAnimation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { pendingTxs } = useContext(TxContext);
  const [plantingApproved, setPlantingApproved] = useState(false);
  const [localError, setLocalError] = useState("");
  const [approving, setApproving] = React.useState(false);
  const [noPot, setNoPot] = React.useState(false);
  const [stillGrowing, setStillGrowing] = React.useState(true);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [modalState, setModalState] = useState<
    "plant" | "water" | "fertilize" | "harvest" | "planting"
  >("plant");

  const [activeHash, setActiveHash] = useState<string>();

  const animationKeyframes = keyframes`
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
`;

  const animation = `${animationKeyframes} 4s ease-out infinite`;

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

  // Disable action if no pot
  useEffect(() => {
    if (!emptyPot) {
      setNoPot(true);
    }
  }, [emptyPot]);

  // Disable action if not ready for harvest
  useEffect(() => {
    if (selectedItem.growth === 10000) {
      setStillGrowing(false);
    }
  }, [selectedItem.growth]);

  // Move errors to the top
  useEffect(() => {
    console.log("useEffect - error to top");
    window.scrollTo(0, 0);
  }, [localError, web3Error]);

  // determine if planting is approved
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
  }, [account, selectedItem, pendingTxsState]);

  // Start animation
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    console.log(" animation effect starts");
    setTimeout(() => {
      controls.start("final");
    }, 1);
  }, []);

  const MotionModalContent = motion<ModalContentProps>(ModalContent);

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
        setShowConfetti(true);
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
      {activeHash && showConfetti && <Confetti />}
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
            boxShadow={"dark-lg"}
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
                    {`You have: ${selectedItem.quantity} ${selectedItem.category}`}
                  </Badge>
                </Stack>
                {["water", "fertilizer"].includes(selectedItem.category) ? (
                  <>
                    <Text pt={6} textAlign={"center"} textStyle={"reading"}>
                      You need 1{" "}
                      {selectedItem.category === "water"
                        ? "water"
                        : "fertilizer"}{" "}
                      per plant
                    </Text>
                    <Text pt={2} textAlign={"center"} textStyle={"reading"}>
                      To{" "}
                      {selectedItem.category === "water"
                        ? "water"
                        : "fertilizer"}
                      ,{" "}
                      {holdsPottedPlant
                        ? "select a potted plant on the right"
                        : "plant a seed first"}
                    </Text>
                  </>
                ) : (
                  <Text pt={2} textAlign={"center"} textStyle={"reading"}>
                    To plant, select a seed on the right
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
              {selectedItem.category === "pottedPlant" && stillGrowing && (
                <Tooltip
                  hasArrow
                  label={
                    fungibleAssets.water === 0
                      ? "You do not have water yet. First get some water from the water faucet."
                      : null
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
                    fontSize={"sm"}
                    w={"420px"}
                    rounded={"full"}
                    bgGradient="linear(to-l, #82caff, #d9efff, #a1d2e7)"
                    color={"black"}
                    boxShadow={"xl"}
                    _hover={{
                      bg: "shrub.200",
                    }}
                    _focus={{
                      bg: "shrub.100",
                    }}
                    isDisabled={fungibleAssets.water === 0}
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
                    noPot ? "You must have an empty pot to plant seed" : null
                  }
                  shouldWrapChildren
                  mt="3"
                >
                  <Button
                    onClick={() => {
                      setModalState("plant");
                      openModal();
                    }}
                    w={"420px"}
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
                    isDisabled={noPot}
                  >
                    Plant
                  </Button>
                </Tooltip>
              )}
            </Stack>
            {selectedItem.category === "pottedPlant" && (
              <Stack mt={8} direction={"row"} spacing={4}>
                {/*fertilize button*/}
                {stillGrowing && (
                  <Tooltip
                    hasArrow
                    label={
                      fungibleAssets.fertilizer === 0
                        ? "You do not have fertilizer. First earn some."
                        : null
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
                      w={"202px"}
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
                      isDisabled={fungibleAssets.fertilizer === 0}
                    >
                      Fertilize
                    </Button>
                  </Tooltip>
                )}

                {/*harvest button*/}
                <Tooltip
                  hasArrow
                  label={
                    stillGrowing
                      ? "Your potted plant will be ready to harvest at growth 100%. Until then keep watering, fertilizing and taking care!"
                      : null
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
                    w={stillGrowing ? "202px" : "420px"}
                    fontSize={"sm"}
                    rounded={"full"}
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
                    isDisabled={stillGrowing}
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
        size={"xl"}
      >
        <ModalOverlay />
        <MotionModalContent
          minH={"470px"}
          top="6rem"
          boxShadow="dark-lg"
          borderRadius="2xl"
          // animate={{
          //   backgroundColor: [
          //     colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
          //     "#ffd06b",
          //     colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
          //   ],
          // }}
          //@ts-ignore
          // transition={{
          //   duration: 0.25,
          //   delay: 1.97,
          // }}
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
                <Txmonitor txHash={activeHash} />
              ) : (
                // Base States based on action clicked
                <>
                  {modalState === "plant" ? (
                    <Center>
                      <Box textStyle={"reading"} fontSize={"md"}>
                        <Text>
                          Planting will result in{selectedItem.name} and 1 Empty
                          Pot converting into a potted plant that you can grow
                          into a Shrub
                        </Text>
                        <Text>This is irreversible.</Text>
                        {!plantingApproved && (
                          <Text>
                            You must also first approve your seed for planting.
                            You only have to do it once.
                          </Text>
                        )}
                      </Box>
                    </Center>
                  ) : modalState === "water" ? (
                    <Center>
                      <Box textStyle={"reading"}>
                        <Text>
                          Watering will result in 1 Water being consumed, and in
                          turn increasing the growth number of your potted
                          plant.
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
                        <Text>
                          Fertilizing will result in 1 Fertilizer plus 1 Water
                          being consumed. This is done in place of a normal
                          daily watering. Your potted plant will grow more
                          compared to when simply watered
                        </Text>
                        <Text>
                          This is a one-time effect, it will not affect future
                          watering
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
                          ? "Ready to Plant"
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
