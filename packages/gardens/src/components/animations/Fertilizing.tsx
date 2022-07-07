import { AnimationControls, useAnimation } from "framer-motion";
import {
  Box,
  Center,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Growth, Spray, Tilt, TransformScale } from "./TransformScale";
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
  Water,
  WateringCan,
  Wonder,
  WonderPot,
  WonderSad,
  WonderSadPot,
} from "../../assets/Icons";
import React, { useState } from "react";
import { Appear, Disappear } from "./Fade";
import { Counter } from "../Counter";

function Fertilizing({
  seedClass,
  emotion,
  controls,
}: {
  seedClass: string;
  emotion: string;
  controls: AnimationControls;
}) {
  console.debug("rendering Watering");
  const [from, setFrom] = useState(2187);
  const [to, setTo] = useState(2384);

  const growthColor = useColorModeValue("pink.400", "pink.300");
  const dropColor = useColorModeValue("blue.300", "blue.100");

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
      <Center>
        {React.cloneElement(getPotSvg(seedClass, emotion), {
          boxSize: 40,
          position: "relative",
          bottom: "-146px",
        })}
      </Center>
      {Growth(
        <Center position={"absolute"} top={"150px"}>
          <Text fontSize={"25px"} fontWeight={"bold"} color={growthColor}>
            Growth: <Counter from={from} to={to} />
          </Text>
        </Center>,
        controls
      )}
      <Center>
        {Spray(
          <Water
            stroke={dropColor}
            boxSize={28}
            position={"absolute"}
            top={"224px"}
            right={"210px"}
          />,
          controls
        )}
        {Tilt(<WateringCan boxSize={44} />, controls)}
      </Center>
    </>
  );
}

export default Fertilizing;
