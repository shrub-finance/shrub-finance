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
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { isMobile } from "react-device-detect";
import {
  FlyingSeed,
  Leaf1,
  Leaf2,
  Pot,
  Water,
  WateringCan,
  WonderPot,
} from "../assets/Icons";
import {
  Grow,
  Scale,
  Shake,
  Spray,
  Tilt,
  TransformScale,
} from "./animations/TransformScale";
import { Disappear, Appear } from "./animations/Fade";
import { motion, useAnimation } from "framer-motion";
import { GiHeartPlus } from "react-icons/all";
import { Icon } from "@chakra-ui/icons";

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
  const dropColor = useColorModeValue("blue.300", "blue.100");

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
                Water
              </Button>
              <Button
                flex={1}
                fontSize={"sm"}
                rounded={"full"}
                _focus={{
                  bg: "gray.200",
                }}
              >
                Plant
              </Button>
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
          top="6rem"
          minH={"470px"}
          boxShadow="dark-lg"
          borderRadius="2xl"
        >
          <ModalHeader>Plant your seed</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={40}>
            {/*watering animation*/}
            <Center>
              {Shake(
                <WonderPot
                  boxSize={40}
                  position={"relative"}
                  left={"88px"}
                  bottom={"-72px"}
                />,
                controls
              )}
              <Center>
                {/*<Center visibility={"hidden"}>*/}
                {/*    <Leaf2*/}
                {/*      boxSize={28}*/}
                {/*      position={"absolute"}*/}
                {/*      bottom={"141px"}*/}
                {/*      left={"237px"}*/}
                {/*    />*/}
                {/*</Center>*/}
                <Center>
                  {Grow(
                    <Leaf1
                      boxSize={28}
                      position={"absolute"}
                      bottom={"141px"}
                      left={"237px"}
                    />,
                    controls
                  )}
                </Center>
                <Center>
                  {Spray(
                    <Water
                      stroke={dropColor}
                      boxSize={28}
                      position={"absolute"}
                      top={"224px"}
                      right={"210px"}
                    />,
                    controls
                  )}
                  {Tilt(<WateringCan boxSize={44} />, controls)}
                </Center>
              </Center>
            </Center>
          </ModalBody>
        </MotionModalContent>
      </Modal>
    </>
  );
}

export default SeedDetails;
