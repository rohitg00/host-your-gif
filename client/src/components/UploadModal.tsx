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
  files: FileList;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previews, setPreviews] = useState<string[]>([]);
  const form = useForm<UploadForm>();

  const validateFiles = (files: FileList): string | null => {
    if (files.length > 10) {
      return 'Maximum 10 files can be uploaded at once';
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/gif')) {
        return 'Please upload only GIF files';
      }
      if (file.size > 50 * 1024 * 1024) {
        return 'Each file must be less than 50MB';
      }
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData[]) => {
      const results = await Promise.all(data.map(formData => uploadGif(formData)));
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifs"] });
      toast({
        title: "Success",
        description: "GIFs uploaded successfully",
      });
      onOpenChange(false);
      form.reset();
      setPreviews([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload GIFs",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: UploadForm) => {
    if (!data.files?.length) return;

    const formDataArray = Array.from(data.files).map(file => {
      const formData = new FormData();
      formData.append("gif", file);
      formData.append("title", file.name);
      return formData;
    });

    mutation.mutate(formDataArray);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload GIFs</DialogTitle>
          <DialogDescription>
            Share your favorite GIFs with the community. Upload up to 10 GIFs at once. Maximum file size is 50MB per file.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="files"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>GIF Files</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/gif"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files?.length) {
                          const error = validateFiles(files);
                          if (error) {
                            toast({
                              title: "Error",
                              description: error,
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          // Create previews
                          const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
                          setPreviews(newPreviews);
                          onChange(files);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onLoad={() => URL.revokeObjectURL(preview)}
                    />
                  </div>
                ))}
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
