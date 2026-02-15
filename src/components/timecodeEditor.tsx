import React, { useState } from "react";
import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
    return `clip_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function TimecodeEditor({
    player,
    video,
    onSaveClip,
    onDraftStartChange,
    onDraftEndChange,
}: {
    player: any | null;
    video: VideoItem | undefined;
    onSaveClip: (clip: Clip) => void;
    onDraftStartChange: (start: number | null) => void;
    onDraftEndChange: (end: number | null) => void;
}) {
    const [start, setStart] = useState<number | null>(null);
    const [end, setEnd] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [tags, setTags] = useState<TagList[]>(["OTHER"]);

    const canUse = Boolean(player && video?.videoId);

    const now = () => (player ? Number(player.getCurrentTime?.() ?? 0) : 0);

    const setStartNow = () => {
        const t = now();
        setStart(t);
        onDraftStartChange?.(t);
    };
    const setEndNow = () => {
        const t = now();
        setEnd(t);
        onDraftEndChange?.(t);
    };

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

        // clamp
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

    return (
        <Box sx={{ display: "grid", gap: 1.25 }}>
            <Typography variant="h6">Timecode Edit Window</Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Button variant="contained" disabled={!canUse} onClick={setStartNow}>
                    Set Start
                </Button>
                <Button variant="contained" disabled={!canUse} onClick={setEndNow}>
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
                <Button color="success" variant="contained" disabled={!canUse || start == null} onClick={save}>
                    Save Clip
                </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 180 }} disabled={!canUse}>
                    <InputLabel id="clip-tag-label">Tag</InputLabel>
                    <Select<TagList[]>
                        multiple
                        value={tags}
                        onChange={(e) => setTags(e.target.value as TagList[])}
                        renderValue={(selected) => selected.join(", ")}
                    >
                        {TAG_OPTIONS.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ opacity: canUse ? 1 : 0.7 }}>
                    <strong>Start:</strong> {start == null ? "—" : `${fmt(start)} (${start.toFixed(2)}s)`}{" "}
                    <strong style={{ marginLeft: 12 }}>End:</strong> {end == null ? "END" : `${fmt(end)} (${end.toFixed(2)}s)`}
                </Box>
            </Box>

            <TextField
                size="small"
                label="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!canUse}
            />
        </Box>
    );
}