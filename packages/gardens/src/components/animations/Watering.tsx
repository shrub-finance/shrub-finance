import { AnimationControls, useAnimation } from "framer-motion";
import {
  Box,
  Center,
  Image,
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
  Leaf1,
  Leaf2,
  Leaf3,
  Leaf4,
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
import { IMAGE_ASSETS } from "../../utils/imageAssets";

function Watering({
  seedClass,
  emotion,
  controls,
  fromArg,
  growthAmountArg,
}: {
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
  const stage = IMAGE_ASSETS.percentageToStage(from);

  return (
    <>
      <Center>
        <Image
          src={IMAGE_ASSETS.getPottedPlant(
            seedClass,
            IMAGE_ASSETS.percentageToStage(from),
            emotion
          )}
          alt={seedClass}
          boxSize={80}
          position="absolute"
          bottom={
            stage === 0 || stage === 1 || stage === 2
              ? "-50px"
              : stage === 3
              ? "-24px"
              : 0
          }
        />
      </Center>
      {Growth(
        <Center position={"absolute"} top={"124px"}>
          <Text fontSize={"25px"} fontWeight={"bold"} color={growthColor}>
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
            boxSize={28}
            position={"absolute"}
            top={"224px"}
            right={"210px"}
          />,
          controls
        )}
        {Tilt(
          <WateringCan boxSize={44} />,
          controls,
          [154, 154, 154],
          [33, 13, 33]
        )}
      </Center>
    </>
  );
}

export default Watering;
