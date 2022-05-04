import axios from "axios";
import { Button } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";

function BuyMatic() {
  const { account } = useWeb3React();

  async function wyreCheckout() {
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

  return (
    <>
      <Button
        pr={5}
        fontSize={"md"}
        variant={"link"}
        fontWeight={"bold"}
        colorScheme={"green"}
        onClick={wyreCheckout}
      >
        Buy MATIC
      </Button>
    </>
  );
}

export default BuyMatic;
