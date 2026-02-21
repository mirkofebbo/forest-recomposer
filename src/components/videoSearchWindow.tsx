import React, { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Container, Typography, Box, CardContent, Card, CardMedia, CardActions, Button, Input, Slide, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { searchYouTubeVideos } from "./youtube/youtubeSearch";
import type { Manifest, YouTubeSearchItem } from "../types";

export default function VideoSearch({
  mode,
  manifestData,
  setManifestData,
  onOpenVideoModal,
}: {
  mode?: string;
  manifestData?: Manifest;
  setManifestData?: Dispatch<SetStateAction<Manifest>>;
  onOpenVideoModal: (videoId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const open = loading || items.length > 0 || error !== "";

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

  function closeResults() {
    setItems([]);
    setError("");
    setLoading(false);
    setQuery("");
  }

  function addToManifest(video: YouTubeSearchItem) {
    if (!video.id.videoId) return;
    if (!manifestData || !setManifestData) return;
    if (manifestData.to_edit.find((v) => v.videoId === video.id.videoId)) {
      return;
    }

    const newVideoItem = {
      videoId: video.id.videoId,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails?.medium?.url || "",
      clips: [],
    };

    setManifestData({
      ...manifestData,
      to_edit: [...manifestData.to_edit, newVideoItem],
    });
  }

  return (
    <>
      {/* Search input */}
      <Container sx={[mode === "DEBUG" && { border: '3px solid green', borderRadius: 2 }, { height: "auto" }]}>
        <Box component="form" onSubmit={onSearch} sx={{ display: "flex", gap: 1, marginTop: 2 }}>
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
      </Container>
      {/* Search results modal */}
      <Slide direction="down" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            bgcolor: "background.paper",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            boxShadow: 6,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography fontWeight={700}>
              {loading ? "Searching…" : `Results for “${query}”`}
            </Typography>

            <IconButton onClick={closeResults}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Scrollable results */}
          <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 1.5,
              }}
            >
              {items.map((it) => {
                const vid = it.id.videoId;
                const thumb = it.snippet.thumbnails?.medium?.url;
                const href = vid ? `https://www.youtube.com/watch?v=${vid}` : "#";

                return (
                  <Card
                    key={`${vid}-${it.snippet.publishedAt}`}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      cursor: href ? "pointer" : "default",
                      opacity: href ? 1 : 0.6,
                      textDecoration: "none",
                      "&:hover": {
                        boxShadow: href ? 3 : 1,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={thumb || ""}
                      alt={it.snippet.title ?? ""}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (vid) onOpenVideoModal(vid);
                      }}
                      sx={{
                        aspectRatio: "16 / 9",
                        bgcolor: "#f2f2f2",
                        display: thumb ? "block" : "none",
                      }}
                    />
                    {!thumb && (
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "16 / 9",
                          bgcolor: "#f2f2f2",
                          display: "grid",
                          placeItems: "center",
                          opacity: 0.7,
                        }}
                      >
                        No thumbnail
                      </Box>
                    )}
                    {/* Title and channel */}
                    <CardContent sx={{ p: 1.25 }}>
                      <Box sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {it.snippet.title}
                      </Box>
                      <Box sx={{ opacity: 0.7, mt: 0.75 }}>
                        {it.snippet.channelTitle}
                      </Box>
                    </CardContent>

                    <Box sx={{ flexGrow: 1 }} />
                    {/* Add to edit list button */}
                    <CardActions sx={{ p: 1.25, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={(e) => {
                          e.preventDefault();
                          addToManifest(it);
                        }}
                      >
                        add
                      </Button>
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Slide>
    </>
  );
}
