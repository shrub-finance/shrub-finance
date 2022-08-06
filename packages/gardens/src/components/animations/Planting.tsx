import { AnimationControls, useAnimation } from "framer-motion";
import {
  AlertTitle,
  Box,
  Center,
  Fade,
  SlideFade,
  useColorMode,
} from "@chakra-ui/react";
import { Transform } from "./Transform";
import {
  Hope,
  HopePot,
  HopeSad,
  HopeSadPot,
  Passion,
  PassionPot,
  PassionSad,
  PassionSadPot,
  PlantingPot,
  Power,
  PowerPot,
  Wonder,
  WonderPot,
  WonderSad,
  WonderSadPot,
} from "../../assets/Icons";
import React, { useEffect, useRef } from "react";
import { Appear, Disappear } from "./Fade";

export function Planting({
  seedClass,
  emotion,
  controls,
}: {
  seedClass: string;
  emotion: string;
  controls: AnimationControls;
}) {
  console.debug("rendering Planting");
  const descRef = useRef();

  useEffect(function () {
    setTimeout(() => {
      if (descRef.current) {
        // @ts-ignore
        descRef.current.textContent = "Transaction Confirming...";
      }
    }, 3000);
  }, []);

  function getSeedSvg(seedClass: string, emotion: string) {
    return seedClass === "Wonder" ? (
      emotion === "happy" ? (
        <Wonder />
      ) : (
        <WonderSad />
      )
    ) : seedClass === "Passion" ? (
      emotion === "happy" ? (
        <Passion />
      ) : (
        <PassionSad />
      )
    ) : seedClass === "Hope" ? (
      emotion === "happy" ? (
        <Hope />
      ) : (
        <HopeSad />
      )
    ) : seedClass === "Power" ? (
      <Power />
    ) : (
      <></>
    );
  }

  function getPotSvg(seedClass: string, emotion: string) {
    return seedClass === "Wonder" ? (
      emotion === "happy" ? (
        <WonderPot />
      ) : (
        <WonderSadPot />
      )
    ) : seedClass === "Passion" ? (
      emotion === "happy" ? (
        <PassionPot />
      ) : (
        <PassionSadPot />
      )
    ) : seedClass === "Hope" ? (
      emotion === "happy" ? (
        <HopePot />
      ) : (
        <HopeSadPot />
      )
    ) : seedClass === "Power" ? (
      <PowerPot />
    ) : (
      <></>
    );
  }

  return (
    <>
      <Box>
        <Center>
          {Transform(
            React.cloneElement(getSeedSvg(seedClass, emotion), { boxSize: 20 }),
            controls
          )}
        </Center>
        <Center>
          {Disappear(<PlantingPot boxSize={40} />, controls)}
          {Appear(
            React.cloneElement(getPotSvg(seedClass, emotion), { boxSize: 40 }),
            controls
          )}
        </Center>
        <Center>
          <AlertTitle mt={6} mb={1} fontSize="lg" fontWeight={"bold"}>
            {" "}
            <SlideFade
              in={true}
              unmountOnExit={true}
              // @ts-ignore
              ref={descRef}
            ></SlideFade>
          </AlertTitle>
        </Center>
      </Box>
    </>
  );
}
