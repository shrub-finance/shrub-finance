import { AnimationControls } from "framer-motion";
import { Box, Center, Text, useColorModeValue } from "@chakra-ui/react";
import { GrowthCounter, Spray, Tilt } from "./Transform";
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
import React from "react";
import { Counter } from "../Counter";

function WateringMany({
  pots,
  seedClass,
  emotion,
  controls,
  fromArg,
  growthAmountArg,
}: {
  pots: number;
  seedClass: string;
  emotion: string;
  controls: AnimationControls;
  fromArg: number;
  growthAmountArg: number;
}) {
  const from = fromArg;
  const to = fromArg + growthAmountArg;

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
  console.log(pots);
  return (
    <Box
      maxH={"30px"}
      maxW={"30px"}
      px={pots === 2 ? 16 : pots === 3 ? 16 : 10}
      py={12}
    >
      <Center
        position="relative"
        left={pots === 2 ? "27px" : pots === 3 ? "43px" : "10px"}
      >
        {React.cloneElement(getPotSvg(seedClass, emotion), {
          boxSize: pots === 2 ? 24 : pots === 3 ? 24 : 12,
        })}
        {GrowthCounter(
          <Center
            position={"absolute"}
            bottom={pots === 2 ? "140px" : pots === 3 ? "140px" : "70px"}
            right={pots === 2 ? "6px" : pots === 3 ? "6px" : "-8px"}
          >
            <Text
              fontSize={pots === 2 ? "15px" : pots === 3 ? "15px" : "12px"}
              fontWeight={"bold"}
              color={growthColor}
            >
              Growth: <Counter from={from} to={to} duration={7} />%
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
              boxSize={pots === 2 ? 12 : pots === 3 ? 12 : 8}
              position={"absolute"}
              left={pots === 2 ? "-50px" : pots === 3 ? "-50px" : "-30px"}
              bottom={pots === 2 ? "76px" : pots === 3 ? "76px" : "42px"}
            />,
            controls
          )}
          {Tilt(
            <WateringCan boxSize={pots === 2 ? 20 : pots === 3 ? 20 : 14} />,
            controls,
            pots === 2
              ? [-16, -16, -16]
              : pots === 3
              ? [-16, -16, -16]
              : [1, 1, 1],
            pots === 2
              ? [-55, -64, -55]
              : pots === 3
              ? [-55, -64, -55]
              : [-35, -40, -35]
          )}
        </Center>
      </Center>
    </Box>
  );
}

export default WateringMany;
