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
  const saleDay = new Date("2022-06-08T13:00:00Z");
  return (
    <Container
      mt={isMobile ? 30 : 50}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW="container.lg"
    >
      <Center>
        <Box maxW="60rem" mb={8} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "72px" }}
            letterSpacing={"tight"}
            mt={{ base: 8 }}
          >
            Paper Gardens Sale
          </Heading>
          <Box maxW="60rem" textAlign={"center"} mt={2}>
            <Text
              fontSize={{ base: "20px", md: "30px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
            >
              TIME TO GROW
            </Text>
          </Box>
        </Box>
      </Center>
      <Center>
        <Box maxW="60rem" mb={4} textAlign={"center"} mt={{ base: 5, md: 5 }}>
          <Text fontSize={{ base: "30px", md: "30px" }} fontWeight="semibold">
            <CountdownTimer targetDate={saleDay} />
          </Text>
        </Box>
      </Center>
      <Center mt={{ base: 5, md: 5 }}>
        <Box
          bgColor={useColorModeValue("gray.200", "gray.700")}
          p={10}
          rounded="3xl"
        >
          <Box
            fontSize={{ base: "18px", md: "20px" }}
            mt={4}
            fontWeight="semibold"
            textDecoration="line-through"
          >
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.400")}
            >
              NFT Ticket Pre-Sale
            </Text>
            <Text>Wednesday, June 8</Text>
          </Box>
          <Text
            fontSize={{ base: "18px", md: "20px" }}
            mt={8}
            fontWeight="semibold"
          >
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.400")}
            >
              NFT Ticket Public Pre-Sale
            </Text>
            <Text>Thursday, June 9</Text>
            <Link
              as={ReachLink}
              to="/presale"
              fontSize={"md"}
              variant={"link"}
              fontWeight={"extrabold"}
              color={useColorModeValue("blue", "cyan")}
              px={2}
              py={{ base: "3", md: "1", lg: "1" }}
              rounded={"lg"}
            >
              Mint NFT Now
            </Link>
          </Text>
          <Text
            fontSize={{ base: "18px", md: "20px" }}
            mt={8}
            fontWeight="semibold"
          >
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.400")}
            >
              Public Pot Sale
            </Text>
            <Text>Thursday, June 16</Text>
          </Text>
        </Box>
      </Center>
      <Center>
        <Link
          href="#faqs"
          cursor="pointer"
          rounded="3xl"
          fontSize="lg"
          px="9"
          fontWeight="semibold"
          py="5"
          bgGradient={useColorModeValue(
            "linear(to-l, green, green)",
            "linear(to-l, #fbb8ff, #e55b5b)"
          )}
          bgClip="text"
        >
          Sale Details
        </Link>
      </Center>
      {/*<Center>*/}
      {/*  {Fade(*/}
      {/*    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],*/}
      {/*    <Leaf1 boxSize={40} ml={5} />*/}
      {/*  )}*/}
      {/*  {Fade([0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], <Leaf2 boxSize={40} />)}*/}
      {/*  {Fade([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0], <Leaf3 boxSize={40} />)}*/}
      {/*  {Fade([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0], <Leaf4 boxSize={40} />)}*/}
      {/*  {Fade(*/}
      {/*    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],*/}
      {/*    <Icon as={BsQuestionLg} boxSize={40} />*/}
      {/*  )}*/}
      {/*  <Pot*/}
      {/*    boxSize={60}*/}
      {/*    position={"absolute"}*/}
      {/*    top={{ base: "400px", md: "580px" }}*/}
      {/*  />*/}
      {/*</Center>*/}
    </Container>
  );
}

export default PotSaleCountdown;
