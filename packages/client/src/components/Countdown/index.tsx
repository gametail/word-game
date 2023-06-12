import { FC, useEffect, useState } from "react";

interface ICountdown {
  roundStart: number;
  timeSetting: number;
}

const Countdown: FC<ICountdown> = ({ roundStart, timeSetting }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [fetchErrorText, setFetchErrorText] = useState<string>("");

  useEffect(() => {
    if (timeSetting === 0) return;

    fetch("http://192.168.178.21:3001/time")
      .then((res) => res.json())
      .then((data) => {
        const startTime =
          timeSetting - Math.floor((data.time - roundStart) / 1000);
        const startTimeMin = Math.floor(startTime / 60);
        const startTimeSec = startTime % 60;

        setTimeLeft(startTime);
        setMinutesLeft(startTimeMin);
        setSecondsLeft(startTimeSec);
      })
      .catch((err) => setFetchErrorText("Could not fetch time"));
  }, []);

  useEffect(() => {
    if (timeSetting === 0 || !timeLeft) return;

    const interval = setInterval(() => {
      setTimeLeft((timeLeft) => timeLeft - 1);
      setMinutesLeft(Math.floor(timeLeft / 60));
      setSecondsLeft(timeLeft % 60);
      //   console.log(timeLeft, minutesLeft, secondsLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  if (timeSetting === 0) {
    return <span className="mb-4 font-mono text-4xl">&infin;</span>;
  }

  if (!(timeLeft > 0)) {
    return (
      <span className="mb-4 font-mono text-4xl">
        {fetchErrorText || "00:00"}
      </span>
    );
  }

  return (
    <span className="mb-4 font-mono text-4xl select-none countdown">
      <span style={{ "--value": minutesLeft } as React.CSSProperties}></span>:
      <span style={{ "--value": secondsLeft } as React.CSSProperties}></span>
    </span>
  );
};

export default Countdown;
