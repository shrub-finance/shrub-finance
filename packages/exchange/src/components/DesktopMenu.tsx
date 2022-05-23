import {
  Badge,
  Box,
  HStack,
  Link,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as ReachLink } from "@reach/router";
import { ExchangeLogo } from "../assets/Icons";
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

  function handleGA(event: React.BaseSyntheticEvent) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }

  function handleMenuClose(event: React.BaseSyntheticEvent) {
    onMenuClose();
    handleGA(event);
  }

  return (
    <HStack spacing={8} alignItems={"center"}>
      <Link as={ReachLink} to={"/"}>
        <ExchangeLogo boxSize={10} />
      </Link>
      <HStack
        as={"nav"}
        spacing={"4"}
        fontSize={{ base: "xs", md: "xs", lg: "sm" }}
      >
        <Link
          isExternal
          href="https://shrub.finance"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          onClick={handleMenuClose}
          display={{ base: "none", md: "inline" }}
        >
          Shrub Main
        </Link>
        <Link
          isExternal
          href="https://gardens.shrub.finance"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          display={{ base: "none", md: "inline" }}
          onClick={handleMenuClose}
        >
          Paper Gardens
        </Link>
        <Link
          isExternal
          href="https://discord.gg/ntU4GhfEFP"
          variant="ghost"
          cursor="pointer"
          px={2}
          py={{ base: "3", md: "1", lg: "1" }}
          rounded={"lg"}
          _hover={{ textDecoration: "none", bgGradient: gradient }}
          display={{ base: "none", md: "inline" }}
          onClick={handleMenuClose}
        >
          Help
        </Link>
      </HStack>
    </HStack>
  );
}

export default DesktopMenu;
