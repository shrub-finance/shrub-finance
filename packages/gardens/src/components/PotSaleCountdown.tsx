import { isMobile } from "react-device-detect";
import {
  Box,
  Heading,
  Center,
  Container,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { Leaf1, Leaf2, Leaf3, Leaf4, Pot } from "../assets/Icons";
import { Fade } from "./animations/Fade";
import CountdownTimer from "./CountdownTimer";
import { BsQuestionLg } from "react-icons/all";
import { Icon } from "@chakra-ui/icons";
import { Link as ReachLink } from "@reach/router";
import React from "react";

function PotSaleCountdown() {
  const saleDay = new Date("2022-06-25T14:00:00Z");
  return (
    <Container
      mt={isMobile ? 30 : 50}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW="container.lg"
    >
      <Center>
        <Box
          maxW="60rem"
          // mb={8}
          textAlign={"center"}
        >
          <Heading
            fontSize={{ base: "30px", md: "72px" }}
            letterSpacing={"tight"}
            mt={{ base: 8 }}
          >
            Paper Gardens
          </Heading>
          <Box maxW="60rem" textAlign={"center"} mt={2}>
            <Text
              fontSize={{ base: "20px", md: "30px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
            >
              {!isMobile
                ? "An NFT series for builders and innovators"
                : "An NFT series for builders and innovators"}
            </Text>
          </Box>
        </Box>
      </Center>
      {/*<Center>*/}
      {/*  <Box*/}
      {/*    bgColor={useColorModeValue("gray.200", "gray.700")}*/}
      {/*    p={10}*/}
      {/*    rounded="3xl"*/}
      {/*  >*/}
      {/*    <Box fontSize={{ base: "18px", md: "20px" }} fontWeight="semibold">*/}
      {/*      <Text*/}
      {/*        fontSize="sm"*/}
      {/*        color={useColorModeValue("gray.600", "gray.400")}*/}
      {/*      >*/}
      {/*        Pot Sale*/}
      {/*      </Text>*/}
      {/*      <Text>MINT IS LIVE!</Text>*/}
      {/*      <Link*/}
      {/*        as={ReachLink}*/}
      {/*        textDecoration={"underline"}*/}
      {/*        to="/mint"*/}
      {/*        fontSize={"lg"}*/}
      {/*        variant={"link"}*/}
      {/*        fontWeight={"extrabold"}*/}
      {/*        color={useColorModeValue("blue", "cyan")}*/}
      {/*        px={2}*/}
      {/*        py={{ base: "3", md: "1", lg: "1" }}*/}
      {/*        rounded={"lg"}*/}
      {/*      >*/}
      {/*        &#127881; Mint NFT Now! &#127881;*/}
      {/*      </Link>*/}
      {/*    </Box>*/}
      {/*  </Box>*/}
      {/*</Center>*/}
      {/*<Center>*/}
      {/*  <Link*/}
      {/*    href="#faqs"*/}
      {/*    cursor="pointer"*/}
      {/*    rounded="3xl"*/}
      {/*    fontSize="sm"*/}
      {/*    px="9"*/}
      {/*    fontWeight="bold"*/}
      {/*    py="5"*/}
      {/*    bgGradient={useColorModeValue(*/}
      {/*      "linear(to-l, green, green)",*/}
      {/*      "linear(to-l, gray.300, blue.200)"*/}
      {/*    )}*/}
      {/*    bgClip="text"*/}
      {/*  >*/}
      {/*    Mint Details*/}
      {/*  </Link>*/}
      {/*</Center>*/}
    </Container>
  );
}

export default PotSaleCountdown;
