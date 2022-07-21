import { AnimationControls, useAnimation } from "framer-motion";
import { Box, Center, useColorMode } from "@chakra-ui/react";
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
import React from "react";
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
      </Box>
    </>
  );
}
