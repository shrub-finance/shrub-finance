import React, { Suspense, useContext, useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  useBreakpointValue,
  Link,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import {
  Account,
  Balance,
  ConnectionStatus,
  ConnectWalletModal,
  getErrorMessage,
} from "./ConnectWallet";
import BuyMatic from "./BuyMatic";
import { useConnectWallet } from "../hooks/useConnectWallet";
import { isMobile } from "react-device-detect";
import { trackEvent } from "../utils/handleGATracking";

function TopNav() {
  const DesktopMenu = React.lazy(() => import("./DesktopMenu"));
  const MobileMenu = React.lazy(() => import("./MobileMenu"));

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();

  const { colorMode, toggleColorMode } = useColorMode();

  const spinnerBg = useColorModeValue("black", "cyan.500");
  const { active, error: web3Error } = useConnectWallet();
  const displayStatus = (val: boolean) => {
    setIsHidden(val);
  };
  const [isHidden, setIsHidden] = useState(false);
  const gradient = useColorModeValue(
    "linear(to-r, gray.100, gray.200)",
    "linear(to-l, gray.700, gray.700)"
  );
  const topNavShadow = useColorModeValue("md", "md");
  const topNavBgColor = useColorModeValue("white", "dark.100");
  useColorModeValue("sprout", "teal");

  const buttonSize = useBreakpointValue({
    base: "sm",
    md: "sm",
    lg: "md",
  });

  function handleModalClose() {
    onClose();
    displayStatus(false);
  }

  function handleGA(event: React.BaseSyntheticEvent) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }

  function handleToggleColorMode(event: React.BaseSyntheticEvent) {
    toggleColorMode();
    handleGA(event);
  }

  return (
    <>
      <Box position={"fixed"} top={"0"} w={"full"} zIndex={"overlay"}>
        <Box layerStyle={"bannerBg"} textStyle={"bannerText"}>
          Buy MATIC service is currently unavailable. We are actively working
          with Wyre to get this resolved. Please check back later.
          {/*   🎉 {!isMobile ? "Shrub's Genesis NFT Sale is live!" : ""}      */}
        </Box>

        {/*<Box layerStyle={"bannerBg"} textStyle={"bannerText"}>*/}
        {/*  🎉 {!isMobile ? "Shrub's Genesis NFT Sale is live!" : ""}*/}
        {/*  🎉 {!isMobile ? "Shrub's Genesis NFT Sale is live!" : ""}*/}

        {/*  <Link*/}
        {/*    href="https://gardens.shrub.finance/mint"*/}
        {/*    isExternal*/}
        {/*    cursor="pointer"*/}
        {/*    textDecoration="underline"*/}
        {/*    pl={2}*/}
        {/*    // @ts-ignore*/}
        {/*    onClick={handleGA}*/}
        {/*  >*/}
        {/*    {!isMobile ? "Mint Now" : "Shrub's Genesis NFT Sale is live!  "}*/}
        {/*  </Link>*/}
        {/*</Box>*/}
        <Box shadow={topNavShadow} bg={topNavBgColor} px={4} m={"-11px"}>
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <Suspense fallback={<Box>…</Box>}>
              <DesktopMenu />
            </Suspense>

            <Flex alignItems={"center"}>
              <>
                <BuyMatic />
                {/*<Box*/}
                {/*  pr={5}*/}
                {/*  display={{ base: "none", sm: "flex" }}*/}
                {/*  size={buttonSize}*/}
                {/*>*/}
                {/*  <Balance />*/}
                {/*</Box>*/}
              </>

              {/*<Box onClick={onOpen}>*/}
              {/*  /!*connect wallet button*!/*/}
              {/*  <Button*/}
              {/*    variant={isMobile ? "outline" : "solid"}*/}
              {/*    colorScheme={web3Error ? "red" : "yellow"}*/}
              {/*    size={buttonSize}*/}
              {/*    mr={4}*/}
              {/*    borderRadius="xl"*/}
              {/*    leftIcon={*/}
              {/*      web3Error ? (*/}
              {/*        <InfoOutlineIcon colorScheme="red" />*/}
              {/*      ) : undefined*/}
              {/*    }*/}
              {/*  >*/}
              {/*    {" "}*/}
              {/*    {!!web3Error && !active ? (*/}
              {/*      getErrorMessage(web3Error).title*/}
              {/*    ) : (*/}
              {/*      <Account />*/}
              {/*    )}*/}
              {/*  </Button>*/}
              {/*</Box>*/}
              <IconButton
                variant="unstyled"
                icon={isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
                aria-label={"Open Menu"}
                display={{ md: "none" }}
                onClick={isMenuOpen ? onMenuClose : onMenuOpen}
              />
              {!isMobile && (
                <Button
                  onClick={handleToggleColorMode}
                  variant="ghost"
                  display={{ base: "none", md: "block" }}
                >
                  {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>
              )}
            </Flex>
          </Flex>

          {isMenuOpen ? (
            <Suspense fallback={<Box>…</Box>}>
              <MobileMenu onMenuClose={onMenuClose} />
            </Suspense>
          ) : null}
        </Box>

        {/*<Modal*/}
        {/*  isOpen={isOpen}*/}
        {/*  onClose={handleModalClose}*/}
        {/*  motionPreset="slideInBottom"*/}
        {/*  scrollBehavior={isMobile ? "inside" : "outside"}*/}
        {/*>*/}
        {/*  <ModalOverlay />*/}
        {/*  <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">*/}
        {/*    <ModalHeader>*/}
        {/*      {!active ? (*/}
        {/*        "Connect Wallet"*/}
        {/*      ) : !isHidden ? (*/}
        {/*        <Text fontSize={16}>Account Details</Text>*/}
        {/*      ) : (*/}
        {/*        <Button variant="ghost" onClick={() => displayStatus(false)}>*/}
        {/*          Back*/}
        {/*        </Button>*/}
        {/*      )}{" "}*/}
        {/*    </ModalHeader>*/}
        {/*    <ModalCloseButton />*/}
        {/*    <ModalBody>*/}
        {/*      {!active || isHidden ? (*/}
        {/*        <ConnectWalletModal />*/}
        {/*      ) : (*/}
        {/*        !isHidden && <ConnectionStatus displayStatus={displayStatus} />*/}
        {/*      )}*/}
        {/*      {*/}
        {/*        !(*/}
        {/*          web3Error &&*/}
        {/*          getErrorMessage(web3Error).title === "Wrong Network"*/}
        {/*        )*/}
        {/*      }*/}
        {/*    </ModalBody>*/}
        {/*  </ModalContent>*/}
        {/*</Modal>*/}
      </Box>
    </>
  );
}

export default TopNav;
