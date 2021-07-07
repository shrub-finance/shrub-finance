import {ColorMode, extendTheme} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools"

const config = extendTheme({
    initialColorMode: "dark" as ColorMode,
    useSystemColorMode: false,
  // styles: {
  //   global: (props) => ({
  //     body: {
  //       fontFamily: "body",
  //       // color: mode("gray.800", "#ccd6f6")(props),
  //       // color: mode("gray.800", "white")(props),
  //       // bg: mode("white", "hsl(207deg 86% 4%)")(props),
  //       // bg: mode("white", "#0a192f")(props),
  //       // bg: mode("white", "#121212")(props),
  //       // lineHeight: "base"
  //     }
  //   }),
  // },
  // components: {
  //   Modal: {
  //     baseStyle: {
  //       dialog: {
  //         // color: '#ccd6f6',
  //         color: 'white',
  //         // bg: 'hsl(207deg 86% 4%)',
  //         // bg: '#112240',
  //         bg: '#121212'
  //       }
  //     }
  //   }
  // }
})

const theme = extendTheme(config);
export default theme;
