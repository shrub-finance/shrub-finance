import { AnimationControls, useAnimation } from "framer-motion";
import { Box, Center, Text, useColorModeValue } from "@chakra-ui/react";
import { Growth, Spray, Tilt, TransformScale } from "./TransformScale";
import {
  Hope,
  HopePot,
  HopeSadPot,
  Passion,
  PassionPot,
  PassionSadPot,
  Power,
  PowerPot,
  Water,
  WateringCan,
  Wonder,
  WonderPot,
  WonderSadPot,
} from "../../assets/Icons";
import React, { useState } from "react";
import { Counter } from "../Counter";

function WateringMany({
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
    <Box maxH={"30px"} maxW={"30px"}>
      <Center position="relative" left="10px">
        {React.cloneElement(getPotSvg(seedClass, emotion), {
          boxSize: 10,
        })}
        {Growth(
          <Center position={"absolute"} bottom={"70px"}>
            <Text fontSize={"10px"} fontWeight={"bold"} color={growthColor}>
              Growth: <Counter from={from} to={to} duration={4} />
            </Text>
          </Center>,
          controls,
          2.5,
          1.5
        )}
        <Center>
          {Spray(
            <Water
              stroke={dropColor}
              boxSize={8}
              position={"absolute"}
              left={"-30px"}
              bottom={"33px"}
              // top={"144px"}
              // right={"210px"}
            />,
            controls
          )}
          {Tilt(
            <WateringCan boxSize={12} />,
            controls,
            [1, 1, 1],
            [-29, -34, -29]
          )}
        </Center>
      </Center>
    </Box>
  );
}

export default WateringMany;
