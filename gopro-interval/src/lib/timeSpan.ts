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

export class TimeSpan {
  private milliseconds: number;

  constructor(milliseconds: number) {
    if (milliseconds < 0 || milliseconds >= 86400000) {
      throw new Error("Milliseconds must be in the range 0 to 86399999");
    }
    this.milliseconds = milliseconds;
  }

  static fromHMS(hours?: number, minutes?: number, seconds?: number): TimeSpan {
    const totalMilliseconds =
      (hours || 0) * 3600000 + (minutes || 0) * 60000 + (seconds || 0) * 1000;
    return new TimeSpan(totalMilliseconds);
  }

  static now(): TimeSpan {
    const date = new Date();
    return TimeSpan.fromHMS(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    );
  }

  static fromMinutes(totalMinutes: number): TimeSpan {
    if (totalMinutes < 0 || totalMinutes >= 1440) {
      throw new Error("Total minutes must be in the range 0 to 1439");
    }
    return new TimeSpan(totalMinutes * 60000);
  }

  static fromHours(totalHours: number): TimeSpan {
    if (totalHours < 0 || totalHours >= 24) {
      throw new Error("Total hours must be in the range 0 to 23");
    }
    return new TimeSpan(totalHours * 3600000);
  }

  static fromSeconds(totalSeconds: number): TimeSpan {
    if (totalSeconds < 0 || totalSeconds >= 86400) {
      throw new Error("Total seconds must be in the range 0 to 86399");
    }
    return new TimeSpan(totalSeconds * 1000);
  }

  static fromString(timeStr: string): TimeSpan {
    const [_hours, _minutes, _seconds] = timeStr
      .split(":")
      .map((part) => parseInt(part, 10));

    const hours = isNaN(_hours) ? 0 : _hours;
    const minutes = isNaN(_minutes) ? 0 : _minutes;
    const seconds = isNaN(_seconds) ? 0 : _seconds;

    return TimeSpan.fromHMS(hours, minutes, seconds);
  }

  toHMS(): { hours: number; minutes: number; seconds: number } {
    const hours = Math.floor(this.milliseconds / 3600000);
    const minutes = Math.floor((this.milliseconds % 3600000) / 60000);
    const seconds = Math.floor((this.milliseconds % 60000) / 1000);
    return { hours, minutes, seconds };
  }

  toString(format: TimeFormat = "HH:MM:SS"): string {
    const { hours, minutes, seconds } = this.toHMS();
    const pad2 = (n: number): string => (n < 10 ? "0" : "") + n;

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
        return `${hours} hours ${minutes} minutes ${seconds} seconds`;
      case "hh hours mm minutes":
        return `${hours} hours ${minutes} minutes`;
      case "mm minutes ss seconds":
        return `${minutes + hours * 60} minutes ${seconds} seconds`;
      case "hh hours":
        return `${hours} hours`;
      case "mm minutes":
        return `${minutes + hours * 60} minutes`;
      case "ss seconds":
        return `${seconds + (minutes + hours * 60) * 60} seconds`;
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
    const hours = this.toHMS().hours;
    return hours >= 12 ? "PM" : "AM";
  }

  get totalHours(): number {
    return Math.floor(this.milliseconds / 3600000);
  }

  get totalMinutes(): number {
    return this.toHMS().minutes + this.totalHours * 60;
  }

  get totalSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }
}
