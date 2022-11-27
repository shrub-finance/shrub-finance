import { AnimationControls, useAnimation } from "framer-motion";
import {
  AlertTitle,
  Center,
  Image,
  SlideFade,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { GrowthCounter, Spray, Spray2, Tilt, Tilt2 } from "./Transform";
import {
  Fertilizer,
  FertilizerSoil,
  Water,
  WateringCan,
} from "../../assets/Icons";
import React, { useEffect, useRef, useState } from "react";
import { Counter } from "../Counter";
import { IMAGE_ASSETS } from "../../utils/imageAssets";

function Fertilizing({
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
  const stage = IMAGE_ASSETS.percentageToStage(from);

  const growthColor = useColorModeValue("pink.400", "pink.300");
  const dropColor = useColorModeValue("blue.300", "blue.100");

  const descRef = useRef();

  useEffect(function () {
    setTimeout(() => {
      if (descRef.current) {
        // @ts-ignore
        descRef.current.textContent = "Transaction Confirming...";
      }
    }, 10000);
  }, []);

  return (
    <Center>
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
          left={"130px"}
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
            Growth: <Counter from={from} to={to} duration={10} />%
          </Text>
        </Center>,
        controls,
        7.5,
        1.5
      )}
      <Center position={"absolute"} top={"120px"}>
        <AlertTitle mt={6} mb={1} fontSize="lg" fontWeight={"medium"}>
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
            right={"197px"}
          />,
          controls
        )}
        {Tilt(
          <WateringCan boxSize={44} />,
          controls,
          [166, 166, 166],
          [33, 12, 33]
        )}
      </Center>
      <Center>
        {Spray2(
          <FertilizerSoil
            stroke={dropColor}
            boxSize={28}
            position={"absolute"}
            top={"228px"}
            left={"189px"}
          />,
          controls
        )}
        {Tilt2(
          <Fertilizer boxSize={28} position={"absolute"} />,
          controls,
          [-286, -286, -286],
          [-1, -26, -1]
        )}
      </Center>
    </Center>
  );
}

export default Fertilizing;
