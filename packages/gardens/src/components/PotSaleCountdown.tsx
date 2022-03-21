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
import AnimatedPot from "./AnimatedPot";
import CountdownTimer from "./CountdownTimer";
import { BsQuestionLg } from "react-icons/all";
import { Icon } from "@chakra-ui/icons";

function PotSaleCountdown() {
  const saleDay = new Date("2022-04-22T22:00:00Z");
  return (
    <Container
      mt={isMobile ? 30 : 50}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW="container.lg"
    >
      <Center mt={10}>
        <Box maxW="60rem" mb={8} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
          >
            Time to Grow
          </Heading>
          <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
            <Text
              fontSize={{ base: "20px", md: "30px" }}
              fontWeight="semibold"
              color={useColorModeValue("gray.500", "gray.400")}
            >
              CHAPTER 3
            </Text>
          </Box>
          <Box
            maxW="60rem"
            mb={4}
            textAlign={"center"}
            mt={{ base: 10, md: 20 }}
          >
            <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="semibold">
              <CountdownTimer targetDate={saleDay} />
            </Text>
            {/*<Link href="/intro" cursor="pointer" textDecoration="underline">*/}
            {/*  Paper Gardens Main*/}
            {/*</Link>*/}
          </Box>
        </Box>
      </Center>
      <Center>
        {AnimatedPot(
          [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          <Leaf1 boxSize={40} ml={5} />
        )}
        {AnimatedPot(
          [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
          <Leaf2 boxSize={40} />
        )}
        {AnimatedPot(
          [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
          <Leaf3 boxSize={40} />
        )}
        {AnimatedPot(
          [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
          <Leaf4 boxSize={40} />
        )}
        {AnimatedPot(
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
          <Icon as={BsQuestionLg} boxSize={40} />
        )}
        <Pot
          boxSize={60}
          position={"absolute"}
          top={{ base: "400px", md: "580px" }}
        />
      </Center>
    </Container>
  );
}

export default PotSaleCountdown;
