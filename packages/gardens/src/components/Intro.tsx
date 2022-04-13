import { isMobile } from "react-device-detect";
import {
  AspectRatio,
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  Image,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import { ExternalLinkIcon, Icon } from "@chakra-ui/icons";
import React from "react";
import { RouteComponentProps } from "@reach/router";
import { GoofyWonder, Pot, Ticket, WonderPot } from "../assets/Icons";
import { FaLongArrowAltRight, FaPlus } from "react-icons/all";

function Intro(props: RouteComponentProps) {
  return (
    <Container
      mt={{ base: 110, md: 50 }}
      p={5}
      flex="1"
      borderRadius="2xl"
      maxW={{ base: "container.xs", md: "container.lg" }}
    >
      <Box maxW="80rem" mb={8} textAlign={"center"}>
        <Heading
          fontSize={{ base: "30px", md: "90px" }}
          letterSpacing={"tight"}
        >
          What will you grow?
          {/*<Text as="span">Shrub </Text>{" "}*/}
          {/*<Text*/}
          {/*  as="span"*/}
          {/*  bgGradient="linear(145deg, #ffa9c2, #d05b17)"*/}
          {/*  bgClip="text"*/}
          {/*>*/}
          {/*  Paper Gardens*/}
          {/*</Text>*/}
        </Heading>
        <Text
          mt="3"
          mb={{ base: "16", md: "20", lg: "20" }}
          fontSize="28px"
          textAlign="center"
          px={["4rem", "5rem", "10rem", "10rem"]}
        >
          {/*An interactive NFT story like no other.*/}
        </Text>
        <AspectRatio ratio={16 / 9}>
          <iframe
            title="shrub trailer"
            src="https://www.youtube.com/embed/O5DSYCrSWEo"
            allowFullScreen
          />
        </AspectRatio>
      </Box>
      <Grid
        gap={[20, 32]}
        mt={{ base: 20, md: 60 }}
        templateColumns={[
          "repeat(1, 1fr)",
          "repeat(1, 1fr)",
          "repeat(1, 1fr)",
          "repeat(1, 1fr)",
          "repeat(2, 1fr)",
          "repeat(2, 1fr)",
        ]}
      >
        {/*section 1*/}
        <Box maxW="80rem" mb={8}>
          <Heading
            fontSize={{ base: "30px", md: "70px" }}
            letterSpacing={"tight"}
            maxW={{ base: "20rem", md: "40rem" }}
          >
            The first on-chain growth NFT
          </Heading>
          <Text
            mt="3"
            fontSize={{ base: "20px", md: "28px" }}
            maxW={{ base: "22rem", md: "40rem" }}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Plant your seed, grow a shrub. Planting your Paper Seed into a pot
            yields a Potted Plant. For the first time ever, grow your NFT by
            interacting with it on-chain.
          </Text>
        </Box>
        <HStack>
          <Pot boxSize={{ base: 20, md: 60 }} />
          <Icon as={FaPlus} boxSize={{ base: 12, md: 16 }} />
          <GoofyWonder boxSize={{ base: 20, md: 60 }} />
          <Icon as={FaLongArrowAltRight} boxSize={{ base: 12, md: 20 }} />
          <WonderPot boxSize={{ base: 20, md: 60 }} />
        </HStack>

        {/*section 2*/}
        <Box></Box>

        <Box maxW="80rem" mb={8}>
          <Heading
            fontSize={{ base: "30px", md: "70px" }}
            letterSpacing={"tight"}
            maxW={{ base: "20rem", md: "40rem" }}
          >
            Grow your Shrub on-chain
          </Heading>
          <Text
            mt="3"
            fontSize={{ base: "20px", md: "28px" }}
            maxW={{ base: "22rem", md: "40rem" }}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Take care of your plant to help it grow. Potted plants need water to
            grow big and strong. Fertilizer can also provide a boost! See the
            traits of your plant update on OpenSea after you interact with it.
          </Text>
        </Box>
        {/*section 3*/}
        <Box maxW="80rem" mb={8}>
          <Heading
            fontSize={{ base: "30px", md: "70px" }}
            letterSpacing={"tight"}
            maxW={{ base: "20rem", md: "40rem" }}
          >
            Harvest your Shrub
          </Heading>
          <Text
            mt="3"
            fontSize={{ base: "20px", md: "28px" }}
            maxW={{ base: "22rem", md: "40rem" }}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Once your potted plant is fully grown it is time to harvest. Out
            will come a shrub, based on the type of seed you planted, its
            emotion and its DNA. Some combinations result in rare traits! Every
            Shrub is unique.
          </Text>
        </Box>
        <Box boxSize={["sm", "md", "lg", "xl", "4xl"]}>
          <Image
            src="https://shrub.finance/lovely-passion-shrub.webp"
            fallbackSrc="https://shrub.finance/lovely-passion-shrub.png"
            alt="Lovely"
          />
        </Box>
        {/*section 4*/}
        <GridItem />
        <GridItem>
          <Heading
            fontSize={{ base: "30px", md: "70px" }}
            letterSpacing={"tight"}
            maxW={{ base: "20rem", md: "40rem" }}
          >
            The story so far
          </Heading>
          <Text
            mt="3"
            fontSize={{ base: "20px", md: "28px" }}
            maxW={{ base: "22rem", md: "40rem" }}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            It all started with a visit from the mysterious traveller the Paper
            Merchant. He came with seeds to give to the chosen. Some seeds were
            neglected and became sad.{" "}
            <Link
              textDecoration={"underline"}
              href={"https://gardens.shrub.finance/chapters"}
            >
              Read all the chapters here.
            </Link>
          </Text>
          <Text
            mt="3"
            fontSize={{ base: "20px", md: "28px" }}
            maxW={{ base: "22rem", md: "40rem" }}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            The seeds are now ready to transform and grow. The potter has come
            to help. He has a limited supply of pots which the paper seeds can
            be planted in. It is the moment that everyone has been waiting for.
            It is time to grow!
          </Text>
        </GridItem>
        {/*section 5*/}
        <Box>
          <Heading
            fontSize={{ base: "30px", md: "70px" }}
            letterSpacing={"tight"}
            maxW="40rem"
          >
            An innovative distribution system
          </Heading>
          <Text mt="3" fontSize="28px">
            {/*NFT Tickets are an innovative distribution mechanism for NFTs by*/}
            {/*the team at Shrub.finance. NFT tickets represent the right to mint*/}
            {/*an NFT between certain dates at a certain price. NFT tickets are*/}
            {/*NFTs themselves (that follow the ERC-1155 standard). For the*/}
            {/*Chapter 3 pot sale in Shrub Paper Gardens, we will be debuting the*/}
            {/*NFT tickets product.*/}
          </Text>
          <Text mt="3" fontSize="28px">
            The whitelist for the Pot sale will make use of a new distribution
            method created by the Shrub engineering team. NFT tickets will be
            distributed and sold in a pre-sale that will be redeemable for pots
            at the time of the public sale (and some time afterwards).
          </Text>
          <Text mt="3" fontSize="28px">
            NFT Tickets are NFTs themselves (ERC-1155) and are gas-efficient to
            mint.
          </Text>
          <Text mt="3" fontSize="28px">
            When purchasing NFT tickets in a pre-sale only a portion of the
            total cost must be paid, the NFT ticket can then either be redeemed
            for the pot after the public sale by paying the remainder of the
            price, or the NFT ticket itself can be sold on the secondary
            markets. This provides collectors with tons of flexibility.
          </Text>
        </Box>
        <Box>
          <Ticket boxSize={{ base: 400, md: 800 }} />
        </Box>
        {/*section 6*/}
        <Box boxSize={["sm", "md", "lg", "xl", "4xl"]}>
          <Image
            src="https://shrub.finance/rock-power-shrub.webp"
            fallbackSrc="https://shrub.finance/rock-power-shrub.png"
            alt="Rock"
          />
        </Box>
        <Box>
          <Heading
            fontSize={{ base: "30px", md: "70px" }}
            letterSpacing={"tight"}
            maxW="40rem"
          >
            Shrub is a movement
          </Heading>
          <Text mt="3" fontSize="28px">
            It takes a special sort of person to hold a Shrub. Shrubs represent
            those who believe in the decentralized world and are willing to put
            in the effort to make it a reality. Shrub holders are dreamers,
            builders, innovators, thinkers, and freedom-lovers. They think
            outside the box and bring positive change to the world
          </Text>
        </Box>
      </Grid>

      <Box maxW="80rem" mt={32} textAlign={"center"}>
        <Heading
          fontSize={{ base: "30px", md: "90px" }}
          letterSpacing={"tight"}
        >
          Stand apart. Raise the bar. Set the standard.
        </Heading>
        <Text
          mt="3"
          mb={{ base: "16", md: "20", lg: "20" }}
          fontSize="28px"
          textAlign="center"
          px={["4rem", "5rem", "10rem", "10rem"]}
        >
          Owning a Shrub means you stand by the ethos of decentralization, and
          believe in the core idea that innovation is necessary to create the
          future.
        </Text>
        <Center>
          <Flex direction={{ base: "column", md: "row" }}>
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
              Join our Discord <ExternalLinkIcon mx="2px" />
            </Link>
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
              ml="8"
              _hover={{ transform: "translateY(-2px)" }}
              bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
              color={"black"}
            >
              Follow on Twitter <ExternalLinkIcon mx="2px" />
            </Link>
          </Flex>
        </Center>
      </Box>
    </Container>
  );
}

export default Intro;
