import { getTimeFormattedForCommand } from "@/lib/gopro/utils";
import { useEffect, useMemo, useState } from "react";

export default function useTimeCommand() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const command = useMemo(() => {
    return getTimeFormattedForCommand(time);
  }, [time]);
  return {
    time,
    command,
  };
}
