import {
  Badge,
  Box,
  Link,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as ReachLink } from "@reach/router";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import React from "react";
import { trackEvent } from "../utils/handleGATracking";

// @ts-ignore
function MobileMenu({ onMenuClose }) {
  const gradient = useColorModeValue(
    "linear(to-r, gray.100, gray.200)",
    "linear(to-l, gray.700, gray.700)"
  );

  // const { onClose: onMenuClose } = useDisclosure();

  const { colorMode, toggleColorMode } = useColorMode();

  function handleGA(event: any) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }

  function handleClick(event: any) {
    onMenuClose();
    handleGA(event);
  }

  function handleToggleColorMode(event: any) {
    toggleColorMode();
    handleGA(event);
  }

  return (
    <Box pb={4} display={{ md: "none" }}>
      <Stack as={"nav"} spacing={3}>
        <Link
          href="https://shrub.finance"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={handleClick}
        >
          Shrub Main
        </Link>
        <Link
          href="https://gardens.shrub.finance"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={handleClick}
        >
          Paper Gardens
        </Link>
        <Box
          onClick={handleToggleColorMode}
          variant="ghost"
          cursor="pointer"
          rounded="lg"
          py={"3"}
          px={"2"}
          _hover={{
            textDecoration: "none",
            bgGradient: gradient,
          }}
        >
          {colorMode === "light" ? "Dark Mode" : "Light Mode"}
        </Box>
      </Stack>
    </Box>
  );
}

export default MobileMenu;
