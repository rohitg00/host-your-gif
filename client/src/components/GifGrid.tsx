import { useState } from "react";
import { Card } from "@/components/ui/card";
import ShareModal from "./ShareModal";
import type { Gif } from "@db/schema";

interface GifGridProps {
  gifs: Gif[];
}

export default function GifGrid({ gifs }: GifGridProps) {
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
        {gifs.map((gif) => (
          <Card 
            key={gif.id}
            className="group relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => setSelectedGif(gif)}
          >
            <img
              src={gif.filepath}
              alt={gif.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p className="text-white text-sm truncate">{gif.title}</p>
            </div>
          </Card>
        ))}
      </div>

      <ShareModal
        gif={selectedGif}
        open={!!selectedGif}
        onClose={() => setSelectedGif(null)}
      />
    </>
  );
}
