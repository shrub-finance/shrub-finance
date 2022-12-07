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
  HStack,
  AccordionPanel,
  AccordionIcon,
  AccordionButton,
  AccordionItem,
  Accordion,
} from "@chakra-ui/react";
import { ExternalLinkIcon, Icon } from "@chakra-ui/icons";
import React from "react";
import { RouteComponentProps } from "@reach/router";
import {
  GoofyWonder,
  NiftySwap,
  Night,
  PolygonStudiosIcon,
  Pot,
  WonderPot,
} from "../assets/Icons";
import {
  FaLongArrowAltRight,
  FaPlus,
  IoEllipsisVertical,
} from "react-icons/all";
import PotSaleCountdown from "./PotSaleCountdown";
import Testimonials from "./Testimonials";
import { isMobile } from "react-device-detect";

function Intro(props: RouteComponentProps) {
  const { colorMode } = useColorMode();

  return (
    <>
      <Container
        mt={{ base: 0, md: 0 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "container.lg" }}
      >
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
                    ? "NFT series for the builders, innovators and thinkers"
                    : "NFT series for the builders, innovators and thinkers"}
                </Text>
              </Box>
            </Box>
          </Center>
        </Container>
        <Box maxW="80rem" mb={4} textAlign={{ base: "center", md: "center" }}>
          <Box>
            {/*<PotSaleCountdown />*/}
            {/*    <AspectRatio ratio={16 / 9}>*/}
            {/*      <iframe*/}
            {/*        title="Shrub Paper Gardens trailer"*/}
            {/*        src="https://www.youtube.com/embed/9JBKPdFuBGE"*/}
            {/*        allowFullScreen*/}
            {/*      />*/}
            {/*    </AspectRatio>*/}
          </Box>
        </Box>
      </Container>
      <Container
        // mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "row", lg: "row" }}>
          <Box mt={{ base: "0", md: "0", lg: "40" }} id="movement">
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW="40rem"
            >
              A cut above the{" "}
              <Text
                as="span"
                background="gold.100"
                bgClip="text"
                sx={{
                  WebkitTextStroke:
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                rest
              </Text>
            </Heading>
            <Text textStyle={"description"}>
              Paper Gardens brings together the earlys, the legends, the myths
              dedicated to the cause of decentralization.
            </Text>

            <Text textStyle={"description"}>
              This series personifies those who stand apart from the crowd.
            </Text>
            <Text textStyle={"description"}>
              {" "}
              Who take first steps down a new road.
            </Text>
            <Text textStyle={"description"}>
              {" "}
              Who see freedom as essential to everything.
            </Text>
            <Text textStyle={"description"}>
              {" "}
              Who want individuals in control of their money.
            </Text>
            <Text textStyle={"description"}>
              <Link
                textDecoration={"underline"}
                href={"https://opensea.io/collection/shrub-paper-gardens"}
              >
                View Collection
              </Link>
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

      {/*first on chain growth*/}
      <Container
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
          <Box>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "20rem", md: "40rem" }}
            >
              First{" "}
              <Text
                as="span"
                background="gold.100"
                bgClip="text"
                sx={{
                  WebkitTextStroke:
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                on-chain
              </Text>{" "}
              growth NFT
            </Heading>
            <Text textStyle={"description"}>
              For the first time ever,{" "}
              <Link
                isExternal
                textDecoration={"underline"}
                href="https://medium.com/@shrubfinance/paper-gardens-the-first-on-chain-growth-nft-84de2e647d8f"
              >
                grow an NFT by interacting with it on-chain.
              </Link>
            </Text>
            <Text textStyle={"description"}>
              Planting your seed into a pot creates a potted plant.
            </Text>
            <Text textStyle={"description"}>
              <Link
                textDecoration={"underline"}
                href={"https://opensea.io/collection/shrub-paper-gardens"}
              >
                View Collection
              </Link>
            </Text>
          </Box>
          <Spacer />
          <Box mt={{ base: 20, md: 32 }}>
            <Link
              isExternal
              href={"https://opensea.io/collection/shrub-paper-gardens"}
            >
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
            </Link>
          </Box>
        </Flex>
      </Container>
      {/*testimonials*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Heading
          fontSize={{ base: "30px", md: "70px" }}
          letterSpacing={"tight"}
          maxW="40rem"
          mb={14}
          mt={{ base: 0, md: 50 }}
        >
          Community{" "}
          <Text
            as="span"
            background="gold.100"
            bgClip="text"
            sx={{
              WebkitTextStroke:
                colorMode === "light"
                  ? { base: "1px #7e5807", md: "2px #7e5807" }
                  : "transparent",
            }}
          >
            love
          </Text>{" "}
        </Heading>

        <Testimonials />
      </Container>

      {/*grow your shrub*/}
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
                background="gold.100"
                bgClip="text"
                sx={{
                  WebkitTextStroke:
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                Grow
              </Text>{" "}
              a Shrub
            </Heading>
            <Text textStyle={"description"}>
              Take care of your potted plant to help it grow.
            </Text>{" "}
            <Text textStyle={"description"}>
              Watering potted plants makes them grow big and strong. Fertilizing
              also gives them a boost!{" "}
            </Text>
            <Text textStyle={"description"}>
              Traits of your potted plant will update dynamically when you
              interact with it!
            </Text>
            <Text textStyle={"description"}>
              <Link
                textDecoration={"underline"}
                href={"https://opensea.io/collection/shrub-paper-gardens"}
              >
                View Collection
              </Link>
            </Text>
          </Box>
          <Spacer />
          <Box
            mt={{ base: 10, md: 32, lg: 32, xl: 32 }}
            ml={{ md: 20, lg: 80, xl: 0 }}
            display={{ base: "none", md: "block" }}
          >
            <Link
              isExternal
              href={"https://opensea.io/collection/shrub-paper-gardens"}
            >
              <Image
                width={{ base: "32rem", md: "42rem" }}
                src="https://shrub.finance/watering.png"
                fallbackSrc="https://shrub.finance/watering.png"
                alt="watering"
              />
            </Link>
          </Box>
          <Box mt={{ base: 10, md: 32 }} display={{ base: "flex", md: "none" }}>
            <Image
              width={{ base: "32rem", md: "42rem" }}
              src="https://shrub.finance/watering.png"
              fallbackSrc="https://shrub.finance/watering.png"
              alt="watering"
            />
          </Box>
        </Flex>
      </Container>

      {/*harvest your shrub*/}
      <Container
        mt={{ base: 0, md: 40, lg: 40 }}
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
                background="gold.100"
                bgClip="text"
                sx={{
                  WebkitTextStroke:
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                Harvest
              </Text>{" "}
              a Shrub
            </Heading>
            <Text textStyle={"description"}>
              Once your potted plant is fully grown it is time to harvest.
            </Text>{" "}
            <Text textStyle={"description"}>Out comes a shrub!</Text>{" "}
            <Text textStyle={"description"}>
              Shrub traits are based on the type of seed you planted, emotion
              and DNA. Some combinations result in rare traits!
            </Text>
            <Text textStyle={"description"}>Every Shrub is unique.</Text>
            <Text textStyle={"description"}>
              <Link
                textDecoration={"underline"}
                href={"https://opensea.io/collection/shrub-paper-gardens"}
              >
                View Collection
              </Link>
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

      {/*story so far*/}
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
          <Box mt={8} ml={{ base: 0, md: 0, lg: 20, xl: 40 }} id="story">
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "20rem", md: "40rem" }}
            >
              The{" "}
              <Text
                as="span"
                background="gold.100"
                bgClip="text"
                sx={{
                  WebkitTextStroke:
                    colorMode === "light"
                      ? { base: "1px #7e5807", md: "2px #7e5807" }
                      : "transparent",
                }}
              >
                story
              </Text>{" "}
              so far
            </Heading>
            <Text textStyle={"description"}>
              It all started with a visit from the mysterious traveller the
              Paper Merchant. He came with the seeds.{" "}
              <Link
                textDecoration={"underline"}
                href={"https://gardens.shrub.finance/chapters"}
              >
                Read all the chapters.
              </Link>
            </Text>
            <Text textStyle={"description"}>
              When seeds were ready to transform and grow, potter came to help.
              He put a limited supply of pots into existence. To grow and
              transform seeds need to be planted in a pot.
            </Text>
            <Text textStyle={"description"}>
              <Link
                textDecoration={"underline"}
                href={"https://opensea.io/collection/shrub-paper-gardens"}
              >
                View Collection
              </Link>
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

      {/*NFT Tickets*/}
      {/*<Container*/}
      {/*  mt={{ base: 0, md: 50 }}*/}
      {/*  p={5}*/}
      {/*  flex="1"*/}
      {/*  borderRadius="2xl"*/}
      {/*  maxW={{ base: "container.sm", md: "1400px" }}*/}
      {/*>*/}
      {/*  <Flex direction={{ base: "column", md: "column", lg: "row" }}>*/}
      {/*    <Box mt={{ base: 0, md: 8 }} id="tickets">*/}
      {/*      <Heading*/}
      {/*        fontSize={{ base: "30px", md: "70px" }}*/}
      {/*        letterSpacing={"tight"}*/}
      {/*        maxW={{ base: "40rem", md: "60rem", lg: "40rem" }}*/}
      {/*      >*/}
      {/*        An{" "}*/}
      {/*        <Text*/}
      {/*          as="span"*/}
      {/*          background="gold.100"*/}
      {/*          bgClip="text"*/}
      {/*          sx={{*/}
      {/*            WebkitTextStroke:*/}
      {/*              colorMode === "light"*/}
      {/*                ? { base: "1px #7e5807", md: "2px #7e5807" }*/}
      {/*                : "transparent",*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          innovative*/}
      {/*        </Text>{" "}*/}
      {/*        distribution system*/}
      {/*      </Heading>*/}
      {/*      <Text textStyle={"description"}>*/}
      {/*        Pots were distributed using a new mechanism developed by the Shrub*/}
      {/*        team that provides NFT collectors more flexibility than a*/}
      {/*        traditional whitelist.*/}
      {/*      </Text>*/}
      {/*      <Text textStyle={"description"}>*/}
      {/*        NFT Tickets are NFTs themselves, ERC-1155, and are extremely*/}
      {/*        gas-efficient to mint.*/}
      {/*      </Text>*/}
      {/*      <Text textStyle={"description"}>*/}
      {/*        When buying tickets during the pre-sale, collectors only pay a*/}
      {/*        portion of the total price. The ticket are later redeemed for the*/}
      {/*        asset by paying the remainder, or sold on the secondary markets.*/}
      {/*      </Text>*/}
      {/*      <Text textStyle={"description"}>*/}
      {/*        <Link*/}
      {/*          isExternal*/}
      {/*          textDecoration={"underline"}*/}
      {/*          href="https://medium.com/@shrubfinance/nft-tickets-the-next-generation-of-distribution-eab1e0fdc317"*/}
      {/*        >*/}
      {/*          Thinking NFT Tickets for your presale? Learn more.*/}
      {/*        </Link>*/}
      {/*      </Text>*/}
      {/*    </Box>*/}
      {/*    <Box*/}
      {/*      mt={{ base: 0, md: 0, lg: 40, xl: 40, "2xl": 0 }}*/}
      {/*      ml={{ base: 0, md: 40, lg: 20, xl: 40 }}*/}
      {/*    >*/}
      {/*      <Link*/}
      {/*        isExternal*/}
      {/*        href={*/}
      {/*          "https://opensea.io/assets/matic/0xb0e17d58ae2bc6693303b90383bed83699145866/1"*/}
      {/*        }*/}
      {/*      >*/}
      {/*        <Image*/}
      {/*          width={{ base: "32rem", md: "42rem" }}*/}
      {/*          src="https://shrub.finance/assets/nft-ticket.webp"*/}
      {/*          fallbackSrc="https://shrub.finance/assets/tickets.png"*/}
      {/*          alt="nft ticket by shrub finance"*/}
      {/*        />*/}
      {/*      </Link>*/}
      {/*    </Box>*/}
      {/*  </Flex>*/}
      {/*</Container>*/}

      {/*roadmap*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "row", lg: "row" }}>
          <Box mt={{ base: "0", md: "0", lg: "40" }} id="roadmap">
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW="40rem"
            >
              Roadmap
            </Heading>
            <Link
              mt="10"
              display="block"
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "semibold" }}
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #7db5ff, #de00ff)"
              )}
              bgClip="text"
              isExternal
              href="https://paper.shrub.finance"
            >
              Shrub Paper
              <br /> [LIVE]
            </Link>{" "}
            <Icon as={IoEllipsisVertical} boxSize={"70"} />
            <Link
              display="block"
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight="semibold"
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #f5f2f2, #3300ff)"
              )}
              bgClip="text"
              href="https://exchange.shrub.finance"
              isExternal
            >
              Shrub Exchange
              <br /> [LIVE]
            </Link>{" "}
            <Icon as={IoEllipsisVertical} boxSize={"70"} />
            <Link
              display="block"
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight="semibold"
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #ff6729, #73ff00)"
              )}
              bgClip="text"
              isExternal
              href="https://gardens.shrub.finance/my-garden"
            >
              Paper Gardens
              <br /> [LIVE]
            </Link>{" "}
            <Icon as={IoEllipsisVertical} boxSize={"70"} />
            <Text
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight="semibold"
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #c9ff04, #51eae6)"
              )}
              bgClip="text"
            >
              Shrub Main
              <br /> [NEXT]
            </Text>{" "}
            <Text textStyle={"description"}>
              <Link
                textDecoration={"underline"}
                href={
                  "https://medium.com/@shrubfinance/shrub-roadmap-2022-b947b5ce1435"
                }
              >
                Learn more
              </Link>
            </Text>
          </Box>
          <Spacer />
          <Box mt={{ base: 0, md: 64 }}>
            <Image
              width={"50rem"}
              src="https://shrub.finance/beany-hope.webp"
              fallbackSrc="https://shrub.finance/beany-hope.png"
              alt="Beany"
            />
          </Box>
        </Flex>
      </Container>

      {/*partnerships*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 20 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
            mb={16}
            id="partners"
          >
            Official Partners
          </Heading>
          <Center>
            <Flex direction="row" gap={8}>
              <Link
                href="https://polygonstudios.com/"
                isExternal
                cursor="pointer"
              >
                <PolygonStudiosIcon
                  color={useColorModeValue("black", "white")}
                  w={{ base: 300, md: 500 }}
                  h={{ base: 100, md: 200 }}
                />
              </Link>
            </Flex>
          </Center>
        </Box>
      </Container>

      {/*as seen on*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 20 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "30px" }}
            letterSpacing={"tight"}
          >
            As seen on
          </Heading>
          <Center>
            <Flex direction="row">
              <Box>
                <Link
                  href="https://beta.niftyswap.io/buy/polygon/0xA9ae86b25424d8b523A91975Da1336AC490Bc4C7?only-tradable=false"
                  cursor="pointer"
                  isExternal
                >
                  <NiftySwap boxSize={"80"} />
                </Link>
              </Box>
            </Flex>
          </Center>
        </Box>
      </Container>

      {/*ending*/}
      <Container
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 16 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "40px" }}
            letterSpacing={"tight"}
            mb={16}
          >
            Be the difference. <br />
            Join mission Shrub.
          </Heading>
          <Center>
            <Flex
              direction={{
                base: "column",
                md: "row",
                lg: "row",
                xl: "row",
              }}
              gap={8}
            >
              <Box>
                <Link
                  href="https://discord.gg/csusZhYgTg"
                  isExternal
                  cursor="pointer"
                  rounded="2xl"
                  size="sm"
                  px="9"
                  fontSize="22px"
                  fontWeight="semibold"
                  py="2"
                  _hover={{ transform: "translateY(-2px)" }}
                  background="gold.100"
                  color={"black"}
                >
                  Join Discord
                  {/*<ExternalLinkIcon*/}
                  {/*  mx="2px"*/}
                  {/*  display={{ base: "none", md: "inline" }}*/}
                  {/*/>*/}
                </Link>
                <Center>
                  <Text mt={8}>Connect with the community</Text>
                </Center>
              </Box>
              <Spacer />
              <Box>
                <Link
                  href="https://twitter.com/shrubfinance"
                  isExternal
                  cursor="pointer"
                  rounded="2xl"
                  size="sm"
                  px="6"
                  fontSize="22px"
                  fontWeight="semibold"
                  py="2"
                  _hover={{ transform: "translateY(-2px)" }}
                  background="gold.100"
                  color={"black"}
                >
                  Follow on Twitter
                  {/*<ExternalLinkIcon*/}
                  {/*  mx="2px"*/}
                  {/*  display={{ base: "none", md: "inline" }}*/}
                  {/*/>*/}
                </Link>
                <Center>
                  <Text mt={8}>Official announcements</Text>
                </Center>
              </Box>
            </Flex>
          </Center>
        </Box>
      </Container>

      {/*faqs*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "column", lg: "row" }}>
          <Box
            mt={{ base: 0, md: 50 }}
            display={{
              base: "none",
              md: "none",
              lg: "flex",
              xl: "flex",
              "2xl": "flex",
            }}
          >
            <Image
              maxW="40rem"
              maxH="48rem"
              src="https://shrub.finance/funky-pineapple-shrub.webp"
              fallbackSrc="https://shrub.finance/funky-pineapple-shrub.png"
              alt="pineapple"
            />
          </Box>
          <Spacer
            display={{
              base: "none",
              md: "none",
              lg: "flex",
              xl: "flex",
              "2xl": "flex",
            }}
          />
          <Box mt={{ base: 0, md: 8 }} id="faqs">
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "40rem", md: "60rem", lg: "40rem" }}
            >
              FAQs
            </Heading>
            <Accordion
              allowToggle
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
            >
              <AccordionItem>
                <AccordionButton>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "28px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    Can I still participate in the series ?
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    {" "}
                    All builders, innovators, and thinkers are welcome to join
                    mission Shrub. To start your journey you can by buy a seed
                    from other sellers in{" "}
                    <Link
                      isExternal
                      textDecoration={"underline"}
                      href="https://opensea.io/collection/shrub-paper-gardens-seeds"
                    >
                      OpenSea.
                    </Link>{" "}
                    We are not selling anymore pots, but you can buy a pot from{" "}
                    <Link
                      isExternal
                      textDecoration={"underline"}
                      href="https://opensea.io/collection/shrub-paper-gardens"
                    >
                      the secondary marketplace,
                    </Link>{" "}
                    plant your seed and grow a Shrub!
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text textStyle={"description"} textAlign={"left"}>
                    What does being a Shrub Holder mean?
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    {" "}
                    Shrub holders are our early supporters. Those who see the
                    world just as we do. Shrub holders hold the highest status
                    in the Shrub ecosystem. They will enjoy early access to all
                    our future products.
                  </Text>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    <Link
                      isExternal
                      textDecoration={"underline"}
                      href="https://medium.com/@shrubfinance/shrub-roadmap-2022-b947b5ce1435"
                    >
                      Read Shrub roadmap
                    </Link>
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text textStyle={"description"} textAlign={"left"}>
                    Why so few pots?
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    Growing a Shrub is special. To make it special only few pots
                    came into existence.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "28px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    Where to learn more about the series ?
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    {" "}
                    Read the{" "}
                    <Link
                      isExternal
                      textDecoration={"underline"}
                      href="https://medium.com/@shrubfinance/building-a-web3-community-shrubs-growth-story-60f770f214d1"
                    >
                      full growth story of Shrub.
                    </Link>{" "}
                    You can also follow us on Twitter and Discord.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Box mt={10}>
              <Link
                href="https://opensea.io/collection/shrub-paper-gardens"
                isExternal
                cursor="pointer"
                size="sm"
                fontWeight="semibold"
                py="2"
                _hover={{ transform: "translateY(-2px)" }}
                bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
                color={"black"}
                rounded="2xl"
                px="6"
                fontSize="22px"
                background="gold.100"
              >
                View Collection
              </Link>
            </Box>
          </Box>
        </Flex>
      </Container>
      {/*<Container*/}
      {/*  p={5}*/}
      {/*  flex="1"*/}
      {/*  borderRadius="2xl"*/}
      {/*  maxW={{ base: "container.sm", md: "1400px" }}*/}
      {/*>*/}
      {/*  <Box maxW="80rem" mt={{ base: 16, md: 16 }} textAlign={"center"}>*/}
      {/*    <AspectRatio*/}
      {/*      maxW="560px"*/}
      {/*      ratio={16 / 9}*/}
      {/*      layerStyle="hideExternalBranding"*/}
      {/*    >*/}
      {/*      <iframe*/}
      {/*        title="sign up for shrub"*/}
      {/*        src="https://form.jotform.com/shrub_finance/email"*/}
      {/*        allowFullScreen*/}
      {/*      />*/}
      {/*    </AspectRatio>*/}
      {/*  </Box>*/}
      {/*</Container>*/}
    </>
  );
}

export default Intro;
