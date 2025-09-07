import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  ArrowLeft,
  Github,
  Mail,
  Clock,
  Zap,
  Shield,
  Home,
  HardDrive,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  About GoPro Labs QR Generator
                </h1>
                <p className="text-muted-foreground">
                  Learn more about this tool
                </p>
              </div>
            </div>
            <Link to="/">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                What is GoPro Labs QR Generator?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This tool generates QR codes for GoPro Labs, enabling advanced
                camera control and automation. GoPro Labs is an experimental
                platform that allows users to control their GoPro cameras using
                QR codes, unlocking features not available in the standard GoPro
                app.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With this generator, you can easily create interval recording
                schedules, making it possible to program the GoPro cameras to
                record at specific times and intervals. This is particularly
                useful to save battery on the GoPro, and collecting data over
                longer periods.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Interval Recording</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up precise recording intervals with custom durations
                      and time windows
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HardDrive className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Presets</h3>
                    <p className="text-sm text-muted-foreground">
                      Pre-configured settings for common scenarios
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Local Presets</h3>
                    <p className="text-sm text-muted-foreground">
                      Save custom presets locally - no data leaves your device
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator */}
          <Card>
            <CardHeader>
              <CardTitle>Created by Aske Koed</CardTitle>
              <CardDescription>About the developer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This tool was created by Aske Koed, a developer passionate about
                photography, videography, and automation. The goal was to make
                GoPro Labs more accessible by providing an intuitive interface
                for generating the complex QR codes needed for advanced camera
                control.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://www.github.com/aske2002", "_blank")
                  }
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("mailto:askevkoed@gmail.com", "_blank")
                  }
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>Getting started with GoPro Labs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    Enable GoPro Labs on your camera by visiting{" "}
                    <a
                      className="font-mono text-foreground"
                      href="https://gopro.github.io/labs/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      gopro.github.io/labs
                    </a>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    Use this tool to generate QR codes for your desired camera
                    settings and recording schedule
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    Use the first QR code to set the correct time on the camera,
                    as it maybe be incorrect due to battery removal. Display the
                    QR code on your screen and point your GoPro camera at it,
                    the camera will automatically scan the code and set the
                    time.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <p className="text-muted-foreground">
                    Scan the second QR code with your GoPro camera to apply the
                    settings and start interval recording. You will hear three
                    beeps to confirm the settings have been applied, and the
                    camera will start recording.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
