import {ColorMode, extendTheme} from "@chakra-ui/react";
import {mode} from "@chakra-ui/theme-tools"

const config = extendTheme({
    initialColorMode: "dark" as ColorMode,
    useSystemColorMode: false,
    styles: {
        global: (props) => ({
            body: {
                fontFamily: "body",
                bg: mode("gray.50", "rgb(18, 18, 38)")(props),
            }
        }),
    },
    components: {
        Modal: {
            baseStyle: ({colorMode}) => ({
                dialog: {
                    color: colorMode === "dark" ? "white" : "rgb(31, 31, 65)",
                    bg: colorMode === "dark" ? "rgb(31, 31, 65)" : "white",
                    boxShadow: "rgb(33 35 74 / 80%) 0px 22px 48px -9px",
                }
            })
        }
    }
})

const theme = extendTheme(config);
export default theme;
