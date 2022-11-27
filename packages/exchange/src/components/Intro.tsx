import { isMobile } from "react-device-detect";
import {
  Box,
  Center,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  useColorModeValue,
  Text,
  VStack,
  SlideFade,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { RouteComponentProps } from "@reach/router";
import axios from "axios";
import { useWeb3React } from "@web3-react/core";
import { trackEvent } from "../utils/handleGATracking";
import WyreCheckoutStatus from "./WyreCheckoutStatus";
import Testimonials from "./Testimonials";
import { getChecksumAddress } from "../utils/chainMethods";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";

function Intro(props: RouteComponentProps) {
  const [destAddress, setDestAddress] = useState("");
  const [invalidEntry, setInvalidEntry] = useState(false);
  const { account } = useWeb3React();
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);

  async function wyreCheckout(event: React.BaseSyntheticEvent) {
    handleGA(event);
    type WyreCheckoutParams = {
      redirectUrl?: string;
      failureRedirectUrl?: string;
      dest?: string | undefined;
    };
    // add query params to the success and failure redirect urls so that any route can realize status
    const currentURL = new URL(window.location.href);
    const currentURLParams = new URLSearchParams(currentURL.search);
    const redirectPrefix = `${currentURL.protocol}//${currentURL.host}${currentURL.pathname}?`;
    currentURLParams.set("wyreCheckoutStatus", "failure");
    const failureRedirectUrl = `${redirectPrefix}${currentURLParams.toString()}`;
    currentURLParams.set("wyreCheckoutStatus", "success");
    const redirectUrl = `${redirectPrefix}${currentURLParams.toString()}`;
    const params: WyreCheckoutParams = {
      redirectUrl,
      failureRedirectUrl,
    };
    let checkedAddress;
    try {
      checkedAddress = getChecksumAddress(destAddress);
    } catch (e: any) {
      console.error(e);
      handleErrorMessages({ err: e });
      return;
    }
    const dest = `matic:${checkedAddress}`;
    params.dest = dest;
    let prevReservationUrl = localStorage.getItem(
      "shrub:buyMatic:reservationUrl"
    );
    const prevReservationDate = localStorage.getItem(
      "shrub:buyMatic:reservationDate"
    );
    const prevReservationEndDate =
      prevReservationDate &&
      new Date(new Date(prevReservationDate).getTime() + 60 * 1000 * 14);
    // if there is a reservation in the storage, and we are within the range, use previous reservation url
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

  function handleAddressInput(event: React.ChangeEvent<HTMLInputElement>) {
    let checkedAddress;
    const newValue = event.target.value;
    if (!newValue) {
      // Clear it out if input is cleared
      setDestAddress("");
      if (invalidEntry) {
        setInvalidEntry(false);
      }
      return;
    }
    try {
      checkedAddress = getChecksumAddress(newValue);
    } catch (e: any) {
      console.error(e);
      setDestAddress(newValue);
      if (!invalidEntry) {
        setInvalidEntry(true);
      }
      return;
    }
    if (invalidEntry) {
      setInvalidEntry(false);
    }
    setDestAddress(checkedAddress);
  }

  return (
    <Container mt={50} p={5} flex="1" borderRadius="2xl" maxW="container.lg">
      <WyreCheckoutStatus />
      {localError && (
        <SlideFade in={true} unmountOnExit={true}>
          <Alert status="error" borderRadius={9}>
            <AlertIcon />
            {localError}
          </Alert>
        </SlideFade>
      )}
      <Center mt={isMobile ? 28 : 16}>
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
            fontWeight={"medium"}
            textAlign="center"
            color={"gray.500"}
            px={["4rem", "5rem", "10rem", "10rem"]}
          >
            {isMobile
              ? "The easiest way to buy Polygon MATIC instantly"
              : " The easiest way to buy Polygon MATIC instantly with credit card, debit card or Apple Pay"}
          </Text>
          <VStack>
            <FormControl isInvalid={invalidEntry}>
              <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                {" "}
                Enter the address where you want to receive Polygon (MATIC)
              </FormLabel>
              <Input
                value={destAddress}
                onChange={handleAddressInput}
                borderColor={
                  destAddress && !invalidEntry ? "green.200" : "grey.200"
                }
                focusBorderColor={
                  destAddress && !invalidEntry ? "lime" : "blue"
                }
                errorBorderColor="red.300"
                placeholder="0x..."
                h="6rem"
                borderRadius="3xl"
                shadow="sm"
                fontWeight="medium"
                fontSize="2xl"
              />
              {!invalidEntry ? (
                <FormHelperText></FormHelperText>
              ) : (
                <FormErrorMessage>Invalid Polygon address</FormErrorMessage>
              )}
            </FormControl>
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
              // borderColor={"#64a56a"}
              // borderWidth={"1px"}
              _hover={{
                transform: "translateY(-2px)",
                bgGradient: "linear(128.17deg,#5dc466 -14.78%,#121227 110.05%)",
              }}
              bgGradient="linear(128.17deg,#64a56a -14.78%,#121227 110.05%)"
              color={"white"}
              sx={{ userSelect: "none" }}
            >
              Buy MATIC
            </Link>
          </VStack>

          {/*{!isMobile && (*/}
          {/*  <Center>*/}
          {/*    <ExchangeLogo boxSize={{ base: "xs", md: "xl" }} />*/}
          {/*  </Center>*/}
          {/*)}*/}

          <Box mt={40}>
            <Heading
              fontSize={{ base: "30px", md: "50px" }}
              letterSpacing={"tight"}
            >
              What our users have to say
            </Heading>
          </Box>
          <Box pt="10">
            <Testimonials />
          </Box>

          <Box pt="20" fontSize="14px" fontWeight="medium">
            Trouble Buying?
          </Box>
          <Box pt="4">
            <Link
              href="https://support.sendwyre.com/hc/en-us/requests/new?ticket_form_id=1500000865321"
              isExternal
              cursor="pointer"
              fontSize="13px"
              fontWeight="medium"
              textDecoration="underline"
              color={"gray.500"}
            >
              Report to Wyre
            </Link>
          </Box>
          <Box pt="3">
            <Link
              href="https://discord.gg/ntU4GhfEFP"
              isExternal
              cursor="pointer"
              fontSize="13px"
              fontWeight="medium"
              color={"gray.500"}
              textDecoration="underline"
            >
              Let us know in Discord
            </Link>
          </Box>
        </Box>
      </Center>
    </Container>
  );
}

export default Intro;
