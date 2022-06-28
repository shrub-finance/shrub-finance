import { AnimatePresence, AnimationControls, motion } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

export function Fade(opacities: number[], animationItem: JSX.Element) {
  const MotionBox = motion<BoxProps>(Box);
  const fadeOffset = 0.02;
  return (
    <MotionBox
      animate={{ opacity: opacities }}
      // @ts-ignore
      transition={{
        times: [
          0,
          0.1 - fadeOffset,
          0.1 + fadeOffset,
          0.4 - fadeOffset,
          0.4 + fadeOffset,
          0.6 - fadeOffset,
          0.6 + fadeOffset,
          0.8 - fadeOffset,
          0.8 + fadeOffset,
          1,
        ],
        duration: 35,
        ease: "easeIn",
      }}
      position={"absolute"}
      top={{ base: "280px", md: "466px" }}
      zIndex={2}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Disappear(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  const vanish = {
    initial: { display: "block" },
    final: { display: "none" },
  };

  return (
    <MotionBox
      initial="initial"
      animate={controls}
      variants={vanish}
      // @ts-ignore
      transition={{
        duration: 0.001,
        delay: 1.97,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}

export function Appear(
  animationItem: JSX.Element,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  const pop = {
    initial: { display: "none" },
    final: { display: "block" },
  };
  return (
    <MotionBox
      initial="initial"
      animate={controls}
      variants={pop}
      // @ts-ignore
      transition={{
        duration: 0.001,
        delay: 1.97,
      }}
    >
      {animationItem}
    </MotionBox>
  );
}
