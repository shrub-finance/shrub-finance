import {ColorMode, extendTheme} from "@chakra-ui/react";
import {mode} from "@chakra-ui/theme-tools"

const config = extendTheme({
    initialColorMode: "dark" as ColorMode,
    useSystemColorMode: false,
    fonts: {
        heading: "Montserrat",
        body: "Montserrat",
    },
    colors: {
        shrub: {
            100: "rgb(31, 31, 65)",
            200: "rgb(18, 18, 38)", // base
            300: "rgb(21, 21, 38)"
        },
        bud: {
            100: "#64A66A"
        }
    },
    styles: {
        global: (props) => ({
            body: {
                fontFamily: "body",
                bg: mode("gray.50", "shrub.200")(props),
            }
        }),
    },
    components: {
        Modal: {
            baseStyle: ({colorMode}) => ({
                dialog: {
                    color: colorMode === "dark" ? "white" : "shrub.100",
                    bg: colorMode === "dark" ? "shrub.100" : "white",
                    boxShadow: "rgb(33 35 74 / 80%) 0px 22px 48px -9px",
                }
            })
        }
    }
})

const theme = extendTheme(config);
export default theme;
