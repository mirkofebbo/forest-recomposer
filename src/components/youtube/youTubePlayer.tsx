import { useEffect, useRef } from "react";
import loadYouTubeIframeAPI from "./loadYouTubeIframeAPI";

type Props = {
    videoId?: string;
    onPlayerReady?: (player: any) => void; 
};

export default function YouTubePlayer({ videoId, onPlayerReady }: Props) {
    const containerIdRef = useRef(`yt-${Math.random().toString(16).slice(2)}`);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const YT = await loadYouTubeIframeAPI();
            if (!mounted) return;

            playerRef.current = new YT.Player(containerIdRef.current, {
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

    return <div id={containerIdRef.current} style={{ width: "100%", height: "100%" }} />;
}