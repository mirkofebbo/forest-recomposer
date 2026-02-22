import React, { useMemo, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Container, Typography, Box, Card, CardMedia, Chip } from "@mui/material";
import type { Manifest, Clip } from "../types";

function fmtSec(t: number) {
    const s = Math.floor(t % 60);
    const m = Math.floor((t / 60) % 60);
    const h = Math.floor(t / 3600);
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function clipRangeLabel(start: number, end: number | null | undefined) {
    return `${fmtSec(start)} → ${end == null ? "END" : fmtSec(end)}`;
}
function ytThumb(videoId: string) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export default function CompletedListWindow({
    mode,
    manifestData,
    setManifestData,
    onOpenVideoModal,
    onResumeEdit,
}: {
    mode?: string;
    manifestData?: Manifest;
    setManifestData?: Dispatch<SetStateAction<Manifest>>;
    onOpenVideoModal: (videoId: string, start?: number, end?: number | null) => void;
    onResumeEdit: (videoId: string) => void;
}) {
    const completed = manifestData?.completed ?? [];
    const sorted = useMemo(
        () => [...completed].sort((a, b) => (b.clips?.length ?? 0) - (a.clips?.length ?? 0)),
        [completed]
    );

    // debounce hover preview so it feels intentional
    const hoverTimer = useRef<number | null>(null);
    const clearHoverTimer = () => {
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
    };

    return (
        <Container
            maxWidth={false}
            sx={[
                mode === "DEBUG" && { border: "3px solid orange", borderRadius: 1 },
                { height: "100%", display: "flex", flexDirection: "column", py: 2, minHeight: 0 },
            ]}
        >
            <Typography variant="h4" gutterBottom>
                Completed
            </Typography>

            {sorted.length === 0 ? (
                <Box sx={{ opacity: 0.7 }}>No completed videos yet.</Box>
            ) : (
                <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 0.5 }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 1.25,
                            alignContent: "start",
                        }}
                    >
                        {sorted.map((video) => {
                            const vid = video.videoId ?? "";
                            const clips = video.clips ?? [];
                            const thumb = vid ? ytThumb(vid) : "";

                            return (
                                <Card key={vid} sx={{ p: 1 }}>
                                    {/* top row: thumbnail + title */}
                                    <Box sx={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 1 }}>
                                        <Box
                                            sx={{
                                                borderRadius: 1.5,
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                "&:hover": { transform: "translateY(-1px)" },
                                            }}
                                            title="Send back to Edit Window"
                                            onClick={() => vid && onResumeEdit(vid)}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={thumb}
                                                alt={video.title ?? ""}
                                                sx={{ aspectRatio: "16 / 9", display: thumb ? "block" : "none" }}
                                            />
                                            {!thumb && (
                                                <Box sx={{ aspectRatio: "16 / 9", bgcolor: "action.hover" }} />
                                            )}
                                        </Box>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }} noWrap>
                                                {video.title ?? "Untitled video"}
                                            </Typography>
                                            <Box sx={{ mt: 0.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                <Chip size="small" label={`${clips.length} clip${clips.length === 1 ? "" : "s"}`} />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* clips grid (smaller tiles) */}
                                    <Box
                                        sx={{
                                            mt: 1,
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                                            gap: 0.75,
                                        }}
                                    >
                                        {clips.map((clip) => (
                                            <Box
                                                key={clip.id}
                                                onMouseEnter={() => {
                                                    clearHoverTimer();
                                                    hoverTimer.current = window.setTimeout(() => {
                                                        // hover preview: open modal at start/end
                                                        onOpenVideoModal(vid, clip.start, clip.end ?? null);
                                                    }, 250);
                                                }}
                                                onMouseLeave={clearHoverTimer}
                                                onClick={() => onOpenVideoModal(vid, clip.start, clip.end ?? null)}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    p: 0.75,
                                                    cursor: "pointer",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                    "&:hover": {
                                                        transform: "translateY(-1px)",
                                                        boxShadow: 2,
                                                    },
                                                }}
                                                title="Click to open clip in modal"
                                            >
                                                <Box sx={{ fontSize: 12, fontWeight: 800 }}>
                                                    {clipRangeLabel(clip.start, clip.end)}
                                                </Box>

                                                {/* optional: show only 1 tag */}
                                                {(clip.tags?.[0] ?? null) && (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip size="small" label={clip.tags![0]} />
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Container>
    );
}