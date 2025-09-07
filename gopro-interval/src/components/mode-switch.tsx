import useModeControls from "@/hooks/use-mode-controls";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function ModeSwitch() {
  const { simpleMode, setSimpleMode } = useModeControls();

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="simple-mode">Simple Mode</Label>
      <Switch
        id="simple-mode"
        checked={simpleMode}
        onCheckedChange={setSimpleMode}
      />
    </div>
  );
}
