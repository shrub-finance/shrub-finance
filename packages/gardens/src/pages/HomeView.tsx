import { isMobile } from "react-device-detect";
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import React from "react";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import { PaperGardensLogo } from "../assets/Icons";

function HomeView(props: RouteComponentProps) {
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
            Paper Gardens
          </Heading>
          <Text
            mt="3"
            mb={{ base: "16", md: "20", lg: "20" }}
            fontSize="18px"
            textAlign="center"
            px={["4rem", "5rem", "10rem", "10rem"]}
          >
            {isMobile
              ? "An interactive NFT story tied to Shrub Paper."
              : " Paper Gardens is an interactive multi-chapter story, full of NFTs, rewards, and fun tied to Shrub Paper."}
          </Text>
          <Link
            href="https://opensea.io/collection/shrub-paper-gardens"
            isExternal
            cursor="pointer"
            rounded="3xl"
            size="sm"
            px="6"
            fontSize="25px"
            fontWeight="semibold"
            py="5"
            _hover={{ transform: "translateY(-2px)" }}
            bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
            color={"black"}
          >
            View Collection <ExternalLinkIcon mx="2px" />
          </Link>
          <Center mt={10}>
            <PaperGardensLogo boxSize={{ base: "xs", md: "xl" }} />
          </Center>

          <Box maxW="60rem" mb={4} textAlign={"center"} mt={6}>
            <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="semibold">
              The Inspiration
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">
              At Shrub, we talked to many users. And over and over again what we
              heard was, “Options are hard”. So we challenged ourselves to
              figure out the most interesting way to learn crypto options. Paper
              Gardens is our answer. Born out of love for simplicity and DeFi,
              Paper Gardens is a fruit of labor and love. An innovative way to
              make options accessible to everyone.
            </Text>
          </Box>
          <Box maxW="60rem" mb={4} textAlign={"center"} mt={20}>
            <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="semibold">
              The Story
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">
              A mysterious man calling himself the paper merchant has come to
              town with seeds of different varieties. These seeds are calling
              for gardeners...
            </Text>
          </Box>
          <Button
            rightIcon={<ArrowForwardIcon />}
            size="lg"
            fontSize="25px"
            py="9"
            variant="solid"
            rounded="3xl"
            _hover={{ transform: "translateY(-2px)" }}
            bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
            as={ReachLink}
            to={"/chapters"}
            color={"black"}
          >
            Read More
          </Button>
          <Box maxW="60rem" mb={4} textAlign={"center"} mt={20}>
            <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="semibold">
              FAQs
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">What is the inspiration behind Paper Gardens?</Text>
            <Text pt="4">
              We wanted to bring the most interesting way to learn crypto
              options to the space. An interactive multi-chapter story full of
              NFTs, rewards, and surprises.
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">How many chapters are there?</Text>
            <Text pt="4">
              Chapters unfold over time. Currently we are in Chapter 2.
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">What is happening right now?</Text>
            <Text pt="4">We are in Chapter 2.</Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">What does it all lead to?</Text>
            <Text pt="4">
              As Ralph Waldo Emerson said, “Its the not the destination, it's
              the journey.” The paper gardeners are walking down a new path that
              has never been taken before. What lies on the other end is only to
              be found by the seekers. Through this journey we will gather all
              the like-minded people together whose interests are aligned with
              Shrub's mission and who want to grow together with Shrub.
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">
              I missed out on Chapter 1. Is it too late to join?
            </Text>
            <Text pt="4">
              No. You can still participate in the Paper Gardens by getting a
              seed from{" "}
              <Link
                isExternal
                href="https://opensea.io/collection/shrub-paper-gardens"
                textDecoration="underline"
              >
                OpenSea
              </Link>
              , and joining your fellow gardeners in the journey.
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">
              Where can I find out about important dates, and events in the
              Paper Garden journey?
            </Text>
            <Text pt="4">
              Shrub will keep everyone up to date on Shrub news via our{" "}
              <Link
                isExternal
                href="https://twitter.com/shrubfinance"
                textDecoration="underline"
              >
                Twitter
              </Link>
              . If you have any questions about the project, the best way is to
              join{" "}
              <Link
                isExternal
                href="https://discord.gg/swbVfEPyT8"
                textDecoration="underline"
              >
                Shrub's Discord
              </Link>
              . Shrub's core team makes a point to be available and respond to
              every question promptly.
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">Why should I join?</Text>
            <Text pt="4">
              <UnorderedList>
                <ListItem>
                  Earn forever bragging rights for being an early supporter of
                  Shrub.
                </ListItem>
                <ListItem>
                  Join a growing community of gardeners who believe in doing
                  things in style.
                </ListItem>
              </UnorderedList>
            </Text>
          </Box>
          <Link
            href="https://opensea.io/collection/shrub-paper-gardens"
            isExternal
            cursor="pointer"
            rounded="3xl"
            size="sm"
            px="6"
            fontSize="25px"
            fontWeight="semibold"
            py="5"
            _hover={{ transform: "translateY(-2px)" }}
            bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
            color={"black"}
          >
            View Collection <ExternalLinkIcon mx="2px" />
          </Link>

          {/*community section*/}
          <Box maxW="60rem" mb={4} textAlign={"center"} mt={20}>
            <Text fontSize={{ base: "20px", md: "30px" }} fontWeight="semibold">
              Join the Community
            </Text>
          </Box>
          <Box maxW="60rem" mb={8} fontSize="20px" textStyle={"reading"}>
            <Text pt="8">
              Thousands of gardeners have been chosen by the seeds. The rest are
              being adopted by new gardeners. Learn all about the seeds, and
              become a part of the journey.
            </Text>
          </Box>
          <Link
            href="https://discord.gg/YnHsUP8g"
            isExternal
            cursor="pointer"
            rounded="3xl"
            size="sm"
            px="6"
            fontSize="25px"
            fontWeight="semibold"
            py="5"
            _hover={{ transform: "translateY(-2px)" }}
            bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
            color={"black"}
          >
            Join Discord <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
      </Center>
    </Container>
  );
}

export default HomeView;
