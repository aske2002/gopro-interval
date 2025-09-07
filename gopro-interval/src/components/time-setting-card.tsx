import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatAsDateTimeString } from "@/lib/gopro/utils";

interface TimeSettingCardProps {
  time: Date;
}

export function TimeSettingCard({ time }: TimeSettingCardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time Synchronization
          </CardTitle>
          <CardDescription>
            Set the current time on your GoPro camera for accurate timestamps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Instructions:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Turn on your GoPro camera</li>
              <li>Point the camera at the QR code below</li>
              <li>Wait for the camera to recognize and process the code</li>
              <li>The camera's time will be automatically updated</li>
            </ol>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This QR code will set your GoPro's internal clock to the current
              time: <strong>{formatAsDateTimeString(time)}</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
