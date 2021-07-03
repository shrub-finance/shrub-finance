import React, { ReactNode } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import { Link as ReachLink } from "@reach/router";
import ConnectWalletsView, {Account} from "./ConnectWallet";
import {useConnectWallet} from "../hooks/useConnectWallet";

const NavLinks = ["Shrub"];
const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={"/"}
  >
    {children}
  </Link>
);

const NavRoutes = ["Positions", "Options"];
const NavRoute = ({ children, path }: { children: ReactNode, path: string }) => (
    <Link
        px={2}
        py={1}
        rounded={"md"}
        _hover={{
          textDecoration: "none",
          bg: useColorModeValue("gray.200", "gray.700"),
        }}
        as={ReachLink}
        to={path.toLowerCase()}
    >
      {children}
    </Link>
);

function TopNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  useConnectWallet();
  return (
    <Box fontFamily="Montserrat">
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {NavLinks.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
              {NavRoutes.map((route) => (
                  <NavRoute key={route} path={route}>{route}</NavRoute>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Box onClick={onOpen}>
              <Account/>
            </Box>
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {NavLinks.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="15">
          <ModalHeader>
            <Text fontSize={20}>Connect to a wallet</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ConnectWalletsView />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default TopNav;
