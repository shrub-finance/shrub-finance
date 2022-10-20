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
import { TxContext } from "./Store";
import { confirmingCount, TxStatusList } from "./TxMonitoring";
import { isMobile } from "react-device-detect";
import { trackEvent } from "../utils/handleGATracking";
import { Match } from "@reach/router";
import { Link as ReachLink } from "@reach/router";

function TopNav() {
  const DesktopMenu = React.lazy(() => import("./DesktopMenu"));
  const MobileMenu = React.lazy(() => import("./MobileMenu"));

  const rightCTA = useColorModeValue("blue", "yellow");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();

  const { colorMode, toggleColorMode } = useColorMode();

  const spinnerBg = useColorModeValue("black", "cyan.500");
  const { active, error: web3Error } = useConnectWallet();
  const { pendingTxs } = useContext(TxContext);
  const [pendingTxsState] = pendingTxs;
  const confirmingCountNumber = confirmingCount(pendingTxsState);
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

  function handleGA(event: any) {
    trackEvent({
      action: event.type,
      label: event.target.innerText,
    });
  }

  function handleToggleColorMode(event: any) {
    toggleColorMode();
    handleGA(event);
  }

  return (
    <Box position={"fixed"} top={"0"} w={"full"} zIndex={"overlay"}>
      <Box shadow={topNavShadow} bg={topNavBgColor} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Suspense fallback={<Box>…</Box>}>
            <DesktopMenu />
          </Suspense>

          <Flex alignItems={"center"}>
            <>
              {/*<BuyMatic />*/}
              <Match path="/">
                {(props) =>
                  props.match ? (
                    <>
                      <Link
                        pr={5}
                        fontSize={"sm"}
                        fontWeight={"extrabold"}
                        color={"green"}
                        href={"https://exchange.shrub.finance"}
                        isExternal
                      >
                        Buy MATIC
                      </Link>
                      {/*<Link*/}
                      {/*  pr={5}*/}
                      {/*  fontSize={"sm"}*/}
                      {/*  fontWeight={"bold"}*/}
                      {/*  color={rightCTA}*/}
                      {/*  href={"https://discord.gg/BpHuVCYtdB"}*/}
                      {/*  isExternal*/}
                      {/*>*/}
                      {/*  Join Discord*/}
                      {/*</Link>*/}
                      <Link
                        pr={5}
                        fontSize={"sm"}
                        fontWeight={"bold"}
                        color={rightCTA}
                        href={
                          "https://medium.com/@shrubfinance/shrub-roadmap-2022-b947b5ce1435"
                        }
                        isExternal
                      >
                        Roadmap
                      </Link>
                    </>
                  ) : (
                    <></>
                  )
                }
              </Match>

              <Match path="/">
                {(props) =>
                  props.match ? (
                    <></>
                  ) : (
                    <Box
                      pr={5}
                      display={{ base: "none", sm: "flex" }}
                      size={buttonSize}
                    >
                      {/*<Balance />*/}
                    </Box>
                  )
                }
              </Match>
            </>
            <Match path="/">
              {(props) =>
                props.match ? (
                  <></>
                ) : (
                  <Box onClick={onOpen}>
                    {/*connect wallet button*/}
                    <Button
                      variant={isMobile ? "outline" : "solid"}
                      colorScheme={web3Error ? "red" : "yellow"}
                      size={buttonSize}
                      mr={4}
                      borderRadius="xl"
                      leftIcon={
                        web3Error ? (
                          <InfoOutlineIcon color="red.400" />
                        ) : undefined
                      }
                    >
                      {" "}
                      {!!web3Error && !active ? (
                        getErrorMessage(web3Error).title
                      ) : confirmingCountNumber > 0 ? (
                        <>
                          <Spinner
                            thickness="1px"
                            speed="0.65s"
                            color={spinnerBg}
                            size="xs"
                            mr={2}
                          />
                          {confirmingCountNumber} Pending...
                        </>
                      ) : (
                        <Account />
                      )}
                    </Button>
                  </Box>
                )
              }
            </Match>
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

      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        motionPreset="slideInBottom"
        scrollBehavior={isMobile ? "inside" : "outside"}
      >
        <ModalOverlay />
        <ModalContent top="6rem" boxShadow="dark-lg" borderRadius="2xl">
          <ModalHeader>
            {!active ? (
              "Connect Wallet"
            ) : !isHidden ? (
              <Text fontSize={16}>Account Details</Text>
            ) : (
              <Button variant="ghost" onClick={() => displayStatus(false)}>
                Back
              </Button>
            )}{" "}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!active || isHidden ? (
              <ConnectWalletModal />
            ) : (
              !isHidden && <ConnectionStatus displayStatus={displayStatus} />
            )}
            {!(
              web3Error && getErrorMessage(web3Error).title === "Wrong Network"
            ) && <TxStatusList />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default TopNav;
