import { AnimationControls, useAnimation } from "framer-motion";
import { Box, Center, useColorMode } from "@chakra-ui/react";
import { TransformScale } from "./TransformScale";
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
import React, { useEffect, useState } from "react";
import { Appear, Disappear } from "./Fade";

export function Planting({
  seedClass,
  emotion,
  id,
  controls,
}: {
  seedClass: string;
  emotion: string;
  id: string;
  controls: AnimationControls;
}) {
  // export function Planting(seedClass: string, emotion: string, id: string) {

  console.debug("rendering Planting");
  // const controls = useAnimation();
  const { colorMode } = useColorMode();

  const [lastId, setLastId] = useState<string>("");

  // useEffect(() => {
  //   if (lastId !== id) {
  //     setTimeout(() => {
  //       controls.start("final");
  //     }, 1);
  //     console.debug(`setting lastId ${id}`);
  //     setLastId(id);
  //   }
  // }, []);

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
      <Box
      // animate={{
      //   backgroundColor: [
      //   colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
      //   "#ffd06b",
      //   colorMode === "light" ? "#fff" : "rgb(31, 31, 65)",
      //   ]
      // }}
      // // @ts-ignore
      // transition={{
      //   duration: 0.25,
      //   delay: 1.97,
      // }}
      >
        <Center>
          {TransformScale(
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
