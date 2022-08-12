import { AnimationControls } from "framer-motion";
import { AlertTitle, Center, Image, Link, SlideFade } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { IMAGE_ASSETS } from "../../utils/imageAssets";
import Confetti from "../../assets/Confetti";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useWeb3React } from "@web3-react/core";

function Harvesting({ seedClass }: { seedClass: string }) {
  const PAPER_POT_ADDRESS = process.env.REACT_APP_PAPER_POT_ADDRESS || "";
  const [tokenId, setTokenId] = useState(0);

  const descRef = useRef();

  useEffect(function () {
    setTimeout(() => {
      if (descRef.current) {
        // @ts-ignore
        descRef.current.textContent =
          "Congrats!! You just became a proud owner of a Shrub!";
      }
    }, 500);
  }, []);

  const { account } = useWeb3React();

  const openSeaLink = `https://opensea.io/${account}`;

  return (
    <Center>
      <Confetti />
      <Center>
        <Image
          src={IMAGE_ASSETS.shrubs[seedClass].light}
          alt={seedClass}
          boxSize={80}
          position="absolute"
          left={"130px"}
          bottom={0}
        />
      </Center>
      <Center position={"relative"} bottom={"74px"}>
        <AlertTitle fontSize="lg" fontWeight={"medium"}>
          {" "}
          <SlideFade
            in={true}
            unmountOnExit={true}
            // @ts-ignore
            ref={descRef}
          ></SlideFade>
        </AlertTitle>
      </Center>
      <Center>
        <Link
          color={"gray.500"}
          fontSize={"xs"}
          href={openSeaLink}
          isExternal
          zIndex={2}
          fontWeight={"semibold"}
        >
          View in Open Sea
          <ExternalLinkIcon mx="2px" />
        </Link>
      </Center>
    </Center>
  );
}

export default Harvesting;
