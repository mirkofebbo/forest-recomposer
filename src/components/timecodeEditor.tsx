import { useState } from "react";
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from "@mui/material";
import type { Clip, VideoItem, TagList } from "../types";

const TAG_OPTIONS: TagList[] = ["GREEN", "HUMAN", "WATER", "ANIMAL", "SUNLIGHT", "SOIL", "OTHER"];

function fmt(t: number) {
    const s = Math.floor(t % 60);
    const m = Math.floor((t / 60) % 60);
    const h = Math.floor(t / 3600);
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function makeId() {
    return `clip_${Math.random().toString(4).slice(2)}_${Date.now()}`;
}

export default function TimecodeEditor({
    player,
    video,
    onSaveClip,
    onSaveVideo,
    onDraftStartChange,
    onDraftEndChange,
}: {
    player: any | null;
    video: VideoItem | undefined;
    onSaveClip: (clip: Clip) => void;
    onSaveVideo?: (videoItem: VideoItem) => void;
    onDraftStartChange?: (t: number | null) => void;
    onDraftEndChange?: (t: number | null) => void;
}) {
    const [start, setStart] = useState<number | null>(null);
    const [end, setEnd] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [tags, setTags] = useState<TagList[]>(["OTHER"]);

    const canUse = Boolean(player && video?.videoId);
    const canSave = Boolean(canUse && (video?.clips?.length ?? 0) > 0);

    const now = () => (player ? Number(player.getCurrentTime?.() ?? 0) : 0);

    const swapIfNeeded = (a: number, b: number) => (a <= b ? [a, b] : [b, a]);

    const save = () => {
        if (!video?.videoId || start == null) return;

        const duration = Number(player?.getDuration?.() ?? 0);

        let clipStart = start;
        let clipEnd: number | null = end;

        if (clipEnd != null) {
            const [s, e] = swapIfNeeded(clipStart, clipEnd);
            clipStart = s;
            clipEnd = e;
        }

        clipStart = Math.max(0, Math.min(clipStart, duration || clipStart));
        if (clipEnd != null) clipEnd = Math.max(0, Math.min(clipEnd, duration || clipEnd));

        onSaveClip({
            id: makeId(),
            start: Number(clipStart.toFixed(2)),
            end: clipEnd == null ? null : Number(clipEnd.toFixed(2)),
            tags: tags,
            note: note.trim() || "",
        });

        setStart(null);
        setEnd(null);
        setNote("");
        setTags(["OTHER"]);
    };

    const saveEditToManifestComplete = () => {
        if (!video) return;
        onSaveVideo?.(video);
        setStart(null);
        setEnd(null);
        setNote("");
        setTags(["OTHER"]);
    };

    return (
        <Box sx={{ display: "grid", gap: 1.25, backgroundColor: "background.paper", padding: 2, borderRadius: 2, opacity: canUse ? 1 : 0.7 }}>
            {/* Timecode edit window */}
            {/* General Control area */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Button variant="contained" disabled={!canUse} onClick={() => {
                    const t = now();
                    setStart(t);
                    onDraftStartChange?.(t);
                }}>
                    Set Start
                </Button>
                <Button variant="contained" disabled={!canUse} onClick={() => {
                    const t = now();
                    setEnd(t);
                    onDraftEndChange?.(t);
                }}>
                    Set End
                </Button>
                <Button
                    variant="outlined"
                    disabled={!canUse || start == null}
                    onClick={() => {
                        if (start == null) return;
                        player.seekTo(start, true);
                        player.playVideo();
                    }}
                >
                    Preview from Start
                </Button>
                <Button color="success" variant="contained" disabled={!canUse || end == null} onClick={save}>
                    Save Clip
                </Button>
                <Button color="success" variant="contained" disabled={!canSave} onClick={() => saveEditToManifestComplete()}>
                    Save Video
                </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                {/* Tags Option */}
                <FormControl size="small" sx={{ minWidth: 260 }} disabled={!canUse} focused>
                    <InputLabel id="clip-tags-label" sx={{ color: "primary.dark" }}>Tags</InputLabel>
                    <Select<TagList[]>
                        labelId="clip-tags-label"
                        multiple
                        value={tags}
                        onChange={(e) => setTags(e.target.value as TagList[])}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                {selected.map((t) => <Chip key={t} size="small" label={t} />)}
                            </Box>
                        )}
                    >
                        {TAG_OPTIONS.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Start and stop timecode */}
                <Box sx={{ opacity: canUse ? 1 : 0.7 }}>
                    <strong>Start:</strong> {start == null ? "—" : `${fmt(start)} (${start.toFixed(2)}s)`}{" "}
                    <strong style={{ marginLeft: 12 }}>End:</strong> {end == null ? "END" : `${fmt(end)} (${end.toFixed(2)}s)`}
                </Box>
            </Box>
            {/* Notes Option */}
            <TextField
                label="Note (optional)"
                variant="outlined"
                size="small"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!canUse}
                focused
            />
        </Box>
    );
}