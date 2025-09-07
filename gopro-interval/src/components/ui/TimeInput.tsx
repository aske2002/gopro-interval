import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Clock, Check, X } from "lucide-react";
import { TimeOfDay, TimeSpan } from "@/lib/timeSpan";

/**
 * Beautiful, accessible Time Picker for shadcn/ui
 * ------------------------------------------------
 * - 24h and 12h modes (prop)
 * - Minute step (default 5)
 * - Keyboard friendly
 * - Type to filter; arrow keys to navigate; Enter to select
 * - "Now" and "Clear" actions
 * - Controlled via `value` ("HH:mm") + `onChange`
 *
 * Usage:
 * <TimePicker value={time} onChange={setTime} format="24h" minuteStep={5} />
 */

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Canonical value in 24h format: "HH:mm" (e.g. "09:30"), or null */
  value?: TimeOfDay | null;
  onChange?: (value: TimeOfDay | null) => void;
  /** Display format */
  /** Minute step for the minute column */
  minuteStep?: number;
  /** Placeholder when no value */
  placeholder?: string;
  /** Disable the whole control */
  disabled?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function clamp(min: number, n: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

function fromParts(hour: number, minute: number): number {
  return clamp(0, hour, 23) * 60 + clamp(0, minute, 59);
}

export function TimePicker({
  value,
  onChange,
  minuteStep = 5,
  placeholder = "Select time",
  disabled,
  className,
  ...divProps
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const { hour, minute } = React.useMemo(() => {
    let val = value || TimeOfDay.fromHours(12);
    const { hours, minutes } = val.hoursMinutesSeconds;
    return { hour: hours, minute: minutes };
  }, [value]);

  const hours = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  const minutes = React.useMemo(() => {
    const step = Math.max(1, Math.min(30, Math.floor(minuteStep)));
    return Array.from(
      { length: Math.ceil(60 / step) },
      (_, i) => (i * step) % 60
    );
  }, [minuteStep]);

  function commit(newMins: number | null) {
    if (onChange) {
      if (newMins == null) {
        onChange(null);
      } else {
        onChange(TimeOfDay.fromMinutes(newMins));
      }
    }
  }

  function setHour(h: number) {
    const m = minute;
    commit(fromParts(h, m));
  }
  function setMinute(m: number) {
    const h = hour;
    commit(fromParts(h, m));
  }

  function setNow() {
    const now = new Date();
    const minsNow = now.getHours() * 60 + now.getMinutes();
    commit(minsNow);
    setOpen(false);
  }

  function clear() {
    onChange?.(null);
    setOpen(false);
  }

  const display = React.useMemo(() => value?.toString("HH:MM:SS"), [value]);

  return (
    <div className={cn("w-full", className)} {...divProps}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !display && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate">{display || placeholder}</span>
            <Clock className="ml-2 h-4 w-4 opacity-70" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] sm:w-[360px] p-0" align="start">
          <Separator />
          <div className="grid grid-cols-2">
            <Column
              title="Hour"
              items={hours}
              selected={hour}
              render={(h) => pad(h)}
              onSelect={setHour}
            />
            <Column
              title="Minute"
              items={minutes}
              selected={minute}
              render={(m) => pad(m)}
              onSelect={setMinute}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between p-2 gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              <X className="mr-1 h-4 w-4" /> Clear
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setOpen(false)}
              >
                OK
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={setNow}
              >
                Now
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ColumnProps<T> {
  title: string;
  items: T[];
  selected: any;
  render: (item: T) => string;
  onSelect: (item: T) => void;
  filter?: string;
}

function Column<T>({
  title,
  items,
  selected,
  render,
  onSelect,
  filter,
}: ColumnProps<T>) {
  const [value, setValue] = React.useState("");
  React.useEffect(() => setValue(filter ?? ""), [filter]);

  const filtered = React.useMemo(() => {
    const q = (value || "").toLowerCase().replace(/\s+/g, "");
    if (!q) return items;
    return items.filter((it) => render(it).toLowerCase().includes(q));
  }, [items, value, render]);

  return (
    <div className="min-w-0">
      <div className="px-3 pt-3 text-xs font-medium text-muted-foreground">
        {title}
      </div>
      <Command shouldFilter={false} className="max-h-60 overflow-auto">
        {filter && (
          <CommandInput
            value={value}
            onValueChange={setValue}
            placeholder={`Filter ${title.toLowerCase()}...`}
          />
        )}
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup>
            {filtered.map((it, idx) => {
              const label = render(it);
              const isSelected = label === render(selected);
              return (
                <CommandItem
                  key={idx}
                  value={label}
                  className={cn(
                    "cursor-pointer",
                    isSelected && "font-medium bg-primary/10"
                  )}
                  onSelect={() => onSelect(it)}
                >
                  <span className="truncate">{label}</span>
                  {isSelected && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
