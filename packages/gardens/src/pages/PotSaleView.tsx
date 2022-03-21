import { RouteComponentProps } from "@reach/router";
import React from "react";
import PotSaleCountdown from "../components/PotSaleCountdown";

function PotSaleView(props: RouteComponentProps) {
  return <PotSaleCountdown />;
}

export default PotSaleView;
