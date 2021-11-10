import {  extendTheme, ThemeConfig} from "@chakra-ui/react";
import {mode} from "@chakra-ui/theme-tools"

const config: ThemeConfig  = extendTheme({
    initialColorMode: "dark",
    useSystemColorMode: false,
})

const components =  {
    Modal: {
        baseStyle: (props: any) => ({
            dialog: {
                color: mode("shrub.100", "white")(props),
                bg: mode("white", "shrub.100")(props),
                boxShadow: "rgb(33 35 74 / 80%) 0px 22px 48px -9px",
            }
        })
    },
    Alert: {
        variants: {
            shrubSolid: {
                container: {
                    bg: "yellow.100",
                    color: "black"
                }
            }
        }
    }
}

const fonts = {
        heading: "Montserrat",
        body: "Montserrat",
    }

 const  styles =  {
         global: (props: any) => ({
             body: {
                 fontFamily: "body",
                 bg: mode("gray.50", "shrub.200")(props),
             }
         }),
     }

const colors = {
    shrub: {
        100: "rgb(31, 31, 65)",
            200: "rgb(18, 18, 38)", // base
            300: "rgb(21, 21, 38)"
    },
    bud: {
        100: "#64A66A"
    }
}

const theme = extendTheme({config, components, styles, fonts, colors});
export default theme;
