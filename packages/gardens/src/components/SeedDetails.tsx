import {
  Badge,
  Box,
  BoxProps,
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
  useDisclosure,
  useTimeout,
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
  const [explosion, setExplosion] = useState(false);
  const controls = useAnimation();
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    console.log(" iam here");
    setTimeout(() => {
      controls.start("final");
    }, 1);
  }, [isOpen]);

  const MotionModalContent = motion<ModalContentProps>(ModalContent);

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
                src={
                  selectedItem.emotion === "sad"
                    ? `https://shrub.finance/${selectedItem.type.toLowerCase()}-sad.svg`
                    : `https://shrub.finance/${selectedItem.type.toLowerCase()}.svg`
                }
                alt="Seed"
              />
            </Center>
            {/*title*/}
            <Center mt={6}>
              <Heading fontSize={{ base: "lg", md: "xl", lg: "2xl" }}>
                {selectedItem.name}
              </Heading>
            </Center>
            <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
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
            <Stack align={"center"} justify={"center"} direction={"row"} mt={2}>
              <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                Class: {selectedItem.type}
              </Badge>
              <Badge px={2} py={1} fontWeight={"600"} rounded={"lg"}>
                DNA: {selectedItem.dna}
              </Badge>
            </Stack>

            <Stack mt={8} direction={"row"} spacing={4}>
              <Button
                flex={1}
                fontSize={"sm"}
                rounded={"full"}
                _focus={{
                  bg: "gray.200",
                }}
              >
                Action A
              </Button>
              <Button
                onClick={onOpen}
                flex={1}
                fontSize={"sm"}
                rounded={"full"}
                bg={"blue.400"}
                color={"white"}
                boxShadow={
                  "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                }
                _hover={{
                  bg: "blue.500",
                }}
                _focus={{
                  bg: "blue.500",
                }}
              >
                Plant
              </Button>
            </Stack>
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
        {/*<MotionModalContent*/}
        {/*  animate={{*/}
        {/*    backgroundColor: ["#60F", "#09F", "#FA0"],*/}
        {/*    transition: {*/}
        {/*      delay: 1,*/}
        {/*      duration: 2,*/}
        {/*      ease: [0.075, 0.82, 0.165, 1],*/}
        {/*      repeat: Infinity,*/}
        {/*      repeatType: "reverse"*/}
        {/*    }*/}
        {/*  }}*/}
        {/*>*/}
        <MotionModalContent
          top="6rem"
          boxShadow="dark-lg"
          borderRadius="2xl"
          animate={{
            backgroundColor: ["white", "#ffd06b"],
            transition: {
              delay: 1,
              duration: 2,
              ease: [0.075, 0.82, 0.165],
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}

          // bg={explosion ? "#ffd06b" : "white"}
        >
          <ModalHeader>Plant your seed</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={40}>
            <Center>
              {TransformScale(
                <FlyingSeed boxSize={20} />,
                setExplosion,
                controls
              )}
            </Center>
            <Center>
              {Disappear(<PlantingPot boxSize={40} />, controls)}
              {Appear(<WonderPot boxSize={40} />, controls)}
            </Center>
          </ModalBody>
        </MotionModalContent>
        {/*</MotionModalContent>*/}
      </Modal>
    </>
  );
}

export default SeedDetails;
