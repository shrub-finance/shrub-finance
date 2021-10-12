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
  ModalCloseButton, Spinner, Image
} from "@chakra-ui/react";
import {HamburgerIcon, CloseIcon, SunIcon, MoonIcon, InfoOutlineIcon, Icon} from '@chakra-ui/icons';
import { Link as ReachLink } from "@reach/router";
import {Account, Balance, ChainId, ConnectionStatus, ConnectWalletModal, getErrorMessage} from "./ConnectWallet";
import {useConnectWallet} from "../hooks/useConnectWallet";
import {ShrubLogo} from "../assets/Icons";
import {TxContext} from "./Store";
import {confirmingCount, TxStatusList} from "./TxMonitoring";
import {isMobile} from "react-device-detect";
import {GiCoins} from 'react-icons/gi';
import {FaFileContract} from 'react-icons/all';

function TopNav() {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const {active, error: web3Error} = useConnectWallet();
  const [isHidden, setIsHidden] = useState(false);
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState] = pendingTxs;
  const confirmingCountNumber = confirmingCount(pendingTxsState);
  const displayStatus = (val: boolean ) => {setIsHidden(val);}
  const gradient = useColorModeValue(
      "linear(to-r, gray.100, gray.200)",
      "linear(to-l, gray.700, gray.700)"
  );
  const topNavShadow = useColorModeValue("md", "md");
  const topNavBgColor = useColorModeValue("white", "shrub.100");

function handleModalClose() {
    onClose();
    displayStatus(false);
}

  const NavRoutes = [{item:'Shrubfolio', itemIcon:GiCoins}, {item:'Options', itemIcon: FaFileContract}];

  const NavRoute = ({ children, path, itemIcon }: { children: ReactNode, path: string, itemIcon?: any }) => (
      <Link px={2} py={{ base: "3", md: "1", lg: "1" }} rounded={"lg"}
          _hover={{textDecoration: "none", bgGradient: gradient}}
          as={ReachLink} to={path.toLowerCase()} onClick={onMenuClose}>
        {children}
      </Link>
);


  return (
    <Box>
      <Box
          shadow={topNavShadow}
          bg={topNavBgColor}
          px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8} alignItems={"center"}>
            <Link as={ReachLink} to={'/'} >
              <ShrubLogo boxSize={10}/>
            </Link>
            <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
              {NavRoutes.map((route) => (
                  <NavRoute itemIcon={route.itemIcon} key={route.item} path={route.item}>
                   {route.item}
                  </NavRoute>))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            {!isMobile && <Box pr={5} display={{ base: "none", sm: "flex" }}><Balance/></Box>}
            {!isMobile && <Box display={{ base: "none", sm: "flex" }}><ChainId/></Box>}
            <Box onClick={onOpen}
                 mr={isMobile ? '19.5': '0'}
            >
              <Button variant={"outline"} colorScheme={!!web3Error ? "red":"teal"}
                  size={"md"} mr={4} borderRadius="full" leftIcon={!!web3Error ?
                    <InfoOutlineIcon colorScheme="red"/> : undefined}> {!!web3Error && !active ?
                    getErrorMessage(web3Error).title :
                      confirmingCountNumber > 0 ?
                        <><Spinner thickness="1px" speed="0.65s" color="cyan.500" size="xs" mr={2} />
                          {confirmingCountNumber} Pending...</> :
                        <Account/>}
              </Button>
            </Box>
            <IconButton variant="unstyled"
            icon={isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"} display={{ md: "none" }}
            onClick={isMenuOpen ? onMenuClose : onMenuOpen}/>

            {!isMobile && <Button onClick={toggleColorMode} variant="ghost" display={{ base: "none", md: "block" }}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>}
          </Flex>
        </Flex>

        {
          isMenuOpen ? (
            <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={3}>
                {NavRoutes.map((route) =>
                (<NavRoute itemIcon={route.itemIcon} key={route.item} path={route.item}>
                  <Icon as={route.itemIcon} mr={2} /> {route.item}
                </NavRoute>))}
              <Box
                   onClick={toggleColorMode}
                   variant="ghost"
                   cursor="pointer"
                   rounded="lg"
                   py={'3'}
                   px={'2'}
                   _hover={{
                     textDecoration: "none",
                     bgGradient: gradient
                   }}>
                {colorMode === "light" ? <MoonIcon mr={'2'}/> : <SunIcon mr={'2'}/>}
                {colorMode === "light" ? 'Dark Mode' : 'Light Mode'}
              </Box>
            </Stack>
            </Box>
        ) : null
        }
      </Box>

      <Modal isOpen={isOpen} onClose={handleModalClose} motionPreset="slideInBottom" scrollBehavior={isMobile ?"inside" : "outside"}>
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
