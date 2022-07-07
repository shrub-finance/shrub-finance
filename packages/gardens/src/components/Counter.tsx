// @ts-ignore
import React, { useEffect, useRef } from "react";
import { animate, motion, useAnimation } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

// @ts-ignore
export function Counter({ from, to }) {
  const controls = useAnimation();
  const nodeRef = useRef();
  const MotionBox = motion<BoxProps>(Box);
  useEffect(() => {
    const controls = animate(from, to, {
      duration: 4,
      onUpdate(value) {
        // @ts-ignore
        nodeRef.current.textContent = value.toFixed(0);
      },
    });

    return () => controls.stop();
  }, [from, to]);

  // @ts-ignore
  return <MotionBox as="span" ref={nodeRef} />;
}
