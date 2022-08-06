import { AnimationControls } from "framer-motion";
import {
  AlertTitle,
  Center,
  Image,
  SlideFade,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { GrowthCounter, Spray, Tilt } from "./Transform";
import { Water, WateringCan } from "../../assets/Icons";
import React, { useEffect, useRef, useState } from "react";
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

  const descRef = useRef();

  useEffect(function () {
    setTimeout(() => {
      if (descRef.current) {
        // @ts-ignore
        descRef.current.textContent = "Transaction Confirming...";
      }
    }, 4500);
  }, []);

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
      {GrowthCounter(
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
        <AlertTitle
          mt={6}
          mb={1}
          fontSize="lg"
          fontWeight={"medium"}
          position={"absolute"}
          top={"124px"}
        >
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
