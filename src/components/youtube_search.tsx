export type YouTubeSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string } };
  };
};

export async function searchYouTubeVideos(q: string) {
  const key = import.meta.env.VITE_YT_API_KEY as string | undefined;
  if (!key) throw new Error("Missing VITE_YT_API_KEY in .env.local");

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "12",
    q,
    key,
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.items as YouTubeSearchItem[];
}
