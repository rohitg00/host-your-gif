import { useState } from "react";
import { Card } from "@/components/ui/card";
import ShareModal from "./ShareModal";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FiTrash2, FiShare2 } from "react-icons/fi";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface GifGridProps {
  gifs: Array<{
    id: number;
    userId: number;
    filename: string;
    title: string;
    created_at: string;
  }>;
}

export default function GifGrid({ gifs }: GifGridProps) {
  const [selectedGif, setSelectedGif] = useState<(typeof gifs)[0] | null>(null);
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (gif: typeof gifs[0], e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the share modal
    
    if (!window.confirm("Are you sure you want to delete this GIF?")) {
      return;
    }

    try {
      await axios.delete(`/api/gifs/${gif.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast({
        title: "Success",
        description: "GIF deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the GIFs list
      queryClient.invalidateQueries({ queryKey: ['gifs'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete GIF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
              className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all relative"
              onClick={() => setSelectedGif(gif)}
            >
              <div className="aspect-square relative">
                <img
                  src={`/uploads/${gif.filename}`}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <p className="text-white font-medium truncate flex-1">
                    {gif.title || gif.filename}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGif(gif);
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <FiShare2 className="text-white" />
                    </button>
                    {user && user.id === gif.userId && (
                      <button
                        onClick={(e) => handleDelete(gif, e)}
                        className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                      >
                        <FiTrash2 className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <ShareModal
        gif={selectedGif}
        isOpen={!!selectedGif}
        onClose={() => setSelectedGif(null)}
      />
    </>
  );
}
