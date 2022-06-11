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
  ListItem,
  HStack,
  UnorderedList,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  Accordion,
  AccordionButton,
  Img,
} from "@chakra-ui/react";
import { ExternalLinkIcon, Icon } from "@chakra-ui/icons";
import React from "react";
import { RouteComponentProps } from "@reach/router";
import {
  GoofyWonder,
  NftJetIcon,
  Night,
  PolygonStudiosIcon,
  Pot,
  Ticket,
  Ticket1,
  WonderPot,
} from "../assets/Icons";
import {
  FaLongArrowAltRight,
  FaPlus,
  IoEllipsisVertical,
} from "react-icons/all";
import PotSaleCountdown from "./PotSaleCountdown";

function Intro(props: RouteComponentProps) {
  const { colorMode } = useColorMode();

  return (
    <>
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "container.lg" }}
      >
        <Box maxW="80rem" mb={8} textAlign={{ base: "center", md: "center" }}>
          <Box>
            <PotSaleCountdown />
            {/*<AspectRatio ratio={16 / 9}>*/}
            {/*  <iframe*/}
            {/*    title="Shrub Paper Gardens trailer"*/}
            {/*    src="https://www.youtube.com/embed/9JBKPdFuBGE"*/}
            {/*    allowFullScreen*/}
            {/*  />*/}
            {/*</AspectRatio>*/}
          </Box>
        </Box>
      </Container>

      {/*section 1*/}
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
              The first{" "}
              <Text
                as="span"
                background="gold.100"
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
            <Text textStyle={"description"}>
              Plant your seed, grow a Shrub. Planting your seed into a pot
              creates a potted plant.
            </Text>
            <Text textStyle={"description"}>
              For the first time ever, grow an NFT by interacting with it
              on-chain!
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
                background="gold.100"
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
          </Box>
          <Spacer />
          <Box
            mt={{ base: 10, md: 32, lg: 32, xl: 32 }}
            ml={{ md: 20, lg: 80, xl: 0 }}
            display={{ base: "none", md: "block" }}
          >
            {/*<Stage1 />*/}
            <Image
              width={{ base: "32rem", md: "42rem" }}
              src="https://shrub.finance/watering.png"
              fallbackSrc="https://shrub.finance/watering.png"
              alt="watering"
            />
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
      {/*section 3*/}
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
            <Text textStyle={"description"}>
              Once your potted plant is fully grown it is time to harvest.
            </Text>{" "}
            <Text textStyle={"description"}>Out comes a shrub!</Text>{" "}
            <Text textStyle={"description"}>
              Shrub traits are based on the type of seed you planted, emotion
              and DNA. Some combinations result in rare traits!
            </Text>
            <Text textStyle={"description"}>Every Shrub is unique.</Text>
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
            <Text textStyle={"description"}>
              It all started with a visit from the mysterious traveller the
              Paper Merchant. He came with the seeds.{" "}
              <Link
                textDecoration={"underline"}
                href={"https://gardens.shrub.finance/chapters"}
              >
                Read all the chapters here.
              </Link>
            </Text>
            <Text textStyle={"description"}>
              The seeds are now ready to transform and grow. The Potter has come
              to help. He has a limited supply of pots which the seeds can be
              planted in. It is the moment that everyone has been waiting for.
            </Text>
            <Text textStyle={"description"}> It is time to grow!</Text>
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
          <Box mt={{ base: 0, md: 8 }} id="tickets">
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "40rem", md: "60rem", lg: "40rem" }}
            >
              An{" "}
              <Text
                as="span"
                background="gold.100"
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
            <Text textStyle={"description"}>
              The distribution for the Pot sale will use a new product created
              by the Shrub engineering team that provides NFT collectors more
              flexibility than a traditional whitelist.
            </Text>
            <Text textStyle={"description"}>
              NFT Tickets are NFTs themselves (ERC-1155) and are gas-efficient
              to mint.
            </Text>
            <Text textStyle={"description"}>
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

      {/*section 7*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "column", lg: "row" }}>
          <Box
            mt={{ base: 0, md: 64 }}
            display={{
              base: "none",
              md: "none",
              lg: "flex",
              xl: "flex",
              "2xl": "flex",
            }}
          >
            <Image
              maxW="50rem"
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
                  <Text textStyle={"description"} textAlign={"left"}>
                    When mint?
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
                    NFT Ticket Whitelist Pre-Sale <br />
                    Wednesday, <b>June 8</b> <br />
                    <br />
                    NFT Ticket Public Pre-Sale <br />
                    Thursday, <b>June 9</b> <br />
                    <br />
                    Public Pot Sale <br />
                    Thursday, <b>June 16</b>
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
                    What's the total pot supply ?
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
                    There will be a supply of 250 pots.
                  </Text>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    *Note: Tickets are tradable NFTs and can be sold on
                    secondary markets.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text textStyle={"description"} textAlign={"left"}>
                    How will the mint occur?{" "}
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
                    The minting will take place in stages.
                    <Box ml={10}>
                      <UnorderedList>
                        <ListItem textDecoration={"line-through"}>
                          Stage 1: NFT Ticket whitelist pre-sale
                        </ListItem>
                        <ListItem>Stage 2: NFT Ticket public pre-sale</ListItem>
                        <ListItem>Stage 3: Pot public sale</ListItem>
                      </UnorderedList>
                    </Box>
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text textStyle={"description"} textAlign={"left"}>
                    How will the NFT ticket pre-sale work?
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
                    Pre-sale NFT tickets will guarantee a Shrub Pot. Price:
                    <Box
                      ml={10}
                      mt="3"
                      fontSize={{ base: "20px", md: "20px" }}
                      maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                      fontWeight={{ base: "semibold", md: "medium" }}
                      textAlign={"left"}
                    >
                      <UnorderedList>
                        <ListItem>
                          <b>0.035 ETH</b> - Public
                        </ListItem>
                      </UnorderedList>
                    </Box>
                  </Text>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    All tickets will be redeemable for a pot for up to a week
                    after the public sale. Redemption price for the tickets will
                    be 0.015 ETH.
                  </Text>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    *Note: Tickets are tradable NFTs and can be sold on
                    secondary markets.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text textStyle={"description"} textAlign={"left"}>
                    What's the mint price for the Public Pot Sale?
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
                    <b>0.05 ETH</b> for the Public Pot Sale.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Text textStyle={"description"} textAlign={"left"}>
                    What would it mean to have a fully grown Shrub?
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
                    Shrub NFTs are Shrub Finance’s genesis NFT.
                  </Text>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    {" "}
                    They will grant holders the highest status in the Shrub
                    ecosystem, access to future drops, special airdrops, and
                    early access to new products.
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
                    Will my NFTs be stored on-chain?
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
                    The latest in NFT technology is being used to store all
                    metadata for pots and shrubs on-chain dynamically.
                  </Text>
                  <Text
                    mt="3"
                    fontSize={{ base: "20px", md: "20px" }}
                    maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
                    fontWeight={{ base: "semibold", md: "medium" }}
                    textAlign={"left"}
                  >
                    All art is stored on a redundant Inter-Planetary File System
                    (IPFS) setup. It's not going anywhere.
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
                    What will the funds be used for?
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
                    The funds will be used for the development of the Shrub
                    ecosystem.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Flex>
      </Container>

      {/*section 8*/}
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
            <Text
              mt="10"
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "semibold" }}
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #7db5ff, #de00ff)"
              )}
              bgClip="text"
            >
              Shrub Paper [LIVE]
            </Text>{" "}
            <Icon as={IoEllipsisVertical} boxSize={"90"} />
            <Text
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight="semibold"
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #f5f2f2, #3300ff)"
              )}
              bgClip="text"
            >
              Shrub Exchange [LIVE]
            </Text>{" "}
            <Icon as={IoEllipsisVertical} boxSize={"90"} />
            <Text
              fontSize={{ base: "25px", md: "35px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight="semibold"
              bgGradient={useColorModeValue(
                "linear(to-l, black, black)",
                "linear(to-l, #ff6729, #73ff00)"
              )}
              bgClip="text"
            >
              Paper Gardens [Q1-Q2]
            </Text>{" "}
            <Icon as={IoEllipsisVertical} boxSize={"90"} />
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
              Options Main [Q3-Q4]
            </Text>{" "}
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
              Join the{" "}
              <Text
                as="span"
                background="gold.100"
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
            <Text textStyle={"description"}>
              It takes a special sort of person to hold a Shrub. Shrubs
              represent those who believe in the decentralized world and are
              willing to put in the effort to make it a reality.
            </Text>{" "}
            <Text textStyle={"description"}>
              Shrub holders are dreamers, builders, innovators, thinkers, and
              freedom-lovers. They think outside the box and bring positive
              change to the world.
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
            fontSize={{ base: "30px", md: "50px" }}
            letterSpacing={"tight"}
            mb={16}
          >
            As seen on
          </Heading>
          <Center>
            <Flex direction="row" gap={8}>
              <Box>
                <Link
                  href="https://nftcalendar.io/"
                  cursor="pointer"
                  isExternal
                >
                  <Img
                    src="/extra/nft-calendar.webp"
                    alt="nft calendar"
                    width={100}
                  />
                </Link>
              </Box>
              <Spacer />
              <Box>
                <Link
                  href="https://www.nftjet.com/"
                  cursor="pointer"
                  isExternal
                >
                  <NftJetIcon boxSize={"66"} />
                </Link>
              </Box>
            </Flex>
          </Center>
        </Box>
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

      {/*cta*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 20 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "40px" }}
            letterSpacing={"tight"}
            mb={16}
          >
            Get Started
          </Heading>
          <Center>
            <Flex
              direction={{
                base: "column",
                md: "column",
                lg: "column",
                xl: "row",
              }}
              gap={8}
            >
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
                  background="gold.100"
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
                    To grow a Shrub you need a seed
                  </Text>
                </Center>
              </Box>
            </Flex>
          </Center>
        </Box>
      </Container>

      {/*ending*/}
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 20 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "40px" }}
            letterSpacing={"tight"}
            mb={16}
          >
            Join Us
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
                  rounded="3xl"
                  size="sm"
                  px="9"
                  fontSize="22px"
                  fontWeight="semibold"
                  py="5"
                  _hover={{ transform: "translateY(-2px)" }}
                  background="gold.100"
                  color={"black"}
                >
                  Join Discord{" "}
                  <ExternalLinkIcon
                    mx="2px"
                    display={{ base: "none", md: "inline" }}
                  />
                </Link>
                <Center>
                  <Text mt={8}>Whitelist contests, games, updates</Text>
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
                  fontSize="22px"
                  fontWeight="semibold"
                  py="5"
                  _hover={{ transform: "translateY(-2px)" }}
                  background="gold.100"
                  color={"black"}
                >
                  Follow Twitter{" "}
                  <ExternalLinkIcon
                    mx="2px"
                    display={{ base: "none", md: "inline" }}
                  />
                </Link>
                <Center>
                  <Text mt={8}>Official announcements, contests</Text>
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
