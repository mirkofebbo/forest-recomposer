import { useEffect, useRef } from "react";
import loadYouTubeIframeAPI from "./loadYouTubeIframeAPI";

type Props = {
    videoId?: string;
    onPlayerReady?: (player: any) => void; 
};

export default function YouTubePlayer({ videoId, onPlayerReady }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const YT = await loadYouTubeIframeAPI();
            if (!mounted) return;
            if (!containerRef.current) return;

            // Create a disposable element for the YouTube API to safely replace
            // without confusing React's unmount tree.
            const ytNode = document.createElement("div");
            containerRef.current.appendChild(ytNode);

            playerRef.current = new YT.Player(ytNode, {
                width: "100%",
                height: "100%",
                videoId: videoId || undefined,
                playerVars: {
                    playsinline: 1,
                    rel: 0,
                    modestbranding: 1,
                },
                events: {
                    onReady: () => onPlayerReady?.(playerRef.current),
                },
            });
        })();

        return () => {
            mounted = false;
            try {
                playerRef.current?.destroy?.();
            } catch { }
        };
    }, []);

    useEffect(() => {
        if (!playerRef.current) return;
        if (!videoId) return;
        playerRef.current.loadVideoById({ videoId });
    }, [videoId]);

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}