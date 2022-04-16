import {
  AspectRatio,
  Box,
  Center,
  Container,
  Heading,
  Link,
  Text,
  Image,
  Spacer,
  Flex,
  useColorModeValue,
  useColorMode,
  OrderedList,
  ListItem,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon, Icon } from "@chakra-ui/icons";
import React from "react";
import { RouteComponentProps } from "@reach/router";
import {
  Beach,
  BusStop,
  City,
  GoofyWonder,
  Home,
  Night,
  Pot,
  Ticket,
  Ticket1,
  Watering,
  WonderPot,
} from "../assets/Icons";
import { FaLongArrowAltRight, FaPlus } from "react-icons/all";
import Stage1 from "./animations/Stage1";

function Intro(props: RouteComponentProps) {
  const gold =
    "linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)";
  const { colorMode } = useColorMode();
  const dropColor = useColorModeValue("blue.300", "blue.100");

  return (
    <>
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "container.lg" }}
      >
        <Box
          maxW="80rem"
          mb={8}
          mt={{ base: 20, md: 100 }}
          textAlign={{ base: "center", md: "center" }}
        >
          <Box mt={16}>
            <AspectRatio ratio={16 / 9}>
              <iframe
                title="Shrub Paper Gardens trailer"
                src="https://www.youtube.com/embed/9JBKPdFuBGE"
                allowFullScreen
              />
            </AspectRatio>
          </Box>
        </Box>
      </Container>
      {/*section 1*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex
          direction={{
            base: "column",
            md: "column",
            lg: "column",
            xl: "column",
          }}
        >
          <Box mt={{ base: 0, md: 20 }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "20rem", md: "40rem" }}
            >
              The first{" "}
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                on-chain
              </Text>{" "}
              growth NFT
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Plant your seed, grow a Shrub. Planting your seed into a pot
              creates a potted plant. For the first time ever, grow an NFT by
              interacting with it on-chain.
            </Text>
          </Box>
          <Spacer />
          <Box mt={{ base: 20, md: 32 }}>
            <HStack ml={{ base: 0, md: 0, lg: 60, xl: 400 }}>
              <Pot boxSize={{ base: 20, md: 52, lg: 52, xl: 60 }} />
              <Icon
                as={FaPlus}
                boxSize={{ base: 10, md: 16, lg: 16, xl: 16 }}
              />
              <GoofyWonder boxSize={{ base: 20, md: 52, lg: 52, xl: 60 }} />
              <Icon
                as={FaLongArrowAltRight}
                boxSize={{ base: 10, md: 20, lg: 16, xl: 20 }}
              />
              <WonderPot boxSize={{ base: 20, md: 52, lg: 52, xl: 60 }} />
            </HStack>
          </Box>
        </Flex>
      </Container>
      {/*section 2*/}
      <Container
        mt={{ base: 0, md: 40 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex
          direction={{ base: "column", md: "column", lg: "column", xl: "row" }}
        >
          <Box mt={8}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "20rem", md: "40rem" }}
            >
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                Grow
              </Text>{" "}
              your Shrub on-chain
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "30rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Take care of your potted plant to help it grow.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Watering potted plants makes them grow big and strong. Fertilizing
              also gives them a boost!{" "}
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Watch the traits of your potted plant update dynamically when you
              interact.
            </Text>
          </Box>
          <Spacer />
          <Box
            mt={{ base: 10, md: 32, lg: 32, xl: 32 }}
            ml={{ md: 20, lg: 80, xl: 0 }}
            display={{ base: "none", md: "block" }}
          >
            {/*<Stage1 />*/}
            <Watering boxSize={600} />
          </Box>
          <Box mt={{ base: 10, md: 32 }} display={{ base: "flex", md: "none" }}>
            <Watering boxSize={350} />
          </Box>
        </Flex>
      </Container>
      {/*section 3*/}
      <Container
        mt={{ base: 0, md: 60, lg: 40 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "row", lg: "row" }}>
          <Box mt={8}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "20rem", md: "40rem" }}
            >
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                Harvest
              </Text>{" "}
              your Shrub
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Once your potted plant is fully grown it is time to harvest.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Out comes a shrub!
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Shrub traits are based on the type of seed you planted, emotion
              and DNA. Some combinations result in rare traits!
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Every Shrub is unique.
            </Text>
          </Box>
          <Spacer />
          <Box mt={20}>
            <Image
              width={"72rem"}
              src="https://shrub.finance/lovely-passion-shrub.webp"
              fallbackSrc="https://shrub.finance/lovely-passion-shrub.png"
              alt="Lovely"
            />
          </Box>
        </Flex>
      </Container>

      {/*section 4*/}
      <Container
        mt={{ base: 0, md: 54, lg: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "column", lg: "row" }}>
          {/*visible for large screens*/}
          <Box>
            <Night
              boxSize={{ lg: "md", xl: "xl" }}
              display={{ base: "none", md: "none", lg: "flex" }}
            />
          </Box>
          <Spacer display={{ base: "none", md: "none", lg: "flex" }} />
          <Box mt={8} ml={{ base: 0, md: 0, lg: 20, xl: 40 }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "20rem", md: "40rem" }}
            >
              The{" "}
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                story
              </Text>{" "}
              so far
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              It all started with a visit from the mysterious traveller the
              Paper Merchant. He came with the seeds.{" "}
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
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The seeds are now ready to transform and grow. The Potter has come
              to help. He has a limited supply of pots which the seeds can be
              planted in. It is the moment that everyone has been waiting for.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              {" "}
              It is time to grow!
            </Text>
          </Box>
          <Spacer display={{ base: "flex", md: "flex", lg: "none" }} />
          {/*visible for smaller screens*/}
          <Box
            mt={{ base: "auto", md: -20, lg: "auto" }}
            display={{ base: "flex", md: "flex", lg: "none" }}
          >
            <Night boxSize={{ base: "xs", md: "3xl", lg: "xl" }} />
          </Box>
        </Flex>
      </Container>
      {/*section 5*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "column", lg: "row" }}>
          <Box mt={{ base: 0, md: 8 }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "40rem", md: "60rem", lg: "40rem" }}
            >
              An{" "}
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                innovative
              </Text>{" "}
              distribution system
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The distribution for the Pot sale will make use of a new product
              created by the Shrub engineering team that provides NFT collectors
              more flexibility than a traditional whitelist.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              NFT Tickets are NFTs themselves (ERC-1155) and are gas-efficient
              to mint.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              When buying tickets during the pre-sale, collectors only pay a
              portion of the total price. The ticket can later be redeemed for
              the pot by paying the remainder, or can be sold on the secondary
              markets.
            </Text>
          </Box>
          <Box
            mt={{ base: 0, md: 0, lg: 40, xl: 40, "2xl": 0 }}
            ml={{ base: 0, md: 40, lg: 20, xl: 40 }}
          >
            <Ticket
              boxSize={{ base: 320, md: 600, lg: 400, xl: 400, "2xl": 500 }}
            />
            <Ticket1
              display={{ base: "none", md: "none", lg: "flex" }}
              boxSize={{ base: 320, md: 600, lg: 400, xl: 400, "2xl": 500 }}
            />
          </Box>
        </Flex>
      </Container>

      {/*section 6*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "row", lg: "row" }}>
          <Box mt={{ base: "0", md: "0", lg: "40" }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW="40rem"
            >
              Shrub is a{" "}
              <Text
                as="span"
                bgGradient={gold}
                bgClip="text"
                sx={{
                  "-webkit-text-stroke":
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                movement
              </Text>
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Shrubs represent those who believe in a decentralized world, and
              are willing to put in the effort to make it a reality.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              They are dreamers, builders, innovators, thinkers, and
              freedom-lovers who think outside the box and mold the world to
              their vision.
            </Text>
          </Box>
          <Box mt={{ base: 0, md: 64 }}>
            <Image
              width={"72rem"}
              src="https://shrub.finance/rock-power-shrub.webp"
              fallbackSrc="https://shrub.finance/rock-power-shrub.png"
              alt="Rock"
            />
          </Box>
        </Flex>
      </Container>

      {/*section 7*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "column", lg: "row" }}>
          <Box mt={{ base: 0, md: 8 }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "40rem", md: "60rem", lg: "40rem" }}
            >
              FAQs
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              How will the mint occur?
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The minting will take place in stages.
              <Box ml={10}>
                <OrderedList>
                  <ListItem>Ticket whitelist pre-sale</ListItem>
                  <ListItem>Ticket public pre-sale</ListItem>
                  <ListItem>Public Pot sale</ListItem>
                </OrderedList>
              </Box>
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              When is the mint?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              May 2022.
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              What's the total pot supply ?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              There will be a supply of 250 pots. This can flex up to 1000 based
              on the limited pre-sale.
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              What will be the mint price?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              0.05 ETH for the public sale.
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              How will the pre-sale tickets work?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Pre-sale tickets will be sold at a discount to whitelist holders.
              The pricing is:
              <Box ml={10}>
                <OrderedList>
                  <ListItem>0.015 ETH - Whitelist</ListItem>
                  <ListItem>0.035 ETH - Public</ListItem>
                </OrderedList>
              </Box>
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              All tickets will be redeemable for a pot for up to a month after
              the public sale for a redemption price of 0.015 ETH.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Tickets are tradable NFTs and can be purchased on secondary
              markets.
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              Will my NFTs be stored on-chain?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The latest in NFT technology is being used to store all metadata
              for pots and shrubs on-chain dynamically.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              {" "}
              All art is stored on a redundant Inter-Planetary File System
              (IPFS) setup. It's not going anywhere.
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              How do I get on the whitelist?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The guaranteed way to get a whitelist spot is to hold 15 seeds.
              Every 15 seeds that you hold give you a whitelist for 1 pre-sale
              ticket.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              This will be based on a snapshot taken 1 day before the pre-sale.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Follow us on twitter and join the discord. There will be contests
              on both to win additional whitelist spots.
            </Text>
            <Text
              mt="16"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={"bold"}
            >
              Do I need a seed to participate?
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Yes, to transform a pot into a potted plant you need a seed.
              Owning a seed is also a pre-requisite to participate in the
              pre-sale.
            </Text>{" "}
          </Box>
          <Spacer />
          <Box display={{ base: "none", md: "flex", lg: "flex" }}>
            <Flex direction={"column"} gap={60}>
              <BusStop boxSize={{ lg: "md", xl: "xl" }} />
              <City boxSize={{ lg: "md", xl: "xl" }} />
              <Home boxSize={{ lg: "md", xl: "xl" }} />
              <Beach
                boxSize={{ lg: "md", xl: "xl" }}
                display={{ md: "flex", lg: "flex", xl: "none" }}
              />
            </Flex>
          </Box>
        </Flex>
      </Container>

      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 20 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "90px" }}
            letterSpacing={"tight"}
          >
            Grow a Shrub
          </Heading>
          <Text
            mt="6"
            mb={{ base: "16", md: "20", lg: "20" }}
            fontSize={{ base: "20px", md: "28px" }}
            textAlign="center"
            px={["4rem", "5rem", "10rem"]}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Stand apart. Raise the bar. Set the standard.
          </Text>
          <Center>
            <Flex direction={{ base: "column", md: "row" }} gap={8}>
              <Box>
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
                  bgGradient={gold}
                  color={"black"}
                >
                  Get a Seed
                  <ExternalLinkIcon
                    mx="2px"
                    display={{ base: "none", md: "inline" }}
                  />
                </Link>
                <Center>
                  <Text mt={8} maxW={"19rem"}>
                    To grow a Shrub you need a seed. Available on secondary
                  </Text>
                </Center>
              </Box>
              <Spacer />
              <Box>
                <Link
                  href="https://discord.gg/csusZhYgTg"
                  // isExternal
                  cursor="pointer"
                  rounded="3xl"
                  size="sm"
                  px="6"
                  fontSize="25px"
                  fontWeight="semibold"
                  py="5"
                  _hover={{ transform: "translateY(-2px)" }}
                  bgGradient={gold}
                  color={"black"}
                >
                  Join our Discord{" "}
                  <ExternalLinkIcon
                    mx="2px"
                    display={{ base: "none", md: "inline" }}
                  />
                </Link>
                <Center>
                  <Text mt={8}>
                    Whitelist contests, games, talk to the creators
                  </Text>
                </Center>
              </Box>
              <Spacer />
              <Box>
                <Link
                  href="https://twitter.com/shrubfinance"
                  isExternal
                  cursor="pointer"
                  rounded="3xl"
                  size="sm"
                  px="6"
                  fontSize="25px"
                  fontWeight="semibold"
                  py="5"
                  _hover={{ transform: "translateY(-2px)" }}
                  bgGradient={gold}
                  color={"black"}
                >
                  Follow on Twitter{" "}
                  <ExternalLinkIcon
                    mx="2px"
                    display={{ base: "none", md: "inline" }}
                  />
                </Link>
                <Center>
                  <Text mt={8}>Follow for all official announcements</Text>
                </Center>
              </Box>
            </Flex>
          </Center>
        </Box>
      </Container>
    </>
  );
}

export default Intro;
