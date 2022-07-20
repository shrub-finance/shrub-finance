import { AnimationControls, motion, useAnimation } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

export function TransformScale(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        x: ["300px", "26.8553px", "0px"],
        y: ["-72.6283px", "-237.143px", "72.165px"],
        scale: [3, 2, 0],
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        default: { duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Spray(animationItem: JSX.Element, controls: AnimationControls) {
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
        duration: 1.5,
        type: "tween",
        ease: "linear",
        delay: 1.5,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function GrowthCounter(
  animationItem: JSX.Element,
  controls: AnimationControls,
  duration: number,
  delay: number
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        opacity: [0, 1, 1, 1, 1, 0],
      }}
      // @ts-ignore
      transition={{
        duration: duration,
        type: "tween",
        ease: "linear",
        delay: delay,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Spray2(
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
        duration: 1.5,
        type: "tween",
        ease: "linear",
        delay: 6.5,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Tilt(
  animationItem: JSX.Element,
  controls: AnimationControls,
  x: number[],
  y: number[]
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        opacity: [0, 1, 1, 1, 0],
        rotate: [15, 0, 15],
        x: x,
        y: y,
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        opacity: { delay: 0.005, duration: 4, times: [0, 0.25, 0.5, 0.75, 1] },
        default: { delay: 1, duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Tilt2(
  animationItem: JSX.Element,
  controls: AnimationControls,
  x: number[],
  y: number[]
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        opacity: [0, 1, 1, 1, 0],
        rotate: [0, 15, 0],
        x: x,
        y: y,
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        opacity: { delay: 4, duration: 5, times: [0, 0.25, 0.5, 0.75, 1] },
        default: { delay: 6, duration: 2 },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Shake(animationItem: JSX.Element, controls: AnimationControls) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        rotate: [0, -1, 1, 0, 1, -1, 0, -1, 1, 0, -1],
        y: [1, -1, -3, 3, 1, -1, -3, 3, -1, 1, 1],
        x: [1, -2, 0, 2, -1, 2, 1, 1, -1, 2, -2],
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        duration: 0.25,
        repeat: 4,
        delay: 1.5,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Grow(animationItem: JSX.Element, controls: AnimationControls) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        y: [165, 160],
        x: [-276, -276],
        opacity: [0, 0, 0, 0, 1],
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        opacity: { delay: 1.5, duration: 4, times: [0, 0.25, 0.5, 0.75, 1] },
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Scale(animationItem: JSX.Element, controls: AnimationControls) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        scale: [1, 1, 3, 1, 1],
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        duration: 2,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}
