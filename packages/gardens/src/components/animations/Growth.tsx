import { AnimationControls, useAnimation } from "framer-motion";
import { Center, Image } from "@chakra-ui/react";
import { Grow, Shake } from "./TransformScale";
import { Leaf1, Leaf2, Leaf3, Leaf4, WonderPot } from "../../assets/Icons";
import React, { useEffect } from "react";
import { IMAGE_ASSETS } from "../../utils/imageAssets";

function Growth({
  seedClass,
  emotion,
  growthPercentage,
}: {
  seedClass: string;
  emotion: string;
  growthPercentage: number;
}) {
  const controls = useAnimation();

  // Start animation
  useEffect(() => {
    setTimeout(() => {
      controls.start("final");
    }, 1);
  }, []);

  return (
    <>
      <Center mt={{ base: "8", md: "4" }} position={"relative"}>
        <Center>
          {Shake(
            <Image
              src={IMAGE_ASSETS.getPottedPlant(seedClass, 0, emotion, "shrub")}
              alt={seedClass}
              transform={
                20 < growthPercentage && growthPercentage < 60
                  ? "scale(1.8)"
                  : 60 < growthPercentage && growthPercentage <= 100
                  ? "scale(1.4)"
                  : undefined
              }
              maxH={"250px"}
            />,
            controls
          )}
        </Center>

        <Center>
          {20 <= growthPercentage && growthPercentage <= 40 ? (
            Grow(
              <Leaf1
                boxSize={40}
                position={"absolute"}
                bottom={"212px"}
                left={"86px"}
              />,
              controls
            )
          ) : 40 <= growthPercentage && growthPercentage <= 60 ? (
            Grow(
              <Leaf2
                boxSize={40}
                position={"absolute"}
                bottom={"212px"}
                left={"76px"}
              />,
              controls
            )
          ) : 60 <= growthPercentage && growthPercentage <= 80 ? (
            Grow(
              <Leaf3
                boxSize={32}
                position={"absolute"}
                bottom={"201px"}
                left={"88px"}
              />,
              controls
            )
          ) : 80 <= growthPercentage && growthPercentage <= 100 ? (
            Grow(
              <Leaf4
                boxSize={28}
                position={"absolute"}
                bottom={"200px"}
                left={"95px"}
              />,
              controls
            )
          ) : (
            <></>
          )}
        </Center>
      </Center>
    </>
  );
}

export default Growth;
