// theme.js

import { extendTheme } from "@chakra-ui/react";
import { ColorMode } from "@chakra-ui/color-mode/dist/types/color-mode.utils";

const config = {
  initialColorMode: "dark" as ColorMode,
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

export default theme;
