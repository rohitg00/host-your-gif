import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GifGrid from "../components/GifGrid";
import UploadModal from "../components/UploadModal";
import SearchBar from "../components/SearchBar";
import { getAllGifs } from "../lib/api";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: gifs, isLoading } = useQuery({
    queryKey: ["gifs", search],
    queryFn: () => getAllGifs(search)
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            RetroGIF
          </h1>
          <div className="flex gap-4 w-full md:w-auto">
            <SearchBar value={search} onChange={setSearch} />
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Upload GIF
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-muted rounded" />
            ))}
          </div>
        ) : (
          <GifGrid gifs={gifs || []} />
        )}
      </div>

      <UploadModal 
        open={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  );
}
