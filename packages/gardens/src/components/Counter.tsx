import React, { useEffect, useRef } from "react";
import { animate, motion, useAnimation } from "framer-motion";
import { Box, BoxProps } from "@chakra-ui/react";

export function Counter({
  from,
  to,
  duration,
}: {
  from: number;
  to: number;
  duration: number;
}) {
  const controls = useAnimation();
  const nodeRef = useRef();
  const MotionBox = motion<BoxProps>(Box);
  useEffect(() => {
    const controls = animate(from, to, {
      duration: duration,
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
