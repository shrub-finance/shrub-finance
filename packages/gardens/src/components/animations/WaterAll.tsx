import { AnimationControls } from "framer-motion";
import { Grid } from "@chakra-ui/react";
import React from "react";
import Watering from "./Watering";
import WateringMany from "./WateringMany";
import { potForWatering } from "../../types";

function WateringAll({
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
        seedClass={potForWatering.type}
        emotion={potForWatering.emotion}
        controls={controls}
        fromArg={potForWatering.growth}
        growthAmountArg={getGrowthAmount("Watering", potForWatering.emotion)}
      />
    );
  }

  return (
    <Grid
      templateColumns="repeat(5, 1fr)"
      templateRows="repeat(3, 1fr)"
      gap={8}
    >
      {waterPots}
    </Grid>
  );
}

export default WateringAll;
