"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { QrCodeDisplay } from "../qr-code-display";
import { Link } from "@tanstack/react-router";
import type { NewRecordingPreset } from "@/routes";
import useTimeCommand from "@/hooks/use-time-command";
import useSettingsCommand from "@/hooks/use-settings-command";
import {
  LensFovLabels,
  VideoFrameRateLabels,
  VideoResLabels,
} from "@/lib/gopro/constants";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import DotIndicator from "../dot-indicator";

interface SimpleViewProps {
  currentSettings: NewRecordingPreset;
  onClose?: () => void;
}

export default function SimpleView({
  currentSettings,
  onClose,
}: SimpleViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { command: timeCommand } = useTimeCommand();
  const settingsCommand = useSettingsCommand(currentSettings);

  const steps = useMemo(() => {
    return [
      {
        title: "Time Sync",
        command: timeCommand,
        description: "Set your GoPro's internal clock to the current time",
        info: "Scan this QR code first to ensure accurate timestamps on your recordings",
      },
      {
        title: "Recording Config",
        command: settingsCommand,
        description: "Configure your GoPro for interval recording",
        info: `Record ${currentSettings.recordDuration.toString("hh hours mm minutes ss seconds")} every ${currentSettings.intervalDuration.toString("hh hours mm minutes ss seconds")} • ${VideoResLabels[currentSettings.resolution]} ${LensFovLabels[currentSettings.lensWidth]} ${VideoFrameRateLabels[currentSettings.framerate]}${
          currentSettings.type === "dynamic"
            ? ` Active between ${currentSettings.startTime.toString("HH:MM")} - ${currentSettings.endTime.toString("HH:MM")}`
            : ""
        }`,
      },
    ];
  }, [timeCommand, settingsCommand, currentSettings]);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full top-0 left-0 bg-background flex flex-col grow">
      <DotIndicator
        count={count}
        activeIndex={currentStep}
      />
      <div className="container mx-auto px-4 py-8 flex flex-col grow h-0">
        <Carousel className="flex flex-col grow h-full" setApi={setApi}>
          <CarouselContent className="grow" wrapperClassName="grow flex">
            {steps.map((qr, index) => (
              <CarouselItem key={index} className="grow flex flex-col">
                {/* Slide content */}
                <div className="flex flex-col grow">
                  <QrCodeDisplay
                    title={qr.title}
                    command={qr.command}
                    disAllowEnlargement
                    className="grow"
                    description={qr.description}
                  />
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>{qr.title}</CardTitle>
                      <CardDescription>{qr.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{qr.info}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              disabled={api?.canScrollPrev() === false}
              variant={"outline"}
              onClick={() => {
                api?.scrollTo(currentStep - 1);
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              disabled={api?.canScrollNext() === false}
              onClick={() => {
                api?.scrollTo(currentStep + 1);
              }}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Carousel>
      </div>
    </div>
  );
}
