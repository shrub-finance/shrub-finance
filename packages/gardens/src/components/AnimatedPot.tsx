import { AnimatePresence, motion } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

function AnimatedPot(opacities: number[], animationItem: JSX.Element) {
  const MotionBox = motion<BoxProps>(Box);
  const fadeOffset = 0.02;
  return (
    <AnimatePresence exitBeforeEnter>
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
    </AnimatePresence>
  );
}

export default AnimatedPot;
