import {
  Box,
  Heading,
  Text,
  Button,
  Center,
  useColorModeValue,
  Container,
  ListItem,
  UnorderedList,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link as ReachLink, RouteComponentProps } from "@reach/router";
import React, { useState } from "react";
import { handleErrorMessagesFactory } from "../utils/handleErrorMessages";
import { isMobile } from "react-device-detect";
import Chapters from "../components/Chapters";
import PotSaleCountdown from "../components/PotSaleCountdown";

function HomeView(props: RouteComponentProps) {
  return <PotSaleCountdown />;
}

export default HomeView;
