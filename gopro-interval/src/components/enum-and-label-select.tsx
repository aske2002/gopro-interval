import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
interface EnumAndLabelSelectProps<T extends string> {
  placeholder?: string;
  labels: Record<T, string>; // keys are enum values
  className?: string;
  value?: T;
  onChange?: (newValue: T) => void;
}

export function EnumAndLabelSelect<T extends string>({
  placeholder,
  labels,
  className,
  value,
  onChange,
}: EnumAndLabelSelectProps<T>) {
  const stringOptions = Object.entries(labels).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange?.(newValue as T)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {stringOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {String(option.label)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
