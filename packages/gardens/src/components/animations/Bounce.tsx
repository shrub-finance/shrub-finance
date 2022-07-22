import { AnimationControls, motion } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

export function Bounce(
  animationItem: JSX.Element,
  bounceTop: string,
  bounceBottom: string,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  return (
    <MotionBox
      // @ts-ignore
      transition={{
        y: {
          duration: 0.4,
          yoyo: Infinity,
          ease: "easeOut",
        },
      }}
      animate={{
        y: [bounceTop, bounceBottom],
      }}
    >
      {animationItem}
    </MotionBox>
  );
}
