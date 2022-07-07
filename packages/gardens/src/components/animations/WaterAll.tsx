import { AnimationControls, useAnimation } from "framer-motion";
import {
  Box,
  Center,
  Grid,
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
import React, { ReactElement, useState } from "react";
import { Appear, Disappear } from "./Fade";
import { Counter } from "../Counter";
import Watering from "./Watering";
import WateringMany from "./WateringMany";

function WateringAll({
  waterAnimation,
  controls,
}: {
  waterAnimation?: ReactElement;
  controls: AnimationControls;
}) {
  console.debug("rendering Water All");

  return (
    <Grid
      templateColumns="repeat(5, 1fr)"
      templateRows="repeat(3, 1fr)"
      gap={8}
    >
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
      <WateringMany
        seedClass={"Wonder"}
        emotion={"Happy"}
        controls={controls}
      />
    </Grid>
  );
}

export default WateringAll;
