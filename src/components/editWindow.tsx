import { useEffect, useState } from "react";
import { Container, Box } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { Manifest, Clip } from "../types";
import YouTubePlayer from "./youtube/youTubePlayer";
import TimecodeEditor from "./timecodeEditor";
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
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

    useEffect(() => {
        if (!player) return;
        let raf = 0;
        let last = 0;

        const tick = () => {
            const t = Number(player.getCurrentTime?.() ?? 0);
            const d = Number(player.getDuration?.() ?? 0);

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

    const deleteClip = (clipId: string) => {
        if (!setManifestData) return;

        setManifestData(prev => {
            const current = prev.in_progress?.[0];
            if (!current) return prev;

            const clips = (current.clips ?? []).filter(c => c.id !== clipId);

            return {
                ...prev,
                in_progress: [{ ...current, clips }, ...(prev.in_progress?.slice(1) ?? [])],
            };
        });

        setSelectedClipId(prev => (prev === clipId ? null : prev));
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!selectedClipId) return;
            if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault();
                deleteClip(selectedClipId);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selectedClipId]);

    return (
        <Container sx={[mode === "DEBUG" && { border: "3px solid blue", borderRadius: 1 }, { height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }]}>
            <Box sx={{ mt: 2 }}>
                {/* Video Player area */}
                <Box sx={{ width: "100%", aspectRatio: "16 / 9", bgcolor: "black", borderRadius: 2, overflow: "hidden" }}>
                    {video?.videoId ? (
                        <YouTubePlayer videoId={video.videoId} onPlayerReady={setPlayer} />
                    ) : (
                        <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "white", opacity: 0.8 }}>
                            No video selected
                        </Box>
                    )}
                </Box>
                 {/* Timeline area */}
                <Box sx={{ mt: 1.5 }}>
                    <VideoTimelineD3
                        duration={duration}
                        currentTime={currentTime}
                        start={draftStart}
                        end={draftEnd}
                        savedClips={video?.clips ?? []}
                        selectedClipId={selectedClipId}
                        onSelectClip={setSelectedClipId}
                        onSeek={(t) => player?.seekTo?.(t, true)}
                        onDeleteClip={deleteClip}
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
                    onDraftStartChange={setDraftStart}
                    onDraftEndChange={setDraftEnd}
                />
            </Box>
        </Container>
    );
}