import React from "react";
import OptionsView from "./OptionsView";
import { RouteComponentProps } from "@reach/router";

function HomeView(props: RouteComponentProps) {
  return (
    <>
      <OptionsView />
    </>
  );
}

export default HomeView;
