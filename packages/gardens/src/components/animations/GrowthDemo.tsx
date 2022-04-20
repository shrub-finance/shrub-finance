import { AnimationControls, motion, useAnimation } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";
import { SetStateAction, AnimationEventHandler } from "react";

export function GrowStage1(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  const variants = {
    open: {
      y: [190, 160],
      x: [-276, -276],
      opacity: [0, 0, 0, 0, 1],
    },
    closed: { opacity: [0, 0, 1, 1, 0] },
  };

  return (
    <MotionBox
      initial={"open"}
      animate={controls}
      variants={variants}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        opacity: {
          delay: 2,
          duration: 7,
          times: [0, 0.25, 0.5, 0.75, 1],
        },
        default: { delay: 1.5, duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function GrowStage2(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  const variants = {
    open: {
      y: [161],
      x: [-272],
      opacity: [0, 0, 0, 0, 1],
    },
  };
  return (
    <MotionBox
      initial={"open"}
      animate={controls}
      variants={variants}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        opacity: {
          delay: 6.5,
          duration: 3,
          times: [0, 0.25, 0.5, 0.75, 1],
        },
        default: { delay: 10, duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function SprayStage1(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        opacity: [0, 1, 1, 1, 1, 0],
        strokeDasharray: [
          "30px, 30px",
          "30px, 30px",
          "30px, 30px",
          "30px, 30px",
          "30px, 30px",
        ],
        strokeDashoffset: [0, -15, -125, -300, -500, -800],
      }}
      // @ts-ignore
      transition={{
        duration: 0.5,
        type: "tween",
        ease: "linear",
        delay: 1.5,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Spray2Stage1(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        opacity: [0, 1, 1, 1, 1, 0],
        strokeDasharray: [
          "30px, 30px",
          "30px, 30px",
          "30px, 30px",
          "30px, 30px",
          "30px, 30px",
        ],
        strokeDashoffset: [0, -15, -125, -300, -500, -800],
      }}
      // @ts-ignore
      transition={{
        duration: 0.5,
        type: "tween",
        ease: "linear",
        delay: 6.5,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function TiltStage1(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        rotate: [15, 0, 15],
        y: [-39, -61, -39],
        x: [74, 74, 74],
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        default: { delay: 1, duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Tilt2Stage1(
  animationItem: JSX.Element,
  controls: AnimationControls,
  x: number[],
  y: number[]
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        rotate: [0, 15, 0],
        x: x,
        y: y,
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        default: { delay: 6, duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}
