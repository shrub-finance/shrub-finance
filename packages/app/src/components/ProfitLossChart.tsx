
import React, { useRef, useState,useEffect } from "react";
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
  Dot
} from "recharts";





 function ProfitLossChart(props:any) {
   const strickValue=props.strickRate;
   const premimu=props.premimum;
   const cancelRef=useRef();
  const LimitPrice=1.54;
  const maxProfit=(strickValue-premimu)*100;
  const loss =premimu*100;
  const [buttonDisable,setButtonDisable]=useState(false);
  const {
    isOpen: isOpenChart,
    onOpen: onOpenChart,
    onClose: onCloseChart,
  } = useDisclosure();
  const btnBg = useColorModeValue("sprout", "teal");
  const divider = props.optionType==="CALL" ? 10 :30;
  const maxCost = props.optionType==="CALL" ? loss: maxProfit  ;
   const scaleForlosstoZero=Number((maxCost/divider).toFixed(0))

   const valueXscale=Number((premimu/10).toFixed(2));
   const [statusOption,setStatusOption]=useState(maxCost);
   const lineupdate = useRef(0);
   let breakEven;
   let yScale = [6,4,2,0,-2,-2,-2];
   breakEven=Number(strickValue)-Number(premimu);
   const scaleForLoss=Number((loss/10).toFixed(0));
   const counterInitial = props.optionType==="CALL" ? loss :maxProfit;
   const [counter,setCounter]=useState(counterInitial);
   if(props.optionType==="CALL") {
    breakEven=Number(strickValue)+Number(premimu);
    yScale=[-2,-2,-2,0,2,4,6];
   }
   const xScale:number[] = [breakEven-3,breakEven-2,breakEven-1,breakEven,breakEven+1,breakEven+2,breakEven+3]; 
   const initRef = props.optionType === "CALL" ? xScale[1]:xScale[0];
   const [referenceLine,setReferenceLine]=useState(initRef);
   const onClickHandle = () => {
 
     setButtonDisable(true);    
    const setIntervalTime =  window.setInterval(()=> {
      intervalRef.current = setIntervalTime;
    setReferenceLine((preValue)=> preValue+.1);
  

if(props.optionType ==="CALL"){
  console.log("CALL")
  if(Number((lineupdate.current).toFixed(1))>= xScale[2] && Number((lineupdate.current).toFixed(1))<=xScale[3]){
    setCounter((preValue)=> preValue- scaleForlosstoZero)
   
}
if(Number((lineupdate.current).toFixed(1))>xScale[3] ){
setCounter((preValue)=> preValue+ scaleForlosstoZero)
}
}else{
  if(Number((lineupdate.current).toFixed(1))<=xScale[3] ){
    console.log("put")
     setCounter((preValue)=> preValue- scaleForlosstoZero)
    }
    if(Number((lineupdate.current).toFixed(1))>=xScale[3] && counter <= loss ){
     console.log("loss",loss)
     setCounter((preValue)=> preValue+ scaleForLoss)
     }
}


    if(lineupdate.current >= xScale[5]){
      clearInterval(intervalRef.current);
      setButtonDisable(false);
      setReferenceLine(initRef);
      lineupdate.current=initRef;
      setCounter(counterInitial);
      console.log("lineupdate",lineupdate.current)      
    }
    },100);
  }
  const intervalRef = useRef(0);


  useEffect(() => {
lineupdate.current = referenceLine;
console.log(lineupdate.current,initRef)
  }, [referenceLine]);
      
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
      name:xScale[2],
      uv:yScale[2],
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
      name:xScale[5],
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
  return (
    <>
    
      <Box
      
      >
        <VStack>
          {props.optionType==="CALL" ?(lineupdate.current<=xScale[1] ? (<VStack spacing={1} fontSize={"sm"}>

<HStack spacing={10} alignItems={"flex-start"}>
  <Text color="white" fontSize={10} letterSpacing={.01}>Max Profit</Text>
  <Text color="white" fontSize={10}  letterSpacing={.1}>BreackEven</Text>
  <Text color="white" fontSize={10} letterSpacing={.1}>Max Loss</Text>
</HStack>
<HStack
  spacing="14"
  alignItems="Center"
  
>
  <Text color="white" fontSize={10} letterSpacing={.01}>ul</Text>
  <Text color="white" fontSize={10} letterSpacing={.01}>{breakEven}</Text>
  <Text color="white" fontSize={10} letterSpacing={.01}>${loss}</Text>
</HStack>
</VStack>):
( <VStack>
<Text color="white" >Excepted Profit and Loss</Text>
   <Text color={lineupdate.current>3?'green':'red'} >${counter}</Text>
</VStack>)):(lineupdate.current===initRef ? (<VStack spacing={1} fontSize={"sm"}>

<HStack spacing={10} alignItems={"flex-start"}>
  <Text color="white" fontSize={10} letterSpacing={.01}>Max Profit</Text>
  <Text color="white" fontSize={10}  letterSpacing={.1}>BreackEven</Text>
  <Text color="white" fontSize={10} letterSpacing={.1}>Max Loss</Text>
</HStack>
<HStack
  spacing="14"
  alignItems="Center"
  >
  <Text color="white" fontSize={10} letterSpacing={.01}>{maxProfit}</Text>
  <Text color="white" fontSize={10} letterSpacing={.01}>{breakEven}</Text>
  <Text color="white" fontSize={10} letterSpacing={.01}>${loss}</Text>
</HStack>
</VStack>):
( <VStack>
<Text color="white" >Excepted Profit and Loss</Text>
   <Text color={lineupdate.current < xScale[3]?'green':'red'} >${counter}</Text>
</VStack>))
          }
     
         <AreaChart
         width={300}
         height={200}
      data={data}
      margin={{
        top: 30,
        right: 30,
        left: 0,
        bottom: 0
      }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis dataKey="name" type="number" domain={[xScale[0], xScale[6]]} tickCount={7} height={20} tick={false}/>
      <YAxis tickCount={6} tickLine={false} domain={[-4, 6]} axisLine={false}  tickFormatter={(number)=>{
        if(number==0 ){
          return number
        }
        if(number == 2){
          return "+"
        }
        if(number == -2){
          return "-"
        }
        else{
          return ""
        }
        }}/>
        <Dot cx={151} cy={0} r={5} color="yellow"/>
        <CartesianGrid vertical={false} horizontal={false}/>
        
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
        dot={<CustomizedDot/>}
      />
      <ReferenceLine x={referenceLine} stroke="white" label={{ position: 'top', fill: 'red', fontSize: 14 }}    />
      <ReferenceLine y={0} stroke="white"   />
    </AreaChart>
        
         
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

const CustomizedDot = (props:any) => {
  const { cx, cy, stroke, payload, value } = props;
  if (value[1] == 0) {
    
    return (

      <circle cx={cx } cy={cy} r={5}  strokeWidth={3} fill="white" />
    );
  }


  return  <circle cx={cx } cy={cy} r={0}   fill="white" />
};

