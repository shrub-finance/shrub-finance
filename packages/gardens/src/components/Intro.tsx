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
import { GoofyWonder, Night, Pot, Ticket, WonderPot } from "../assets/Icons";
import { FaLongArrowAltRight, FaPlus } from "react-icons/all";

function Intro(props: RouteComponentProps) {
  return (
    <>
      <Container
        mt={{ base: 110, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "container.lg" }}
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
        mt={{ base: 110, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "1400px" }}
      >
        <Flex
          direction={{ base: "column", md: "column", lg: "column" }}
          // alignItems={{ base: "center", md: "left", lg: "left" }}
        >
          {/*section 1*/}
          <Box mt={20}>
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
          <Box mt={32} ml={80}>
            <HStack>
              <Pot boxSize={{ base: 20, md: 80 }} />
              <Icon as={FaPlus} boxSize={{ base: 12, md: 20 }} />
              <GoofyWonder boxSize={{ base: 20, md: 80 }} />
              <Icon as={FaLongArrowAltRight} boxSize={{ base: 12, md: 24 }} />
              <WonderPot boxSize={{ base: 20, md: 80 }} />
            </HStack>
          </Box>
        </Flex>
      </Container>
      <Container
        mt={{ base: 110, md: 40 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "1400px" }}
      >
        {/*section 2*/}
        <Flex
          direction={{ base: "column", md: "column", lg: "column" }}
          // alignItems={{ base: "center", md: "left", lg: "left" }}
        >
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
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Take care of your plant to help it grow.
            </Text>{" "}
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Watering the Potted plants makes it grow big and strong!
              Fertilizing also gives it a boost!{" "}
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Watch the traits of your plant update dynamically on OpenSea after
              you interact with it.
            </Text>
          </Box>
          <Spacer />
          <Box maxW="80rem" mt={20} ml={80}>
            <Image width={"1400px"} src="/grow.png" />
          </Box>
        </Flex>
      </Container>
      <Container
        mt={{ base: 110, md: 40 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "1400px" }}
      >
        {/*section 3*/}
        <Flex
          direction={{ base: "column", md: "column", lg: "row" }}
          // alignItems={{ base: "center", md: "left", lg: "left" }}
        >
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
          <Box
            // boxSize={["sm", "md", "lg", "xl", "4xl"]}
            mt={20}
          >
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
        mt={{ base: 110, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "1400px" }}
      >
        {/*section 4*/}
        <Flex
          direction={{ base: "column", md: "row", lg: "row" }}
          // alignItems={{ base: "center", md: "left", lg: "left" }}
        >
          <Box>
            <Night boxSize={"xl"} />
          </Box>
          <Spacer />
          <Box mt={8} ml={40}>
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
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The seeds are now ready to transform and grow. The potter has come
              to help. He has a limited supply of pots which the paper seeds can
              be planted in.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              {" "}
              It is the moment that everyone has been waiting for. It is time to
              grow!
            </Text>
          </Box>
        </Flex>
      </Container>
      <Container
        mt={{ base: 110, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "1400px" }}
      >
        {/*section 5*/}
        <Flex
          direction={{ base: "column", md: "row", lg: "row" }}
          // alignItems={{ base: "center", md: "left", lg: "left" }}
        >
          <Box mt={8}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW="40rem"
            >
              An innovative distribution system
            </Heading>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              The whitelist for the Pot sale will make use of a new distribution
              method created by the Shrub engineering team.
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              NFT Tickets are NFTs themselves (ERC-1155) and are super
              gas-efficient to mint!
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              When buying NFT tickets in a pre-sale, only a portion of the total
              cost must be paid. The NFT ticket can later be redeemed after the
              public sale by paying the rest.{" "}
            </Text>
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              Because NFT ticket itself can be sold on the secondary markets, it
              provides collectors with tons of flexibility.
            </Text>
          </Box>
          <Box ml={40}>
            <Ticket boxSize={{ base: 400, md: 600 }} />
          </Box>
        </Flex>
      </Container>
      <Container
        mt={{ base: 110, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "1400px" }}
      >
        {/*section 6*/}
        <Flex
          direction={{ base: "column", md: "row", lg: "row" }}
          // alignItems={{ base: "center", md: "left", lg: "left" }}
        >
          <Box mt={40}>
            <Heading
              fontSize={{ base: "30px", md: "70px" }}
              letterSpacing={"tight"}
              maxW="40rem"
            >
              The Shrub Club
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
            <Text
              mt="3"
              fontSize={{ base: "20px", md: "28px" }}
              maxW={{ base: "22rem", md: "40rem" }}
              fontWeight={{ base: "semibold", md: "medium" }}
            >
              We do it by going beyond the jpeg, and finding real use cases.
            </Text>
          </Box>
          <Box mt={64}>
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
        mt={{ base: 110, md: 50 }}
        p={5}
        flex="1"
        borderRadius="2xl"
        maxW={{ base: "container.xs", md: "container.lg" }}
      >
        <Box maxW="80rem" mt={32} textAlign={"center"}>
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
            px={["4rem", "5rem", "10rem", "10rem"]}
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
            px={["4rem", "5rem", "10rem", "10rem"]}
            fontWeight={{ base: "semibold", md: "medium" }}
          >
            Mint details coming soon...
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
    </>
  );
}

export default Intro;
