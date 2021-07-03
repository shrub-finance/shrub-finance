// theme.js

import { ColorMode } from "@chakra-ui/color-mode/dist/types/color-mode.utils";
import {extendTheme} from "@chakra-ui/react";

const config = {
  initialColorMode: "dark" as ColorMode,
  useSystemColorMode: false

};

const theme = extendTheme({ config });
export default theme;
