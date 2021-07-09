import {ColorMode, extendTheme} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools"

const config = extendTheme({
    initialColorMode: "dark" as ColorMode,
    useSystemColorMode: false,
  styles: {
    global: (props) => ({
      body: {
        fontFamily: "body",
        // #2d2d2d
        // color: mode("gray.800", "#ccd6f6")(props),
        // color: mode("gray.800", "white")(props),
        bg: mode("gray.50", "rgb(18, 18, 38)")(props),
        // bg: mode("white", "#0a192f")(props),
        // bg: mode("white", "#121212")(props),
        // lineHeight: "base"
      }
    }),
  },
  components: {
    Modal: {
      baseStyle:({ colorMode }) => ({
        dialog: {
          // color: '#ccd6f6',
          color: colorMode === "dark" ? "white" : "rgb(31, 31, 65)",
          bg: colorMode === "dark" ? "rgb(31, 31, 65)" : "white",
          boxShadow: "rgb(33 35 74 / 80%) 0px 22px 48px -9px",
          // bg: '#112240',
          // bg: '#121212'
        }
      })
    }
  }
})

const theme = extendTheme(config);
export default theme;
