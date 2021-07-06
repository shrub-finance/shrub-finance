import {extendTheme} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools"

const config = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        fontFamily: "body",
        color: mode("gray.800", "whiteAlpha.900")(props),
        bg: mode("white", "hsl(207deg 86% 4%)")(props),
        lineHeight: "base",
      },
    }),
  },
  components: {
    Modal: {
      baseStyle: {
        bg: "rgb(1, 22, 39)", // Normally, it is "semibold"
      },
    }
  }
})

const theme = extendTheme(config);
export default theme;
