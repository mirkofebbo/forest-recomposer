import React, { useEffect, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { Manifest, Clip } from "../types";
import  YouTubePlayer  from "./youtube/youTubePlayer";
import TimecodeEditor  from "./timecodeEditor";
import VideoTimelineD3 from "../components/videoTimelineD3";

export default function EditWindow({
    mode,
    manifestData,
    setManifestData,
}: {
    mode?: string;
    manifestData?: Manifest;
    setManifestData?: Dispatch<SetStateAction<Manifest>>;
}) {
    const video = manifestData?.in_progress?.[0];
    const [player, setPlayer] = useState<any | null>(null);

    // Timecode editor local state (so timeline can show start/end as you set them)
    const [draftStart, setDraftStart] = useState<number | null>(null);
    const [draftEnd, setDraftEnd] = useState<number | null>(null);

    // Playback state for timeline
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Poll player time (simple + reliable)
    useEffect(() => {
        if (!player) return;
        let raf = 0;
        let last = 0;

        const tick = () => {
            const t = Number(player.getCurrentTime?.() ?? 0);
            const d = Number(player.getDuration?.() ?? 0);

            // reduce re-renders a bit
            if (Math.abs(t - last) > 0.05) {
                setCurrentTime(t);
                last = t;
            }
            if (d && Math.abs(d - duration) > 0.5) setDuration(d);

            raf = window.requestAnimationFrame(tick);
        };

        raf = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player]);

    // Reset draft markers when video changes
    useEffect(() => {
        setDraftStart(null);
        setDraftEnd(null);
        setCurrentTime(0);
        setDuration(0);
    }, [video?.videoId]);

    const saveClipToManifest = (clip: Clip) => {
        if (!setManifestData) return;

        setManifestData((prev) => {
            const current = prev.in_progress?.[0];
            if (!current) return prev;

            const nextVideo = {
                ...current,
                clips: [...(current.clips ?? []), clip],
            };

            return {
                ...prev,
                in_progress: [nextVideo, ...(prev.in_progress?.slice(1) ?? [])],
            };
        });

        // reset markers after saving
        setDraftStart(null);
        setDraftEnd(null);
    };

    return (
        <Container sx={[mode === "DEBUG" && { border: "3px solid blue", borderRadius: 1 }, { height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }]}>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Edit Window
                </Typography>

                <Box sx={{ width: "100%", aspectRatio: "16 / 9", bgcolor: "black", borderRadius: 2, overflow: "hidden" }}>
                    {video?.videoId ? (
                        <YouTubePlayer videoId={video.videoId} onPlayerReady={setPlayer} />
                    ) : (
                        <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "white", opacity: 0.8 }}>
                            No video selected
                        </Box>
                    )}
                </Box>

                <Box sx={{ mt: 1.5 }}>
                    <VideoTimelineD3
                        duration={duration}
                        currentTime={currentTime}
                        start={draftStart}
                        end={draftEnd}
                        savedClips={video?.clips ?? []}
                        onSeek={(t) => player?.seekTo?.(t, true)}
                        height={70}
                    />
                </Box>
            </Box>

            {/* Editor area */}
            <Box sx={{ mt: 2, flex: 1, minHeight: 0, overflow: "auto", p: 2, borderRadius: 1, border: mode === "DEBUG" ? "3px solid orange" : "none" }}>
                <TimecodeEditor
                    player={player}
                    video={video}
                    onSaveClip={saveClipToManifest}
                    // 👇 Add these two optional props to TimecodeEditor (small tweak)
                    onDraftStartChange={setDraftStart}
                    onDraftEndChange={setDraftEnd}
                />
            </Box>
        </Container>
    );
}