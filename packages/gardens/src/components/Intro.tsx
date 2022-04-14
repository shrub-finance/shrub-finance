import {
  AspectRatio,
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Link,
  Text,
  Image,
  Spacer,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon, Icon } from "@chakra-ui/icons";
import React from "react";
import { RouteComponentProps } from "@reach/router";
import {
  Fertilizer,
  FertilizerSoil,
  GoofyWonder,
  Leaf1,
  Leaf2,
  Night,
  Pot,
  Ticket,
  Ticket1,
  Water,
  WateringCan,
  WonderPot,
} from "../assets/Icons";
import { FaLongArrowAltRight, FaPlus } from "react-icons/all";
import { Grow, Spray, Spray2, Tilt, Tilt2 } from "./animations/TransformScale";
import { useAnimation } from "framer-motion";

function Intro(props: RouteComponentProps) {
  const controls = useAnimation();
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
        <Box maxW="80rem" mb={8} mt={100} textAlign={"center"}>
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
      </Container>
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        <Flex direction={{ base: "column", md: "column", lg: "column" }}>
          {/*section 1*/}
          <Box mt={{ base: 0, md: 20 }}>
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
              Plant your seed, grow a shrub.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Planting your Paper Seed into a pot creates a Potted Plant!{" "}
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              For the first time ever, grow your NFT by interacting with it
              on-chain.
            </Text>
          </Box>
          <Spacer />
          <Box
            mt={{ base: 20, md: 32 }}
            ml={{ base: 0, md: 0, lg: 60, xl: 70 }}
          >
            <HStack>
              <Pot boxSize={{ base: 20, md: 52, lg: 52, xl: 80 }} />
              <Icon
                as={FaPlus}
                boxSize={{ base: 10, md: 16, lg: 16, xl: 20 }}
              />
              <GoofyWonder boxSize={{ base: 20, md: 52, lg: 52, xl: 80 }} />
              <Icon
                as={FaLongArrowAltRight}
                boxSize={{ base: 10, md: 20, lg: 16, xl: 24 }}
              />
              <WonderPot boxSize={{ base: 20, md: 52, lg: 52, xl: 80 }} />
            </HStack>
          </Box>
        </Flex>
      </Container>
      <Container
        mt={{ base: 0, md: 40 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        {/*section 2*/}
        <Flex direction={{ base: "column", md: "column", lg: "column" }}>
          <Box mt={8}>
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
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Take care of your plant to help it grow.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Watering the Potted plants makes it grow big and strong!
              Fertilizing also gives it a boost!{" "}
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Watch the traits of your plant update dynamically on OpenSea after
              you interact with it.
            </Text>
          </Box>
          <Spacer />
          <Box mt={{ base: 10, md: 32 }} ml={20}>
            <Center>
              <WonderPot
                boxSize={60}
                position={"relative"}
                left={"225px"}
                bottom={"-88px"}
              />
              <Center>
                <Center>
                  {Grow(
                    <Leaf1
                      boxSize={52}
                      position={"absolute"}
                      bottom={"150px"}
                      left={"296px"}
                    />,
                    controls
                  )}
                </Center>
                <Center>
                  {Spray(
                    <Water
                      stroke={dropColor}
                      boxSize={28}
                      position={"relative"}
                      top={"-32px"}
                      right={"-86px"}
                    />,
                    controls
                  )}
                  {Tilt(<WateringCan boxSize={60} />, controls)}
                </Center>
                <Center>
                  {Spray2(
                    <FertilizerSoil
                      stroke={dropColor}
                      boxSize={28}
                      position={"relative"}
                      left={"-407px"}
                      top={"-35px"}
                    />,
                    controls
                  )}
                  {Tilt2(
                    <Fertilizer
                      boxSize={40}
                      position="relative"
                      left={"-395px"}
                      top={"-21px"}
                    />,
                    controls,
                    [-285, -306, -285],
                    [17, 100, 17]
                  )}
                </Center>
              </Center>
            </Center>
          </Box>
        </Flex>
      </Container>
      <Container
        mt={{ base: 110, md: 60, lg: 40 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        {/*section 3*/}
        <Flex direction={{ base: "column", md: "row", lg: "row" }}>
          <Box mt={8}>
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
              Once your potted plant is fully grown it is time to harvest.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Out will come a shrub, based on the type of seed you planted, its
              emotion and its DNA. Some combinations result in rare traits!
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
      <Container
        mt={{ base: 0, md: 54, lg: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        {/*section 4*/}
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
              The story so far
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              It all started with a visit from the mysterious traveller the
              Paper Merchant. He came with seeds to give to the chosen. Some
              seeds were neglected and became sad.{" "}
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
              The seeds are now ready to transform and grow. The potter has come
              to help. He has a limited supply of pots which the paper seeds can
              be planted in.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              {" "}
              It is the moment that everyone has been waiting for. It is time to
              grow!
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
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        {/*section 5*/}
        <Flex direction={{ base: "column", md: "column", lg: "row" }}>
          <Box mt={{ base: 0, md: 8 }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW={{ base: "40rem", md: "60rem", lg: "40rem" }}
            >
              An innovative distribution system
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The whitelist for the Pot sale will make use of an entirely new
              distribution method created by the Shrub engineering team.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              NFT Tickets are NFTs themselves (ERC-1155) and are super
              gas-efficient to mint!
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              When buying NFT tickets in a pre-sale, only a portion of the total
              cost must be paid. The NFT ticket can later be redeemed after the
              public sale by paying the rest.{" "}
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "60rem", lg: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Because NFT ticket itself can be sold on the secondary markets, it
              provides collectors with tons of flexibility.
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
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "1400px" }}
      >
        {/*section 6*/}
        <Flex direction={{ base: "column", md: "row", lg: "row" }}>
          <Box mt={{ base: "0", md: "0", lg: "40" }}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW="40rem"
            >
              Shrub is a movement
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              It takes a special sort of person to hold a Shrub.{" "}
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Shrubs represent those who believe in the decentralized world and
              are willing to put in the effort to make it a reality.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Shrub holders are dreamers, builders, innovators, thinkers, and
              freedom-lovers. They think outside the box and change the world in
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
      <Container
        mt={{ base: 0, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.sm", md: "container.lg" }}
      >
        <Box maxW="80rem" mt={{ base: 16, md: 32 }} textAlign={"center"}>
          <Heading
            fontSize={{ base: "30px", md: "90px" }}
            letterSpacing={"tight"}
          >
            Stand apart. Raise the bar. Set the standard.
          </Heading>
          <Text
            mt="6"
            mb={{ base: "16", md: "20", lg: "20" }}
            fontSize={{ base: "20px", md: "28px" }}
            textAlign="center"
            px={["0", "5rem", "10rem"]}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Owning a Shrub means you stand by the ethos of decentralization, and
            believe in the core idea that innovation is necessary to create the
            future.
          </Text>
          <Text
            mt="6"
            mb={{ base: "16", md: "20", lg: "20" }}
            fontSize={{ base: "20px", md: "28px" }}
            textAlign="center"
            px={["4rem", "5rem", "10rem"]}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Mint details coming soon...
          </Text>
          <Center>
            <Flex direction={{ base: "column", md: "row" }} gap={8}>
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
                Join our Discord{" "}
                <ExternalLinkIcon
                  mx="2px"
                  display={{ base: "none", md: "inline" }}
                />
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
                ml={{ base: 0, md: "8" }}
                _hover={{ transform: "translateY(-2px)" }}
                bgGradient="linear(to-r, #88910e, #fcafc5, #e3d606)"
                color={"black"}
              >
                Follow on Twitter{" "}
                <ExternalLinkIcon
                  mx="2px"
                  display={{ base: "none", md: "inline" }}
                />
              </Link>
            </Flex>
          </Center>
        </Box>
      </Container>
    </>
  );
}

export default Intro;
