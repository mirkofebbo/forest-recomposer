import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Container, Typography, Box, Card, CardMedia, Chip, IconButton, Tooltip, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Manifest, Clip } from "../types";


function ytThumb(videoId: string) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export default function CompletedListWindow({
    mode,
    manifestData,
    setManifestData,
    onOpenVideoModal,
    onResumeEdit,
    onDeleteClip,
    onSelectClip,
}: {
    mode?: string;
    manifestData?: Manifest;
    setManifestData?: Dispatch<SetStateAction<Manifest>>;
    onOpenVideoModal: (videoId: string, start?: number, end?: number | null) => void;
    onResumeEdit: (videoId: string) => void;
    onDeleteClip: (videoId: string, clipId: string) => void;
    onSelectClip: (videoId: string, clip: Clip) => void;
}) {
    const completed = manifestData?.completed ?? [];

    const sorted = useMemo(
        () => [...completed].sort((a, b) => (b.clips?.length ?? 0) - (a.clips?.length ?? 0)),
        [completed]
    );

    return (
        <Container
            maxWidth={false}
            sx={[
                mode === "DEBUG" && { border: "3px solid orange", borderRadius: 1 },
                { height: "100%", display: "flex", flexDirection: "column", py: 2, minHeight: 0 },
            ]}
        >
            <Typography variant="h4" gutterBottom>
                To Recompose
            </Typography>

            {sorted.length === 0 ? (
                <Box sx={{ opacity: 0.7 }}>No completed videos yet.</Box>
            ) : (
                <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 0.5 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1.25 }}>
                        {sorted.map((video) => {
                            const vid = video.videoId ?? "";
                            const clips = video.clips ?? [];
                            const thumb = vid ? ytThumb(vid) : "";

                            return (
                                <Card key={vid} sx={{ p: 1 }}>
                                    {/* Video header */}
                                    <Box sx={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 1 }}>
                                        {/* Thumbnail*/}
                                        <Box
                                            onClick={() => vid && onResumeEdit(vid)}
                                            sx={{
                                                borderRadius: 1.5,
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                "&:hover": { transform: "translateY(-1px)" },
                                            }}
                                            title="Send back to Edit Window"
                                        >
                                            <CardMedia component="img" image={thumb} alt={video.title ?? ""} sx={{ aspectRatio: "16 / 9" }} />
                                        </Box>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }} noWrap>
                                                {video.title ?? "Untitled video"}
                                            </Typography>

                                            <Box sx={{ mt: 0.75, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                                <Chip size="small" label={`${clips.length} clip${clips.length === 1 ? "" : "s"}`} />
                                                <Tooltip title="Play full video">
                                                    <Chip
                                                        size="small"
                                                        icon={<PlayArrowIcon />}
                                                        label="Play"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenVideoModal(vid);
                                                        }}
                                                        sx={{ cursor: "pointer" }}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Clip list */}
                                    <Box marginTop={1}>
                                        {clips.map((clip) => (
                                            <Box
                                                key={clip.id}
                                                onClick={() => onOpenVideoModal(vid, clip.start, clip.end ?? null)}
                                                sx={{
                                                    position: "relative",
                                                    borderRadius: 1.5,
                                                    px: 1,
                                                    py: 0.85,
                                                    cursor: "pointer",
                                                    border: "1px solid",
                                                    // borderColor: "divider",
                                                    bgcolor: "primary.light",
                                                    "&:hover": { boxShadow: 2, transform: "translateY(-1px)" },
                                                }}
                                                marginTop={0.5}
                                                title="Open clip in modal"
                                            >
                                                {/* top-right controls */}
                                                <Box sx={{ position: "absolute", top: 2, right: 2, display: "flex", gap: 0.25 }}>
                                                    {/* + select */}
                                                    <Tooltip title="Select for next part">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onSelectClip(vid, clip);
                                                            }}
                                                            sx={{ "&:hover": { boxShadow: 2, backgroundColor: "success.light" }, }}
                                                        >
                                                            <AddIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {/*delete */}
                                                    <Tooltip title="Delete clip">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteClip(vid, clip.id);
                                                            }}
                                                            sx={{ "&:hover": { boxShadow: 2, backgroundColor: "error.light" }, }}
                                                        >
                                                            <CloseIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                {/* label */}
                                                <Box sx={{ fontSize: 12, fontWeight: 800, pr: 7 }}>
                                                    {clip.tags?.length ? (
                                                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                                            {clip.tags.map((t) => (
                                                                <Chip key={t} size="small" label={t} sx={{ fontSize: 10, backgroundColor: "secondary.light" }} />
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Typography>{clip.note || "No tags or note"}</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            )}
            <Button variant="contained" disabled={sorted.length === 0} sx={{ mt: "auto" }}>
                Ready to recompose? 
            </Button>
        </Container>
    );
}