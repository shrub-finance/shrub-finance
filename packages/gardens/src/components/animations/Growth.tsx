import { useAnimation } from "framer-motion";
import { Center, Image } from "@chakra-ui/react";
import { Shake } from "./Transform";
import { Fade2 } from "./Fade";
import { Leaf1, Leaf2, Leaf3, Leaf4 } from "../../assets/Icons";
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
      <Center mt={{ base: "8", md: "6" }} position={"relative"}>
        <Center>
          {Shake(
            <>
              <Image
                src={IMAGE_ASSETS.getPottedPlant(
                  seedClass,
                  0,
                  emotion,
                  "shrub"
                )}
                alt={seedClass}
                transform={
                  growthPercentage < 20
                    ? "scale(2)"
                    : 20 <= growthPercentage && growthPercentage < 60
                    ? "scale(1.8)"
                    : 60 <= growthPercentage && growthPercentage < 80
                    ? "scale(1.4)"
                    : 80 <= growthPercentage && growthPercentage < 100
                    ? "scale(1.2)"
                    : growthPercentage === 100
                    ? "scale(0)"
                    : undefined
                }
                maxH={"250px"}
                position={growthPercentage > 80 ? "relative" : "static"}
                bottom={"-42px"}
              />
              {20 <= growthPercentage && growthPercentage < 40 ? (
                <></>
              ) : 40 <= growthPercentage && growthPercentage < 60 ? (
                Fade2(
                  [1, 1, 0],
                  <Leaf1
                    boxSize={36}
                    position={"absolute"}
                    bottom={"178px"}
                    left={"69px"}
                  />,
                  7,
                  0
                )
              ) : 60 <= growthPercentage && growthPercentage < 80 ? (
                Fade2(
                  [1, 1, 0],
                  <Leaf2
                    boxSize={36}
                    position={"absolute"}
                    bottom={"167px"}
                    left={"58px"}
                  />,
                  7,
                  0
                )
              ) : 80 <= growthPercentage && growthPercentage < 100 ? (
                Fade2(
                  [1, 1, 0],
                  <Leaf3
                    boxSize={36}
                    position={"absolute"}
                    bottom={"117px"}
                    left={"57px"}
                  />,
                  7,
                  0
                )
              ) : growthPercentage === 100 ? (
                Fade2(
                  [1, 1, 0],
                  <Image
                    src={IMAGE_ASSETS.getPottedPlant(
                      seedClass,
                      4,
                      emotion,
                      "shrub"
                    )}
                    alt={seedClass}
                    transform={"scale(1.2)"}
                    maxH={"250px"}
                    position={"absolute"}
                    bottom={"5px"}
                    left={"3px"}
                  />,
                  7,
                  0
                )
              ) : (
                <></>
              )}
            </>,
            controls
          )}
        </Center>

        <Center>
          {20 <= growthPercentage && growthPercentage < 40 ? (
            Fade2(
              [0, 0, 1],
              <Leaf1
                boxSize={36}
                position={"absolute"}
                bottom={"176px"}
                left={"67px"}
              />,
              6,
              0
            )
          ) : 40 <= growthPercentage && growthPercentage < 60 ? (
            Fade2(
              [0, 0, 1],
              <Leaf2
                boxSize={36}
                position={"absolute"}
                bottom={"176px"}
                left={"57px"}
              />,
              6,
              0
            )
          ) : 60 <= growthPercentage && growthPercentage < 80 ? (
            Fade2(
              [0, 0, 1],
              <Leaf3
                boxSize={36}
                position={"absolute"}
                bottom={"166px"}
                left={"53px"}
              />,
              6,
              0
            )
          ) : 80 <= growthPercentage && growthPercentage < 100 ? (
            Fade2(
              [0, 0, 1],
              <Leaf4
                boxSize={36}
                position={"absolute"}
                bottom={"117px"}
                left={"53px"}
              />,
              6,
              0
            )
          ) : growthPercentage === 100 ? (
            Fade2(
              [0, 0, 1],
              <Image
                src={IMAGE_ASSETS.getPottedPlant(
                  seedClass,
                  5,
                  emotion,
                  "shrub"
                )}
                alt={seedClass}
                transform={"scale(1.2)"}
                maxH={"250px"}
                position={"absolute"}
                bottom={"5px"}
                left={"3px"}
              />,
              6,
              0
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
