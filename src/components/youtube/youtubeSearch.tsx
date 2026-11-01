import type { YouTubeSearchItem } from "../../types";

const SESSION_KEY = "yt_api_key";

function getApiKey(): string {
  const envKey = import.meta.env.VITE_YT_API_KEY as string | undefined;
  if (envKey) return envKey;

  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return stored;

  const entered = window.prompt("Enter your YouTube API key (kept for this session only):")?.trim();
  if (!entered) throw new Error("A YouTube API key is required to search.");
  sessionStorage.setItem(SESSION_KEY, entered);
  return entered;
}

export async function searchYouTubeVideos(q: string) {
  const key = getApiKey();

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
    // Drop a bad session key so the user is asked again next time.
    if (res.status === 400 || res.status === 403) sessionStorage.removeItem(SESSION_KEY);
    const text = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log("YouTube search data:", data);
  return data.items as YouTubeSearchItem[];
}
