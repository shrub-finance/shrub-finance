import { Center, useColorModeValue } from "@chakra-ui/react";
import {
  Fertilizer,
  FertilizerSoil,
  Leaf1,
  Leaf2,
  Water,
  WateringCan,
  WonderPot,
} from "../../assets/Icons";
import React, { useEffect } from "react";
import { useAnimation } from "framer-motion";
import {
  GrowStage1,
  GrowStage2,
  Spray2Stage1,
  SprayStage1,
  Tilt2Stage1,
  TiltStage1,
} from "./GrowthDemo";

function Stage1() {
  const controls = useAnimation();
  const dropColor = useColorModeValue("blue.300", "blue.100");

  useEffect(() => {
    setTimeout(() => {
      controls.start("open");
    }, 1);
    setTimeout(() => {
      controls.start("closed");
    }, 8);
  }, []);

  return (
    <Center>
      <WonderPot
        boxSize={60}
        position={"relative"}
        left={"225px"}
        bottom={"-88px"}
      />
      <Center>
        <Center>
          {GrowStage1(
            <Leaf1
              boxSize={52}
              position={"absolute"}
              bottom={"150px"}
              left={"296px"}
            />,
            controls
          )}
          {GrowStage2(
            <Leaf2
              boxSize={52}
              position={"absolute"}
              bottom={"150px"}
              left={"280px"}
            />,
            controls
          )}
        </Center>
        <Center>
          {SprayStage1(
            <Water
              stroke={dropColor}
              boxSize={28}
              position={"relative"}
              top={"-32px"}
              right={"-86px"}
            />,
            controls
          )}
          {TiltStage1(<WateringCan boxSize={60} />, controls)}
        </Center>
        <Center>
          {Spray2Stage1(
            <FertilizerSoil
              stroke={dropColor}
              boxSize={28}
              position={"relative"}
              left={"-407px"}
              top={"-35px"}
            />,
            controls
          )}
          {Tilt2Stage1(
            <Fertilizer
              boxSize={40}
              position="relative"
              left={"-395px"}
              top={"-21px"}
            />,
            controls,
            [-260, -306, -260],
            [17, 100, 17]
          )}
        </Center>
      </Center>
    </Center>
  );
}

export default Stage1;
