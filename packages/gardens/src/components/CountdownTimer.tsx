import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import DateTimeDisplay from "./DateTimeDisplay";
import { HStack } from "@chakra-ui/react";

// @ts-ignore
const ShowCounter = ({ days, hours, minutes, seconds }) => {
  return (
    <HStack className="show-counter">
      <DateTimeDisplay value={days} type={"Days"} />
      <DateTimeDisplay value={hours} type={"Hours"} />
      <DateTimeDisplay value={minutes} type={"Mins"} />
      <DateTimeDisplay value={seconds} type={"Seconds"} />
    </HStack>
  );
};

// @ts-ignore
const CountdownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <></>;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default CountdownTimer;
