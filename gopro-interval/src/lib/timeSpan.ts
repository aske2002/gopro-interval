type TimeFormat =
  | "HH:MM:SS"
  | "HH:MM"
  | "MM:SS"
  | "HH"
  | "MM"
  | "SS"
  | "hh hours mm minutes ss seconds"
  | "hh hours mm minutes"
  | "mm minutes ss seconds"
  | "hh hours"
  | "mm minutes"
  | "ss seconds";

export class TimeOfDay {
  private milliseconds: number;

  private static wrapMilliseconds(milliseconds: number): number {
    if (milliseconds < 0) {
      return (milliseconds % 86400000) + 86400000;
    } else if (milliseconds >= 86400000) {
      return milliseconds % 86400000;
    }
    return milliseconds;
  }

  constructor(milliseconds: number) {
    this.milliseconds = TimeOfDay.wrapMilliseconds(milliseconds);
  }

  static fromString(timeStr: string): TimeOfDay {
    return new TimeOfDay(TimeSpan.fromString(timeStr).toMilliseconds());
  }

  static fromTimeSpan(timeSpan: TimeSpan): TimeOfDay {
    return new TimeOfDay(timeSpan.toMilliseconds());
  }

  static fromHours(hours: number): TimeOfDay {
    return new TimeOfDay(hours * 3600000);
  }
  static fromMinutes(minutes: number): TimeOfDay {
    return new TimeOfDay(minutes * 60000);
  }
  static fromSeconds(seconds: number): TimeOfDay {
    return new TimeOfDay(seconds * 1000);
  }

  public toString(format: TimeFormat = "HH:MM:SS"): string {
    const timeSpan = new TimeSpan(this.milliseconds);
    return timeSpan.toString(format);
  }

  public toTimeSpan(): TimeSpan {
    return new TimeSpan(this.milliseconds);
  }

  public add(timeSpan: TimeSpan): TimeOfDay {
    return new TimeOfDay(
      TimeOfDay.wrapMilliseconds(this.milliseconds + timeSpan.toMilliseconds())
    );
  }

  public subtract(timeSpan: TimeSpan): TimeOfDay {
    return new TimeOfDay(
      TimeOfDay.wrapMilliseconds(this.milliseconds - timeSpan.toMilliseconds())
    );
  }

  public get hoursMinutesSeconds(): {
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const hours = Math.floor(this.milliseconds / 3600000);
    const minutes = Math.floor((this.milliseconds % 3600000) / 60000);
    const seconds = Math.floor((this.milliseconds % 60000) / 1000);
    return { hours, minutes, seconds };
  }

  public get totalMilliseconds(): number {
    return this.milliseconds;
  }

  public get totalSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }

  public get totalMinutes(): number {
    return Math.floor(this.milliseconds / 60000);
  }

  public get totalHours(): number {
    return Math.floor(this.milliseconds / 3600000);
  }

  public static now(): TimeOfDay {
    const now = new Date();
    return new TimeOfDay(
      now.getHours() * 3600000 +
        now.getMinutes() * 60000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds()
    );
  }

  public static fromHoursMinsSecs(
    hours?: number,
    minutes?: number,
    seconds?: number
  ): TimeOfDay {
    const totalMilliseconds =
      (hours || 0) * 3600000 + (minutes || 0) * 60000 + (seconds || 0) * 1000;
    return new TimeOfDay(totalMilliseconds);
  }
}

export class TimeSpan {
  private milliseconds: number;

  constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }

  static get midnight(): TimeSpan {
    return new TimeSpan(0);
  }

  static fromHoursMinutesSeconds(
    hours?: number,
    minutes?: number,
    seconds?: number
  ): TimeSpan {
    const totalMilliseconds =
      (hours || 0) * 3600000 + (minutes || 0) * 60000 + (seconds || 0) * 1000;
    return new TimeSpan(totalMilliseconds);
  }

  static fromMinutes(totalMinutes: number): TimeSpan {
    return new TimeSpan(totalMinutes * 60000);
  }

  static fromHours(totalHours: number): TimeSpan {
    return new TimeSpan(totalHours * 3600000);
  }

  static fromSeconds(totalSeconds: number): TimeSpan {
    return new TimeSpan(totalSeconds * 1000);
  }

  static fromString(timeStr: string): TimeSpan {
    const [_hours, _minutes, _seconds] = timeStr
      .split(":")
      .map((part) => parseInt(part, 10));

    const hours = isNaN(_hours) ? 0 : _hours;
    const minutes = isNaN(_minutes) ? 0 : _minutes;
    const seconds = isNaN(_seconds) ? 0 : _seconds;

    return TimeSpan.fromHoursMinutesSeconds(hours, minutes, seconds);
  }

  toHoursMinutesSeconds(): { hours: number; minutes: number; seconds: number } {
    const hours = Math.floor(this.milliseconds / 3600000);
    const minutes = Math.floor((this.milliseconds % 3600000) / 60000);
    const seconds = Math.floor((this.milliseconds % 60000) / 1000);
    return { hours, minutes, seconds };
  }

  toString(format: TimeFormat = "HH:MM:SS"): string {
    const { hours, minutes, seconds } = this.toHoursMinutesSeconds();
    const pad2 = (n: number): string => (n < 10 ? "0" : "") + n;

    const parts: string[] = [];

    switch (format) {
      case "HH:MM:SS":
        return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
      case "HH:MM":
        return `${pad2(hours)}:${pad2(minutes)}`;
      case "MM:SS":
        return `${pad2(minutes + hours * 60)}:${pad2(seconds)}`;
      case "HH":
        return `${hours}`;
      case "MM":
        return `${minutes + hours * 60}`;
      case "SS":
        return `${seconds + (minutes + hours * 60) * 60}`;

      case "hh hours mm minutes ss seconds":
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
        if (minutes > 0)
          parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
        if (seconds > 0)
          parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
        return parts.join(" ") || "0 seconds";

      case "hh hours mm minutes":
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
        if (minutes > 0)
          parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
        return parts.join(" ") || "0 minutes";

      case "mm minutes ss seconds":
        const totalMinutes = minutes + hours * 60;
        if (totalMinutes > 0)
          parts.push(`${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}`);
        if (seconds > 0)
          parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
        return parts.join(" ") || "0 seconds";

      case "hh hours":
        return hours > 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : "0 hours";

      case "mm minutes":
        const mins = minutes + hours * 60;
        return mins > 0
          ? `${mins} minute${mins !== 1 ? "s" : ""}`
          : "0 minutes";

      case "ss seconds":
        const secs = seconds + (minutes + hours * 60) * 60;
        return secs > 0
          ? `${secs} second${secs !== 1 ? "s" : ""}`
          : "0 seconds";

      default:
        return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    }
  }

  toJSON() {
    return this.toString("HH:MM:SS");
  }

  add(other: TimeSpan): TimeSpan {
    return new TimeSpan(this.milliseconds + other.milliseconds);
  }

  subtract(other: TimeSpan): TimeSpan {
    return new TimeSpan(this.milliseconds - other.milliseconds);
  }

  toMilliseconds(): number {
    return this.milliseconds;
  }

  get amPm(): "AM" | "PM" {
    const hours = this.toHoursMinutesSeconds().hours;
    return hours >= 12 ? "PM" : "AM";
  }

  get totalHours(): number {
    return Math.floor(this.milliseconds / 3600000);
  }

  get totalMinutes(): number {
    return this.toHoursMinutesSeconds().minutes + this.totalHours * 60;
  }

  get totalSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }
}
