import {
  Avatar,
  Box,
  chakra,
  Container,
  Flex,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Stack,
  Text,
  HStack,
  VStack,
} from "@chakra-ui/react";

const testimonials = [
  {
    content:
      "Wyre has been powering Shrub Exchange allowing me to buy MATIC assets through an easy to use fiat gateway. The speed at which I have been able to exchange my USD for MATIC and the low cost associated with my debit card payment method has made it a prime choice for me to fund my NFT activities without having to leave the Shrub platform. Thank you for making things easy and seamless, making my user experience exquisite.It really saves me time and effort. It is exactly what our business has been lacking. EEZY is the most valuable business resource we have EVER purchased. After using EEZY my business skyrocketed!",
    icon: "User-avatar.svg",
  },
  {
    content:
      "Using Wyre with Apple Pay is a super fast and super convenient way to buy crypto with a click of a button. The most complicated aspect of it is deciding how much crypto I want/need to purchase.",
    icon: "User-avatar.svg",
  },
  {
    content:
      "By far and away the easiest and cheapest way I've ever gotten MATIC. I used to buy it on Coinbase, send it to my MetaMask, and then use a bridge 😬",
    icon: "User-avatar.svg",
  },
];

const backgrounds = [
  `url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='560' height='185' viewBox='0 0 560 185' fill='none'%3E%3Cellipse cx='102.633' cy='61.0737' rx='102.633' ry='61.0737' fill='%23ED64A6' /%3E%3Cellipse cx='399.573' cy='123.926' rx='102.633' ry='61.0737' fill='%23F56565' /%3E%3Cellipse cx='366.192' cy='73.2292' rx='193.808' ry='73.2292' fill='%2338B2AC' /%3E%3Cellipse cx='222.705' cy='110.585' rx='193.808' ry='73.2292' fill='%23ED8936' /%3E%3C/svg%3E")`,
  `url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='560' height='185' viewBox='0 0 560 185' fill='none'%3E%3Cellipse cx='457.367' cy='123.926' rx='102.633' ry='61.0737' transform='rotate(-180 457.367 123.926)' fill='%23ED8936'/%3E%3Cellipse cx='160.427' cy='61.0737' rx='102.633' ry='61.0737' transform='rotate(-180 160.427 61.0737)' fill='%2348BB78'/%3E%3Cellipse cx='193.808' cy='111.771' rx='193.808' ry='73.2292' transform='rotate(-180 193.808 111.771)' fill='%230BC5EA'/%3E%3Cellipse cx='337.295' cy='74.415' rx='193.808' ry='73.2292' transform='rotate(-180 337.295 74.415)' fill='%23ED64A6'/%3E%3C/svg%3E")`,
  `url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='560' height='185' viewBox='0 0 560 185' fill='none'%3E%3Cellipse cx='102.633' cy='61.0737' rx='102.633' ry='61.0737' fill='%23ED8936'/%3E%3Cellipse cx='399.573' cy='123.926' rx='102.633' ry='61.0737' fill='%2348BB78'/%3E%3Cellipse cx='366.192' cy='73.2292' rx='193.808' ry='73.2292' fill='%230BC5EA'/%3E%3Cellipse cx='222.705' cy='110.585' rx='193.808' ry='73.2292' fill='%23ED64A6'/%3E%3C/svg%3E")`,
];

function Testimonials() {
  const testimonialsCardVarticle = testimonials.map((element, index) => {
    return (
      <SimpleGrid mb={10}>
        <Flex
          boxShadow={"lg"}
          maxW={"640px"}
          direction={{ base: "column-reverse", md: "row" }}
          width={"full"}
          rounded={"xl"}
          p={10}
          justifyContent={"space-between"}
          position={"relative"}
          bg={useColorModeValue("white", "gray.800")}
          _after={{
            content: '""',
            position: "absolute",
            height: "21px",
            width: "29px",
            left: "35px",
            top: "-10px",
            backgroundSize: "cover",
            backgroundImage: `url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='29' height='21' viewBox='0 0 29 21' fill='none'%3E%3Cpath d='M6.91391 21C4.56659 21 2.81678 20.2152 1.66446 18.6455C0.55482 17.0758 0 15.2515 0 13.1727C0 11.2636 0.405445 9.43939 1.21634 7.7C2.0699 5.91818 3.15821 4.3697 4.48124 3.05454C5.84695 1.69697 7.31935 0.678787 8.89845 0L13.3157 3.24545C11.5659 3.96667 9.98676 4.94242 8.57837 6.17273C7.21266 7.36061 6.25239 8.63333 5.69757 9.99091L6.01766 10.1818C6.27373 10.0121 6.55114 9.88485 6.84989 9.8C7.19132 9.71515 7.63944 9.67273 8.19426 9.67273C9.34658 9.67273 10.4776 10.097 11.5872 10.9455C12.7395 11.7939 13.3157 13.1091 13.3157 14.8909C13.3157 16.8848 12.6542 18.4121 11.3311 19.4727C10.0508 20.4909 8.57837 21 6.91391 21ZM22.5982 21C20.2509 21 18.5011 20.2152 17.3488 18.6455C16.2391 17.0758 15.6843 15.2515 15.6843 13.1727C15.6843 11.2636 16.0898 9.43939 16.9007 7.7C17.7542 5.91818 18.8425 4.3697 20.1656 3.05454C21.5313 1.69697 23.0037 0.678787 24.5828 0L29 3.24545C27.2502 3.96667 25.6711 4.94242 24.2627 6.17273C22.897 7.36061 21.9367 8.63333 21.3819 9.99091L21.702 10.1818C21.9581 10.0121 22.2355 9.88485 22.5342 9.8C22.8756 9.71515 23.3238 9.67273 23.8786 9.67273C25.0309 9.67273 26.1619 10.097 27.2715 10.9455C28.4238 11.7939 29 13.1091 29 14.8909C29 16.8848 28.3385 18.4121 27.0155 19.4727C25.7351 20.4909 24.2627 21 22.5982 21Z' fill='%239F7AEA'/%3E%3C/svg%3E")`,
          }}
          _before={{
            content: '""',
            position: "absolute",
            zIndex: "-1",
            height: "full",
            maxW: "640px",
            width: "full",
            filter: "blur(40px)",
            transform: "scale(0.98)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            top: 0,
            left: 0,
            backgroundImage: backgrounds[index % 4],
          }}
        >
          <Flex
            direction={"column"}
            textAlign={"left"}
            justifyContent={"space-between"}
          >
            <chakra.p
              fontFamily={"Inter"}
              fontWeight={"medium"}
              fontSize={"15px"}
              pb={4}
            >
              {element.content}
            </chakra.p>
          </Flex>
        </Flex>
      </SimpleGrid>
    );
  });
  const testimonialsCard = testimonials.map((element, index) => {
    return (
      <Box>
        <Container
          alignItems="center"
          maxW={"7xl"}
          py={16}
          as={Stack}
          spacing={12}
        >
          <Box
            bg={useColorModeValue("white", "gray.800")}
            boxShadow={"lg"}
            p={8}
            height={370}
            rounded={"xl"}
            align={"left"}
            pos={"relative"}
            _after={{
              content: `""`,
              w: 0,
              h: 0,
              borderLeft: "solid transparent",
              borderLeftWidth: 16,
              borderRight: "solid transparent",
              borderRightWidth: 16,
              borderTop: "solid",
              borderTopWidth: 16,
              borderTopColor: useColorModeValue("white", "gray.800"),
              pos: "absolute",
              bottom: "-16px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Text
              textAlign={"left"}
              color={useColorModeValue("gray.600", "gray.400")}
              fontSize={12}
            >
              {element.content}
            </Text>
          </Box>
          <Avatar src={element.icon} mb={2} />
        </Container>
      </Box>
    );
  });
  return (
    <VStack>
      <HStack>{testimonialsCard}</HStack>
      {testimonialsCardVarticle}
    </VStack>
  );
}

export default Testimonials;
