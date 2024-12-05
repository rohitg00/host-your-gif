import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface GifType {
  id: number;
  filename: string;
  title: string;
  created_at: string;
}

interface ShareModalProps {
  gif: GifType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareModal({ gif, open, onOpenChange }: ShareModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("direct");

  if (!gif) return null;

  const shareUrl = `${window.location.origin}/uploads/${gif.filename}`;

  const shareFormats = {
    direct: shareUrl,
    html: `<img src="${shareUrl}" alt="${gif.title}" />`,
    markdown: `![${gif.title}](${shareUrl})`,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share GIF</DialogTitle>
          <DialogDescription>
            Share your GIF using any of these formats
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="direct">Direct Link</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>
            {Object.entries(shareFormats).map(([format, value]) => (
              <TabsContent key={format} value={format} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    readOnly
                    value={value}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="submit"
                    onClick={() => copyToClipboard(value)}
                    className="shrink-0"
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
