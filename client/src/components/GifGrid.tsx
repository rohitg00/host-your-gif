import { useState } from "react";
import { Card } from "@/components/ui/card";
import ShareModal from "./ShareModal";
import { motion } from "framer-motion";

interface GifGridProps {
  gifs: Array<{
    id: number;
    filename: string;
    title: string;
    created_at: string;
  }>;
}

export default function GifGrid({ gifs }: GifGridProps) {
  const [selectedGif, setSelectedGif] = useState<(typeof gifs)[0] | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gifs.map((gif, index) => (
          <motion.div
            key={gif.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => setSelectedGif(gif)}
            >
              <div className="aspect-square relative">
                <img
                  src={`/uploads/${gif.filename}`}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white font-medium truncate">
                    {gif.title || gif.filename}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <ShareModal
        gif={selectedGif}
        open={!!selectedGif}
        onOpenChange={(open) => !open && setSelectedGif(null)}
      />
    </>
  );
}
