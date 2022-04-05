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
