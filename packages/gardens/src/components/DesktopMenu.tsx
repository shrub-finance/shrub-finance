import {
  Badge,
  Box,
  HStack,
  Link,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as ReachLink } from "@reach/router";
import { PaperGardensLogo } from "../assets/Icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import React from "react";
import { trackEvent } from "../utils/handleGATracking";

function DesktopMenu() {
  const gradient = useColorModeValue(
    "linear(to-r, gray.100, gray.200)",
    "linear(to-l, gray.700, gray.700)"
  );

  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();

  function handleGA(event: any) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }

  return (
    <HStack spacing={8} alignItems={"center"}>
      <Link as={ReachLink} to={"/"}>
        <PaperGardensLogo boxSize={10} />
      </Link>
      <HStack
        as={"nav"}
        spacing={"4"}
        display={{ base: "none", md: "inline" }}
        fontSize={{ base: "xs", md: "xs", lg: "sm" }}
      >
        <Link
          as={ReachLink}
          to="/my-garden"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={handleGA}
        >
          My Garden
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
          onClick={handleGA}
        >
          Leaderboard
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
        >
          Chapters
        </Link>
        {/*<Link*/}
        {/*  as={ReachLink}*/}
        {/*  to="/adoption"*/}
        {/*  variant="ghost"*/}
        {/*  cursor="pointer"*/}
        {/*  px={2}*/}
        {/*  py={{ base: "3", md: "1", lg: "1" }}*/}
        {/*  rounded={"lg"}*/}
        {/*  _hover={{ textDecoration: "none", bgGradient: gradient }}*/}
        {/*  onClick={handleGA}*/}
        {/*  display={{ md: "none", lg: "none", xl: "inline" }}*/}
        {/*>*/}
        {/*  Adoption*/}
        {/*</Link>*/}
        <Link
          as={ReachLink}
          to="/opensea"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={handleGA}
        >
          OpenSea
        </Link>
        {/* <Link
          href="https://opensea.io/collection/shrub-paper-gardens"
          isExternal
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={handleGA}
        >
          <Box as={"span"} whiteSpace={"nowrap"}>
            OpenSea
          </Box>
        </Link> */}
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
          display={{ md: "none", lg: "none", xl: "inline" }}
        >
          Blog
        </Link>
      </HStack>
    </HStack>
  );
}

export default DesktopMenu;
