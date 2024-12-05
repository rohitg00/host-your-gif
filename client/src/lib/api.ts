interface Gif {
  id: number;
  filename: string;
  title: string;
  created_at: string;
}

export async function getAllGifs(search?: string): Promise<Gif[]> {
  const params = new URLSearchParams();
  if (search) params.append("q", search);
  
  const response = await fetch(`/api/gifs?${params}`);
  if (!response.ok) throw new Error("Failed to fetch GIFs");
  return response.json();
}

export async function uploadGif(formData: FormData): Promise<Gif> {
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) throw new Error("Failed to upload GIF");
  return response.json();
}
