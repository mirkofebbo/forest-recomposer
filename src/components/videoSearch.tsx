import React, { useState } from "react";
import { Container, Typography, Box, Link, Button, Input } from '@mui/material';
import { searchYouTubeVideos, type YouTubeSearchItem } from "./youtubeSearch";

export default function VideoSearch() {
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
    <Container maxWidth="sm" sx={{ marginTop: 5 }}>

      <Box component="form" onSubmit={onSearch} sx={{ display: "flex", gap: 1, marginBottom: 2 }}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos…"
        style={{ flex: 1, padding: 10, fontSize: 16 }}
      />
      <Button type="submit" disabled={loading || !query.trim()} variant="contained">
        {loading ? "Searching…" : "Search"}
      </Button>
      </Box>

      {error && <Typography sx={{ color: "error.main" }}>{error}</Typography>}

      <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 1.5,
        marginTop: 2,
      }}
      >
      {items.map((it) => {
        const vid = it.id.videoId;
        const thumb = it.snippet.thumbnails?.medium?.url;
        const href = vid ? `https://www.youtube.com/watch?v=${vid}` : "#";

        return (
        <Link
          key={`${vid}-${it.snippet.publishedAt}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{
          textDecoration: "none",
          color: "inherit",
          border: "1px solid #ddd",
          borderRadius: 1.5,
          overflow: "hidden",
          }}
        >
          {thumb && <img src={thumb} alt="" style={{ width: "100%", display: "block" }} />}
          <Box sx={{ padding: 1.25 }}>
          <Box sx={{ fontWeight: 600, lineHeight: 1.2 }}>{it.snippet.title}</Box>
          <Box sx={{ opacity: 0.7, marginTop: 0.75 }}>{it.snippet.channelTitle}</Box>
          <Box sx={{ opacity: 0.7, marginTop: 0.75 }}>{it.snippet.publishedAt}</Box>
          </Box>
        </Link>
        );
        })}
      </Box>
    </Container>
  );
}
