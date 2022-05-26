import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  useDisclosure,
  Text,
  HStack,
  VStack,
  useColorModeValue,
  Box,
  Stack,
} from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";

function ProfitLossChart(props: any) {
  const strickValue = props.strickRate;
  const premium = props.premium;
  const cancelRef = useRef();
  const intervalRef = useRef(0);
  const maxProfit = Number(((strickValue - premium) * 100).toFixed(2));
  const loss = Number((premium * 100).toFixed(2));
  const [buttonDisable, setButtonDisable] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const {
    isOpen: isOpenChart,
    onOpen: onOpenChart,
    onClose: onCloseChart,
  } = useDisclosure();
  const btnBg = useColorModeValue("sprout", "teal");
  const divider = props.optionType === "CALL" ? 10 : 30;
  const maxCost = props.optionType === "CALL" ? loss : maxProfit;
  const scaleForlosstoZero = Number((maxCost / divider).toFixed(4));
  const valueXscale = Number((premium / 10).toFixed(2));
  const [statusOption, setStatusOption] = useState(maxCost);
  const lineupdate = useRef(0);
  let breakEven: number;
  let yScale = [6, 4, 2, 0, -2, -2, -2];
  breakEven = Number(strickValue) - Number(premium);
  const scaleForLoss = Number((loss / 10).toFixed(4));
  const counterInitial = props.optionType === "CALL" ? loss : maxProfit;
  const [counter, setCounter] = useState(counterInitial);
  if (props.optionType === "CALL") {
    breakEven = Number(strickValue) + Number(premium);
    yScale = [-2, -2, -2, 0, 2, 4, 6];
  }
  const xScale: number[] = [
    Number((breakEven - 3).toFixed(4)),
    Number((breakEven - 2).toFixed(4)),
    Number((breakEven - 1).toFixed(4)),
    Number(breakEven.toFixed(4)),
    Number((breakEven + 1).toFixed(4)),
    Number((breakEven + 2).toFixed(4)),
    Number((breakEven + 3).toFixed(4)),
  ];
  const initRef =
    props.optionType === "CALL"
      ? Number(xScale[1].toFixed(4))
      : Number(xScale[0].toFixed(4));
  const [referenceLine, setReferenceLine] = useState(initRef);
  console.log("initRef", initRef);
  const onClickHandle = () => {
    setShowChart(true);
    setButtonDisable(true);
    const setIntervalTime = window.setInterval(() => {
      intervalRef.current = setIntervalTime;
      setReferenceLine((preValue) => preValue + 0.1);
      if (props.optionType === "CALL") {
        if (
          Number(lineupdate.current.toFixed(4)) >= xScale[2] &&
          Number(lineupdate.current.toFixed(4)) <= xScale[3] &&
          counter >= 0
        ) {
          setCounter((preValue) => preValue - scaleForlosstoZero);
        }
        if (Number(lineupdate.current.toFixed(4)) > xScale[3]) {
          setCounter((preValue) => {
            let valueDucate = Number(scaleForlosstoZero.toFixed(2));
            if (valueDucate === 0) {
              valueDucate = 1;
            }

            return Number(preValue + valueDucate);
          });
        }
      } else {
        if (Number(lineupdate.current.toFixed(4)) <= xScale[3]) {
          if (Number(lineupdate.current.toFixed(4)) === xScale[3]) {
            setCounter((preValue) => 0);
          }
          setCounter((preValue) => preValue - scaleForlosstoZero);
        }
        if (Number(lineupdate.current.toFixed(4)) > xScale[3]) {
          setCounter((preValue) => preValue + scaleForLoss);
        }
      }

      if (props.optionType === "CALL") {
        if (lineupdate.current >= xScale[5]) {
          clearInterval(intervalRef.current);
          setShowChart(false);
          setButtonDisable(false);
          setReferenceLine(initRef);
          lineupdate.current = initRef;
          setCounter(counterInitial);
        }
      } else {
        if (lineupdate.current >= xScale[4]) {
          clearInterval(intervalRef.current);
          setShowChart(false);
          setButtonDisable(false);
          setReferenceLine(initRef);
          lineupdate.current = initRef;
          setCounter(counterInitial);
        }
      }
    }, 100);
  };


  const data = [
    {
      name: xScale[0],
      uv: yScale[0],
    },
    {
      name: xScale[1],
      uv: yScale[1],
    },
    {
      name: xScale[2],
      uv: yScale[2],
    },
    {
      name: xScale[3],
      uv: yScale[3],
    },
    {
      name: xScale[4],
      uv: yScale[4],
    },
    {
      name: xScale[5],
      uv: yScale[5],
    },
    {
      name: xScale[6],
      uv: yScale[6],
    },
  ];

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.uv));
    const dataMin = Math.min(...data.map((i) => i.uv));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  useEffect(() => {
    lineupdate.current = referenceLine;
  }, [referenceLine]);

  return (
    <>
      <Box>
        <VStack>
          {props.optionType === "CALL" ? (
            lineupdate.current <= xScale[1] ? (
              <VStack spacing={1} fontSize={"sm"}>
                <HStack spacing={10} alignItems={"flex-start"}>
                  <Text color="white" fontSize={10} letterSpacing={0.01}>
                    Max Profit
                  </Text>
                  <Text color="white" fontSize={10} letterSpacing={0.1}>

                    BreakEven

                  </Text>
                  <Text color="white" fontSize={10} letterSpacing={0.1}>
                    Max Loss
                  </Text>
                </HStack>
                <HStack spacing="14" alignItems="Center">
                  <Text color="white" fontSize={10} letterSpacing={0.01}>

                    UNLimited
                  </Text>
                  <Text color="white" fontSize={10} letterSpacing={0.01}>
                    {breakEven}

                  </Text>
                  <Text color="white" fontSize={10} letterSpacing={0.01}>
                    ${loss}
                  </Text>
                </HStack>
              </VStack>
            ) : (
              <VStack>
                <Text color="white">Excepted Profit and Loss</Text>

                <Text
                  color={
                    Number(lineupdate.current.toFixed(4)) > xScale[3]
                      ? "green"
                      : "red"
                  }
                >
                  ${counter.toFixed(2)}
                </Text>
              </VStack>
            )
          ) : lineupdate.current <= xScale[0] ? (

            <VStack spacing={1} fontSize={"sm"}>
              <HStack spacing={10} alignItems={"flex-start"}>
                <Text color="white" fontSize={10} letterSpacing={0.01}>
                  Max Profit
                </Text>
                <Text color="white" fontSize={10} letterSpacing={0.1}>
                  BreakEven

                </Text>
                <Text color="white" fontSize={10} letterSpacing={0.1}>
                  Max Loss
                </Text>
              </HStack>
              <HStack spacing="14" alignItems="Center">
                <Text color="white" fontSize={10} letterSpacing={0.01}>
                  {maxProfit}
                </Text>
                <Text color="white" fontSize={10} letterSpacing={0.01}>
                  {breakEven}

                </Text>
                <Text color="white" fontSize={10} letterSpacing={0.01}>
                  ${loss}
                </Text>
              </HStack>
            </VStack>
          ) : (
            <VStack>
              <Text color="white">Excepted Profit and Loss</Text>
              <Text color={lineupdate.current < xScale[3] ? "green" : "red"}>
                ${counter.toFixed(2)}
              </Text>
            </VStack>
          )}
          {showChart && (
            <AreaChart
              width={300}
              height={200}
              data={data}
              margin={{
                top: 30,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis
                dataKey="name"
                type="number"
                domain={[xScale[0], xScale[6]]}
                tickCount={7}
                height={20}
                tick={false}
              />
              <YAxis
                tickCount={6}
                tickLine={false}
                domain={[-4, 6]}
                axisLine={false}
                tickFormatter={(number) => {
                  if (number == 0) {
                    return number;
                  }
                  if (number == 2) {
                    return "+";
                  }
                  if (number == -2) {
                    return "-";
                  } else {
                    return "";
                  }
                }}
              />
              <Dot cx={151} cy={0} r={5} color="yellow" />
              <CartesianGrid vertical={false} horizontal={false} />


              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="green" stopOpacity={1} />
                  <stop offset={off} stopColor="red" stopOpacity={1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="uv"
                stroke="#000"
                fill="url(#splitColor)"
                dot={<CustomizedDot />}
              />
              <ReferenceLine
                x={referenceLine}
                stroke="white"
                label={{ position: "top", fill: "red", fontSize: 14 }}
              />
              <ReferenceLine y={0} stroke="white" />
            </AreaChart>
          )}
        </VStack>
      </Box>
      <Box pt={10}>
        <Button
          mb={1.5}
          size={"lg"}
          colorScheme={btnBg}
          isFullWidth={true}
          isDisabled={buttonDisable}
          onClick={onClickHandle}
          rounded="2xl"
        >
          Review
        </Button>
      </Box>
    </>
  );
}

export default ProfitLossChart;

const CustomizedDot = (props: any) => {
  const { cx, cy, stroke, payload, value } = props;
  if (value[1] == 0) {
    return <circle cx={cx} cy={cy} r={5} strokeWidth={3} fill="white" />;
  }

  return <circle cx={cx} cy={cy} r={0} fill="white" />;
};
