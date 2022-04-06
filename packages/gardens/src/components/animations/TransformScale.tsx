import { AnimationControls, motion, useAnimation } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

export function TransformScale(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  const flying = {
    // initial: { y: -130, scale: 3 },
    // final: { y: 70, scale: 0 },
  };
  return (
    <MotionBox
      animate={{
        x: ["300px", "26.8553px", "0px"],
        y: ["-72.6283px", "-237.143px", "72.165px"],
        scale: [3, 2, 0],
      }}
      // initial="initial"
      // animate={controls}
      // variants={flying}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        default: { duration: 2 },
      }}
      onAnimationStart={() => console.log("tS start")}
      onAnimationComplete={() => console.log("tS complete")}
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
        ease: "circInOut",
        type: "linear",
        delay: 1.5,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Scale(animationItem: JSX.Element, controls: AnimationControls) {
  const MotionBox = motion<BoxProps>(Box);
  const flying = {
    // initial: { y: -130, scale: 3 },
    // final: { y: 70, scale: 0 },
  };
  return (
    <MotionBox
      animate={{
        scale: [1, 1, 3, 1, 1],
      }}
      // initial="initial"
      // animate={controls}
      // variants={flying}
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

export function Tilt(animationItem: JSX.Element, controls: AnimationControls) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      animate={{
        rotate: [15, 0, 15],
        y: [-111, -130, -111],
        x: [75, 75, 75],
      }}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        duration: 2,
        delay: 1,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}
