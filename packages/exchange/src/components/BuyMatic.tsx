import axios from "axios";
import { Button, Link, useColorModeValue } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import { trackEvent } from "../utils/handleGATracking";
import { isMobile } from "react-device-detect";
import React from "react";

function BuyMatic() {
  const { account } = useWeb3React();

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
    <>
      <Button
        pr={5}
        fontSize={"md"}
        variant={"solid"}
        fontWeight={"bold"}
        colorScheme={"green"}
        rounded={"2xl"}
        onClick={wyreCheckout}
        mr={"4"}
      >
        Buy MATIC
      </Button>

      {!isMobile && (
        <Link
          pr={5}
          fontSize={"sm"}
          fontWeight={"bold"}
          color={useColorModeValue("blue", "yellow")}
          href={"https://discord.gg/BpHuVCYtdB"}
          isExternal
        >
          Join Discord
        </Link>
      )}
    </>
  );
}

export default BuyMatic;
