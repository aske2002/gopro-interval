export function getTimeFormattedForCommand(date: Date): string {
  const pad2 = (n: number): string => (n < 10 ? "0" : "") + n;

  const formattedDate =
    date.getFullYear().toString().slice(-2) +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds());

  return `oT${formattedDate}`;
}

export const formatAsDateTimeString = (date: Date): string => {
  return date.toLocaleString("da-Dk", {
    year: "numeric",
    month: "short", // "Jan", "Feb", ...
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // remove if you prefer AM/PM
  });
};
