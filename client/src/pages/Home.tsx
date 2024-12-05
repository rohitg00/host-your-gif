import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center py-6 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Host your GIF
            </h1>
            <p className="text-muted-foreground">Share your favorite GIFs with the world</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <SearchBar 
              value={search} 
              onChange={setSearch} 
              className="w-full sm:w-80"
            />
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-primary/90 font-semibold"
              size="lg"
            >
              Upload GIF
            </Button>
          </div>
        </header>

        <main>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !gifs?.length ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-muted-foreground">No GIFs found</h2>
              <p className="text-muted-foreground mt-2">Upload your first GIF to get started!</p>
            </div>
          ) : (
            <GifGrid gifs={gifs} />
          )}
        </main>
      </div>

      <UploadModal 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen}
      />
    </div>
  );
}
