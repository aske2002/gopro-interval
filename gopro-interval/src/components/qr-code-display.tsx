import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  title: string;
  command: string;
  description?: string;
  qrDataRef?: React.RefObject<string | null>;
  disAllowEnlargement?: boolean;
  className?: string;
}

export function QrCodeDisplay({
  title,
  className,
  command,
  qrDataRef,
  disAllowEnlargement,
}: QRCodeDisplayProps) {
  const id = useRef(uuid());
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [expanded, setExpanded] = useState(false);

  // Generate QR code using a simple canvas approach
  const generateQRCode = async () => {
    try {
      const qr = await QRCode.toDataURL(command, {
        scale: 10,
        margin: 0,
      });
      setQrDataUrl(qr);
      if (qrDataRef) {
        qrDataRef.current = qr;
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code", {
        description:
          "Please try again, or contact Aske at askevkoed@gmail.com or +4520786566",
      });
    }
  };

  // Generate QR code when component mounts or command changes
  useEffect(() => {
    generateQRCode();
  }, [command]);

  return (
    <div className={cn("flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-border h-48", className)}>
      {qrDataUrl ? (
        <AnimatePresence>
          {qrDataUrl && (
            <>
              <motion.img
                layoutId={id.current}
                onClick={() => !disAllowEnlargement && setExpanded(true)}
                src={qrDataUrl}
                alt={`QR Code for ${title}`}
                draggable={false}
                className={cn(
                  `object-contain select-none`,
                  disAllowEnlargement ? "" : "cursor-pointer"
                )}
              />

              {expanded && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    className="fixed inset-0 bg-black/75 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setExpanded(false)}
                  />

                  {/* Expanded QR */}
                  <motion.img
                    layoutId={id.current}
                    src={qrDataUrl}
                    alt={`QR Code for ${title}`}
                    className="fixed inset-0 m-auto w-4/5 md:w-1/2 z-51 rounded-xl cursor-pointer p-8 bg-white"
                    onClick={() => setExpanded(false)}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  />
                </>
              )}
            </>
          )}
        </AnimatePresence>
      ) : (
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <QrCode className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export function QRCodeDisplayCard({
  title,
  command,
  description,
  disAllowEnlargement,
}: QRCodeDisplayProps) {
  const qrDataRef = useRef<string>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      toast.success("Copied!", {
        description: "Command copied to clipboard",
      });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Could not copy to clipboard",
      });
    }
  };

  const downloadQR = () => {
    if (qrDataRef.current) {
      const link = document.createElement("a");
      link.href = qrDataRef.current;
      link.download = `gopro-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <QrCodeDisplay
          disAllowEnlargement={disAllowEnlargement}
          qrDataRef={qrDataRef}
          title={title}
          command={command}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            GoPro Labs Command:
          </label>
          <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
            {command}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            onClick={downloadQR}
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
