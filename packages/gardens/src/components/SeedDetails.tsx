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
  isApprovedErc721,
  mint,
  mintWL,
  plant,
} from "../utils/ethMethods";
import { useWeb3React } from "@web3-react/core";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { ethers } from "ethers";
import { ToastDescription } from "./TxMonitoring";
import { TxContext } from "./Store";

function SeedDetails({
  hooks,
}: {
  hooks: {
    mySeedDataLoading: any;
    mySeedDataError: any;
    selectedItem: any;
  };
}) {
  const { mySeedDataLoading, mySeedDataError, selectedItem } = hooks;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const controls = useAnimation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { pendingTxs } = useContext(TxContext);
  const [plantingApproved, setPlantingApproved] = useState(false);
  const [localError, setLocalError] = useState("");
  const [activeHash, setActiveHash] = useState<string>();
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

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

  // For Modal
  useEffect(() => {
    console.log("useEffect - isOpen");
    if (!isOpen) {
      return;
    }
    console.log(" animation effect starts");
    setTimeout(() => {
      controls.start("final");
    }, 1);
  }, [isOpen]);

  const MotionModalContent = motion<ModalContentProps>(ModalContent);
  console.log(selectedItem);

  async function handleApprove() {
    const description = "Approving Paper Seeds for planting";
    try {
      console.log(PAPERSEED_ADDRESS, PAPER_POT_ADDRESS);
      const tx = await approveAllErc721(
        PAPERSEED_ADDRESS,
        PAPER_POT_ADDRESS,
        true,
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
      handleErrorMessages({ err: e });
    }
  }

  async function handlePlanting() {
    setLocalError("");
    // setIsMinted(false);
    // setNftImageId("");
    // setTokenId(0);
    // setNftTitle("");
    // setIsLoading(true);
    const description = "Planting";
    try {
      const tx = await plant(selectedItem.tokenId, library);
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
      handleErrorMessages({ err: e });
    }
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
            {selectedItem.category === "paperSeed" && (
              <>
                <Stack
                  align={"center"}
                  justify={"center"}
                  direction={"row"}
                  mt={6}
                >
                  <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                    Rarity:{" "}
                    {selectedItem.type === "Hope"
                      ? "Rare"
                      : selectedItem.type === "Power"
                      ? "Legendary"
                      : selectedItem.type === "Passion"
                      ? "Uncommon"
                      : "Common"}
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
                  onClick={onOpen}
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
                  onClick={onOpen}
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
        onClose={onClose}
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
          <ModalHeader>Plant your seed</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={40}>
            <Center>
              <Box textStyle={"reading"}>
                <Text>Planting will result in</Text>
                <Text>{selectedItem.name}</Text>
                <Text>and</Text>
                <Text>1 Empty Pot</Text>
                <Text>
                  converting into a potted plant that you can grow into a Shrub
                </Text>
                <Text>This is irrevesible.</Text>
                {!plantingApproved && (
                  <Text>
                    You must also first approve your seed for planting
                  </Text>
                )}
              </Box>
            </Center>
            <Center>
              <Button
                // onClick={onOpen}
                onClick={plantingApproved ? handlePlanting : handleApprove}
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
                {plantingApproved ? "Plant" : "Approve Seed for Planting"}
              </Button>
            </Center>
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
