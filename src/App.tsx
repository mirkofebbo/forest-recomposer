import React, { useState } from "react";
import { Container, Typography, Box, Link } from '@mui/material';
import { searchYouTubeVideos, type YouTubeSearchItem } from "./components/youtube_search";

export default function App() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const results = await searchYouTubeVideos(query.trim());
      setItems(results);
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>YouTube Search </h1>

      <form onSubmit={onSearch} style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos…"
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button disabled={loading || !query.trim()} style={{ padding: "10px 14px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {items.map((it) => {
          const vid = it.id.videoId;
          const thumb = it.snippet.thumbnails?.medium?.url;
          const href = vid ? `https://www.youtube.com/watch?v=${vid}` : "#";

          return (
            <a
              key={`${vid}-${it.snippet.publishedAt}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "inherit",
                border: "1px solid #ddd",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {thumb && <img src={thumb} alt="" style={{ width: "100%", display: "block" }} />}
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{it.snippet.title}</div>
                <div style={{ opacity: 0.7, marginTop: 6 }}>{it.snippet.channelTitle}</div>
                <div style={{ opacity: 0.7, marginTop: 6 }}>{it.snippet.publishedAt}</div>

              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
