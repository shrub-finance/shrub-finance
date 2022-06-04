import {
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
  Spinner,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FlyingSeed, PlantingPot, WonderPot } from "../assets/Icons";
import { TransformScale } from "./animations/TransformScale";
import { Disappear, Appear } from "./animations/Fade";
import { motion, useAnimation } from "framer-motion";

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
  const [plantingApproved, setPlantingApproved] = useState(false);

  // On selection changing
  useEffect(() => {
    if (selectedItem.category !== "paperSeed") {
      setPlantingApproved(false);
      return;
    }
    // Check the approvalStatus
  }, [selectedItem]);

  // For Modal
  useEffect(() => {
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

  return (
    <>
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
