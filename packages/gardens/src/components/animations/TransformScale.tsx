import { AnimationControls, motion, useAnimation } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

export function TransformScale(
  animationItem: JSX.Element,
  setExplosion: React.Dispatch<React.SetStateAction<boolean>>,
  controls: AnimationControls
) {
  const MotionBox = motion<BoxProps>(Box);
  function onComplete() {
    console.log("ts complete");
    // setExplosion(true);
  }

  const flying = {
    initial: { y: -130, scale: 3 },
    final: { y: 70, scale: 0 },
  };

  return (
    <MotionBox
      initial="initial"
      animate={controls}
      variants={flying}
      // @ts-ignore
      transition={{
        type: "spring",
        stiffness: 100,
        default: { duration: 2 },
      }}
      onAnimationStart={() => console.log("tS start")}
      onAnimationComplete={onComplete}
    >
      {animationItem}
    </MotionBox>
  );
}
