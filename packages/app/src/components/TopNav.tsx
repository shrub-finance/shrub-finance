import React, {ReactNode, useContext, useState} from "react";
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
  ModalCloseButton, Spinner
} from "@chakra-ui/react";
import {HamburgerIcon, CloseIcon, SunIcon, MoonIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import { Link as ReachLink } from "@reach/router";
import {Account, Balance, ChainId, ConnectionStatus, ConnectWalletModal, getErrorMessage} from "./ConnectWallet";
import {useConnectWallet} from "../hooks/useConnectWallet";
import {HelloBud} from "../assets/Icons";
import {TxContext} from "./Store";
import {confirmingCount, TxStatusList} from "./TxMonitoring";
import {isMobile} from "react-device-detect";


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

const NavRoutes = ["Shrubfolio", "Options"];
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
  const {active, error: web3Error} = useConnectWallet();
  const [isHidden, setIsHidden] = useState(false);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState] = pendingTxs;
  const confirmingCountNumber = confirmingCount(pendingTxsState);
  const displayStatus = (val: boolean ) => {
    setIsHidden(val);
  }
function handleModalClose() {
    onClose();
    displayStatus(false);
}
  return (
    <Box>

      <Box
          shadow={useColorModeValue("md", "md")}
          bg={useColorModeValue("white", "shrub.100")}
          px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"} display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
              {NavLinks.map((link) => (<NavLink key={link}><HelloBud boxSize={10}/></NavLink>))}
              {NavRoutes.map((route) => (<NavRoute key={route} path={route}>{route}</NavRoute>))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Box pr={5}><Balance/></Box>
            <Box><ChainId/></Box>
            <Box onClick={onOpen}>
              <Button variant={"outline"} colorScheme={!!web3Error ? "red":"teal"}
                  size={"md"} mr={4} borderRadius="full" leftIcon={!!web3Error ?
                    <InfoOutlineIcon colorScheme="red"/> : undefined}> {!!web3Error && !active ?
                    getErrorMessage(web3Error).title :
                      confirmingCountNumber > 0 ?
                        <><Spinner thickness="1px" speed="0.65s" color="cyan.500" size="xs" mr={2} /> {confirmingCountNumber} Pending...</> :
                        <Account/>}
              </Button>
            </Box>
            <Button onClick={toggleColorMode} variant="ghost">
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Flex>
        </Flex>

        {isOpen ? (<Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>{NavLinks.map((link) => (<NavLink key={link}>{link}</NavLink>))}</Stack></Box>) : null}</Box>

      <Modal isOpen={isOpen} onClose={handleModalClose} motionPreset="slideInBottom"
             scrollBehavior={isMobile ?"inside" : "outside"}
      >
        <ModalOverlay />
        <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">
          <ModalHeader>{ !active ? 'Connect Wallet' :
              !isHidden ? <Text fontSize={16}>Account Details</Text>:
            <Button variant="ghost" onClick={() => displayStatus(false)}>Back</Button>
          } </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!active || isHidden? <ConnectWalletModal/> : !isHidden &&<ConnectionStatus displayStatus={displayStatus}/>}
            <TxStatusList/>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default TopNav;
