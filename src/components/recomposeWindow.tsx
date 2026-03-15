import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Box } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { Manifest, Clip, RecomposeItem } from "../types";
import YouTubePlayer from "./youtube/youTubePlayer";
import RecomposeTimelineD3 from "../components/recomposeTimelineD3";

export default function RecomposeWindow({
    mode,
    manifestData,
    setManifestData,
}: {
    mode?: string;
    manifestData?: Manifest;
    setManifestData?: Dispatch<SetStateAction<Manifest>>;
}) {
    const rawRecompose = manifestData?.recompose ?? [];
    const recomposeClips = useMemo(() => {
        if (!rawRecompose || rawRecompose.length === 0) return [] as RecomposeItem[];
        const first: any = rawRecompose[0] as any;
        if (first?.clips) {
            const flattened = (rawRecompose as any[]).flatMap((group) => group?.clips ?? []);
            return flattened as RecomposeItem[];
        }
        return rawRecompose as RecomposeItem[];
    }, [rawRecompose]);

    const keyedClips = useMemo(
        () =>
            recomposeClips.map((clip: any, index: number) => ({
                clip,
                clipId: clip.clipId ?? clip.id ?? `${clip.videoId ?? "vid"}-${index}`,
            })),
        [recomposeClips]
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const current = keyedClips[currentIndex];
    const currentClip = current?.clip;
    const currentClipId = current?.clipId ?? null;

    const autoAdvanceRef = useRef<string | null>(null);

    const [player, setPlayer] = useState<any | null>(null);

    // Playback state for timeline
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (currentIndex < keyedClips.length) return;
        setCurrentIndex(Math.max(0, keyedClips.length - 1));
    }, [currentIndex, keyedClips.length]);

    useEffect(() => {
        autoAdvanceRef.current = null;
        if (!player || !currentClip?.videoId) return;
        const start = Number(currentClip.start ?? 0);
        const handle = window.setTimeout(() => {
            try {
                player.seekTo?.(start, true);
                player.playVideo?.();
            } catch { }
        }, 200);
        return () => window.clearTimeout(handle);
    }, [player, currentClip?.videoId, currentClip?.start]);

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

            if (currentClip?.end != null && t >= Number(currentClip.end) && autoAdvanceRef.current !== currentClipId) {
                autoAdvanceRef.current = currentClipId;
                if (currentIndex + 1 < keyedClips.length) {
                    setCurrentIndex((prev) => Math.min(prev + 1, keyedClips.length - 1));
                } else {
                    try {
                        player?.pauseVideo?.();
                    } catch { }
                }
            }

            raf = window.requestAnimationFrame(tick);
        };

        raf = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player, currentClip?.end, currentIndex, keyedClips.length, duration]);

    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
    }, [currentClip?.videoId]);

    const removeRecomposeClip = (clipId: string, videoId?: string) => {
        if (!setManifestData) return;

        setManifestData((prev) => {
            const raw = prev.recompose ?? [];
            const normalized = (Array.isArray(raw) && (raw as any)[0]?.clips)
                ? (raw as any[]).flatMap((group) => group?.clips ?? [])
                : raw;
            const filtered = (normalized as any[]).filter((c, index) => {
                const id = c?.clipId ?? c?.id ?? `${c?.videoId ?? "vid"}-${index}`;
                if (videoId && c?.videoId !== videoId) return true;
                return id !== clipId;
            });
            return { ...prev, recompose: filtered as RecomposeItem[] };
        });
    };

    const savedClips: Clip[] = useMemo(() => {
        if (!currentClip?.videoId) return [];
        return keyedClips
            .filter((c) => c.clip?.videoId === currentClip.videoId)
            .map((c) => ({
                id: c.clipId,
                start: c.clip.start,
                end: c.clip.end ?? null,
                tags: c.clip.tags,
                note: c.clip.note,
            }));
    }, [currentClip?.videoId, keyedClips]);

    const reorderClips = (dragIndex: number, targetIndex: number) => {
        if (dragIndex === targetIndex) return;

        if (setManifestData) {
            setManifestData((prev) => {
                const raw = prev.recompose ?? [];
                const normalized = (Array.isArray(raw) && (raw as any)[0]?.clips)
                    ? (raw as any[]).flatMap((group) => group?.clips ?? [])
                    : raw;
                const newClips = [...normalized] as RecomposeItem[];
                
                if (dragIndex < 0 || dragIndex >= newClips.length) return prev;
                
                const [moved] = newClips.splice(dragIndex, 1);
                newClips.splice(targetIndex, 0, moved);

                return { ...prev, recompose: newClips };
            });
            
            setTimeout(() => {
                if (currentIndex === dragIndex) {
                    setCurrentIndex(targetIndex);
                } else if (currentIndex > dragIndex && currentIndex <= targetIndex) {
                    setCurrentIndex(prev => prev - 1);
                } else if (currentIndex < dragIndex && currentIndex >= targetIndex) {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 0);
        }
    };

    return (
        <Container sx={[mode === "DEBUG" && { border: "3px solid blue", borderRadius: 1 }, { height: "100%", display: "flex", flexDirection: "column" }]}>
            <Box sx={{ mt: 2 }}>
                {/* Video Player area */}
                <Box sx={{ width: "100%", aspectRatio: "16 / 9", bgcolor: "black", borderRadius: 2, overflow: "hidden" }}>
                    {currentClip?.videoId ? (
                        <YouTubePlayer videoId={currentClip.videoId} onPlayerReady={setPlayer} />
                    ) : (
                        <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "white", opacity: 0.8 }}>
                            No clips selected for recompose
                        </Box>
                    )}
                </Box>
                {/* Timeline area */}
                
            </Box>

            {/* Clip list area */}
            <Box sx={{ mt: 2, flex: 1, minHeight: 0, p: 2, borderRadius: 1, border: mode === "DEBUG" ? "3px solid orange" : "none" }}>
                {keyedClips.length === 0 ? (
                    <Box sx={{ opacity: 0.7 }}>No clips to recompose yet.</Box>
                ) : (
                    <RecomposeTimelineD3 
                        clips={keyedClips.map((k) => ({
                            clipId: k.clipId,
                            videoId: k.clip.videoId || "",
                            title: k.clip.title || "",
                            start: k.clip.start ?? 0,
                            end: k.clip.end ?? null,
                            tags: k.clip.tags ?? [],
                            note: k.clip.note,
                            duration: Math.max(0.5, (k.clip.end ?? ((k.clip.start ?? 0) + 10)) - (k.clip.start ?? 0))
                        }))}
                        currentIndex={currentIndex}
                        onSelectClip={setCurrentIndex}
                        onReorderClips={reorderClips}
                        height={80}
                    />
                )}
            </Box>
        </Container>
    );
}