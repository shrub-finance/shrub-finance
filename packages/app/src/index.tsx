import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./styles/theme";
// import "@fontsource/montserrat/100.css";
// import "@fontsource/montserrat/200.css";
// import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";
// import "@fontsource/montserrat/500.css";
// import "@fontsource/montserrat/600.css";
// import "@fontsource/montserrat/700.css";
// import "@fontsource/montserrat/800.css";
// import "@fontsource/montserrat/900.css";
import "focus-visible/dist/focus-visible";
import { Global, css } from '@emotion/react';

const GlobalStyles = css`
  /*
    Hide the focus indicator if the element receives focus via the mouse,
    keep it for keyboard focus.
  */
  .js-focus-visible :focus:not([data-focus-visible-added]) {
     outline: none;
     box-shadow: none;
   }
`;

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Global styles={GlobalStyles} />
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
