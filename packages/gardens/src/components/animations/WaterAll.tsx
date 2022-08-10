import { AnimationControls } from "framer-motion";
import { AlertTitle, Center, Grid, SlideFade } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import Watering from "./Watering";
import WateringMany from "./WateringMany";
import { potForWatering } from "../../types";

function WaterAll({
  controls,
  potsForWatering,
}: {
  controls: AnimationControls;
  potsForWatering: potForWatering[];
}) {
  console.debug("rendering Water All");

  function getGrowthAmount(description: string, emotion?: string) {
    return description === "Fertilizing"
      ? emotion === "sad"
        ? 2.07
        : 4.13
      : emotion === "sad"
      ? 1.38
      : 2.75;
  }

  const waterPots: JSX.Element[] = [];
  for (const potForWatering of potsForWatering) {
    waterPots.push(
      <WateringMany
        pots={potsForWatering.length}
        seedClass={potForWatering.type}
        emotion={potForWatering.emotion}
        controls={controls}
        key={potForWatering.id}
        fromArg={(potForWatering.growth || 0) / 100}
        growthAmountArg={getGrowthAmount("Watering", potForWatering.emotion)}
      />
    );
  }

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
        <AlertTitle
          position={"absolute"}
          top={
            potsForWatering.length === 2
              ? "104px"
              : potsForWatering.length === 3
              ? "104px"
              : "79px"
          }
          fontWeight={"medium"}
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
      <Grid
        templateColumns={
          potsForWatering.length === 2
            ? "repeat(2, 1fr)"
            : potsForWatering.length === 3
            ? "repeat(3, 1fr)"
            : "repeat(5, 1fr)"
        }
        templateRows="repeat(3, 1fr)"
        gap={6}
        mt={potsForWatering.length > 5 ? "-48px" : "50px"}
      >
        {waterPots}
      </Grid>
    </>
  );
}

export default WaterAll;
