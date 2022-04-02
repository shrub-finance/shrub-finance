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

function MobileMenu() {
  const gradient = useColorModeValue(
    "linear(to-r, gray.100, gray.200)",
    "linear(to-l, gray.700, gray.700)"
  );

  const { onClose: onMenuClose } = useDisclosure();

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box pb={4} display={{ md: "none" }}>
      <Stack as={"nav"} spacing={3}>
        <Link
          as={ReachLink}
          to="/my-garden"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={onMenuClose}
        >
          My Garden
        </Link>
        <Link
          as={ReachLink}
          to="/chapters"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={onMenuClose}
        >
          {" "}
          Chapters
        </Link>
        <Link
          as={ReachLink}
          to="/adoption"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={onMenuClose}
        >
          Adoption
        </Link>
        <Link
          as={ReachLink}
          to="/leaderboard"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={onMenuClose}
        >
          Leaderboard
        </Link>
        <Link
          href="https://shrub.finance/roadmap"
          isExternal
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
        >
          Roadmap
          <ExternalLinkIcon
            mx="2px"
            display={{ base: "inline", md: "none", lg: "inline" }}
          />
        </Link>
        <Link
          href="https://opensea.io/collection/shrub-paper-gardens"
          isExternal
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
          OpenSea <ExternalLinkIcon mx="2px" />
        </Link>
        <Link
          isExternal
          href="https://medium.com/@shrubfinance"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={onMenuClose}
        >
          Blog{" "}
          <ExternalLinkIcon
            mx="2px"
            display={{ base: "inline", md: "none", lg: "inline" }}
          />
        </Link>
        <Box
          onClick={toggleColorMode}
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
