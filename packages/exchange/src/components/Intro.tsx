import { isMobile } from "react-device-detect";
import { Box, Center, Container, Heading, Link, Text } from "@chakra-ui/react";
import React from "react";
import { RouteComponentProps } from "@reach/router";
import { ExchangeLogo } from "../assets/Icons";
import axios from "axios";
import { useWeb3React } from "@web3-react/core";
import { trackEvent } from "../utils/handleGATracking";

function Intro(props: RouteComponentProps) {
  const { account } = useWeb3React();
  async function wyreCheckout(event: React.BaseSyntheticEvent) {
    handleGA(event);
    type WyreCheckoutParams = {
      redirectUrl?: string;
      failureRedirectUrl?: string;
      dest?: string | undefined;
    };
    const params: WyreCheckoutParams = {
      redirectUrl: window.location.href,
      failureRedirectUrl: window.location.href,
    };
    let dest;
    if (account) {
      dest = `ethereum:${account}`;
      params.dest = dest;
    }
    let prevReservationUrl = localStorage.getItem(
      "shrub:buyMatic:reservationUrl"
    );
    const prevReservationDate = localStorage.getItem(
      "shrub:buyMatic:reservationDate"
    );
    const prevReservationEndDate =
      prevReservationDate &&
      new Date(new Date(prevReservationDate).getTime() + 60 * 1000 * 14);
    // if there is a reservation in the storage and we are within the range, use previous reservation url
    if (
      prevReservationDate &&
      prevReservationEndDate &&
      prevReservationEndDate > new Date() &&
      prevReservationUrl
    ) {
      // go to the previously used wyre checkout link and let it redirect back to the application on success/fail
      // reset the ethereum address in the reservation url if a user has updated it
      if (account && dest && !prevReservationUrl.includes(account)) {
        const parsePrevReservationUrl = new URL(prevReservationUrl);
        const prevReservationUrlParams = new URLSearchParams(
          parsePrevReservationUrl.search
        );
        prevReservationUrlParams.set("dest", dest);
        prevReservationUrl = `${parsePrevReservationUrl.origin}${
          parsePrevReservationUrl.port
        }${
          parsePrevReservationUrl.pathname
        }?${prevReservationUrlParams.toString()}`;
        // reset the updated url in storage
        localStorage.setItem(
          "shrub:buyMatic:reservationUrl",
          prevReservationUrl
        );
      }
      return (window.location.href = prevReservationUrl);
    }
    // otherwise get a new checkout url and set the url and reservation date in the storage
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/wyre/checkout`,
        params
      );
      if (response?.data?.data?.url) {
        localStorage.setItem(
          "shrub:buyMatic:reservationUrl",
          response.data.data.url
        );
        localStorage.setItem(
          "shrub:buyMatic:reservationDate",
          new Date().toISOString()
        );
        // go to the  wyre checkout link and let it redirect back to the application on success/fail
        return (window.location.href = response.data.data.url);
      }
      throw new Error("could not retrieve checkout url");
    } catch (err) {
      console.error(err);
    }
  }
  function handleGA(event: React.BaseSyntheticEvent) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }

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
            Shrub Exchange
          </Heading>
          <Text
            mt="3"
            mb={{ base: "16", md: "20", lg: "20" }}
            fontSize="18px"
            textAlign="center"
            px={["4rem", "5rem", "10rem", "10rem"]}
          >
            {isMobile
              ? "Shrub Exchange is the easiest way to buy Polygon MATIC instantly"
              : " Shrub Exchange is the easiest way to buy Polygon MATIC instantly with your credit card, debit card or Apple Pay"}
          </Text>
          <Link
            onClick={wyreCheckout}
            isExternal
            cursor="pointer"
            rounded="3xl"
            size="sm"
            px="14"
            fontSize="25px"
            fontWeight="semibold"
            py="5"
            borderColor={"#64a56a"}
            borderWidth={"2px"}
            _hover={{
              transform: "translateY(-2px)",
              bgGradient: "linear(128.17deg,#5dc466 -14.78%,#121227 110.05%)",
            }}
            bgGradient="linear(128.17deg,#64a56a -14.78%,#121227 110.05%)"
            color={"white"}
          >
            Buy MATIC
          </Link>
          <Box pt="46">
            <Link
              href="https://discord.gg/ntU4GhfEFP"
              isExternal
              cursor="pointer"
              fontSize="13px"
              fontWeight="medium"
              textDecoration="underline"
            >
              Trouble buying? Report in Shrub Discord
            </Link>
          </Box>
          <Center>
            <ExchangeLogo boxSize={{ base: "xs", md: "xl" }} />
          </Center>
        </Box>
      </Center>
    </Container>
  );
}

export default Intro;
