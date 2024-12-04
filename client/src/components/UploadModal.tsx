import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { uploadGif } from "../lib/api";

interface UploadForm {
  title: string;
  file: FileList;
}

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const form = useForm<UploadForm>();

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/gif')) {
      return 'Please upload a GIF file';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return uploadGif(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifs"] });
      toast({
        title: "Success",
        description: "GIF uploaded successfully",
      });
      onClose();
      form.reset();
      setPreviewUrl(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload GIF",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadForm) => {
    const formData = new FormData();
    if (data.file?.[0]) {
      formData.append("gif", data.file[0]);
      formData.append("title", data.title || data.file[0].name);
      mutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload GIF</DialogTitle>
          <DialogDescription>
            Share your favorite GIF with the community. Maximum file size is 10MB.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>GIF File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const error = validateFile(file);
                          if (error) {
                            toast({
                              title: "Error",
                              description: error,
                              variant: "destructive"
                            });
                            return;
                          }
                          setPreviewUrl(URL.createObjectURL(file));
                          onChange(e.target.files);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg"
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
