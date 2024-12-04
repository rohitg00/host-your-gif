import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Gif } from "@db/schema";

interface ShareModalProps {
  gif: Gif | null;
  open: boolean;
  onClose: () => void;
}

export default function ShareModal({ gif, open, onClose }: ShareModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("direct");

  if (!gif) return null;

  const shareFormats = {
    direct: gif.shareUrl,
    html: `<img src="${gif.shareUrl}" alt="${gif.title}" />`,
    markdown: `![${gif.title}](${gif.shareUrl})`,
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share GIF</DialogTitle>
          <DialogDescription>
            Copy the link or embed code to share this GIF anywhere.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <img
            src={gif.filepath}
            alt={gif.title}
            className="w-full rounded-lg"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="direct">Direct Link</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>

            {Object.entries(shareFormats).map(([format, code]) => (
              <TabsContent key={format} value={format}>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(code)}
                  >
                    Copy
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
