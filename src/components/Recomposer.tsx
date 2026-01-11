import React, { useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";
import type { Fragment } from "../data/library";

type Mode =
  | "popularity"
  | "algorithmic-ranking"
  | "species-visibility"
  | "emotional-tone"
  | "colonial-traces"
  | "time-of-day"
  | "restoration-discourse";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function fragmentDuration(f: Fragment) {
  return Math.max(0.25, f.end - f.start);
}

export default function Recomposer({
  fragments,
  getViewCount,
}: {
  fragments: Fragment[];
  // optional: lookup viewcount by youtubeId (can be undefined early on)
  getViewCount?: (youtubeId: string) => number | undefined;
}) {
  const playerRef = useRef<any | null>(null);
  const timerRef = useRef<number | null>(null);

  const [mode, setMode] = useState<Mode>("species-visibility");
  const [isPlaying, setIsPlaying] = useState(false);
  const [now, setNow] = useState<Fragment | null>(null);

  const ordered = useMemo(() => {
    const fs = [...fragments];

    switch (mode) {
      case "species-visibility":
        return fs.sort((a, b) => (b.speciesVisibility ?? 0) - (a.speciesVisibility ?? 0));

      case "emotional-tone": {
        const order: Record<string, number> = { calm: 0, awe: 1, tense: 2, sad: 3, angry: 4, unclear: 99 };
        return fs.sort((a, b) => (order[a.emotionalTone ?? "unclear"] - order[b.emotionalTone ?? "unclear"]));
      }

      case "time-of-day": {
        const order: Record<string, number> = { dawn: 0, day: 1, dusk: 2, night: 3, unclear: 99 };
        return fs.sort((a, b) => order[a.timeOfDay ?? "unclear"] - order[b.timeOfDay ?? "unclear"]);
      }

      case "restoration-discourse":
        // Example: cluster by whether discourse exists, then alphabetical
        return fs.sort((a, b) => {
          const aa = (a.restorationDiscourse?.length ?? 0) > 0 ? 0 : 1;
          const bb = (b.restorationDiscourse?.length ?? 0) > 0 ? 0 : 1;
          if (aa !== bb) return aa - bb;
          return (a.restorationDiscourse?.[0] ?? "").localeCompare(b.restorationDiscourse?.[0] ?? "");
        });

      case "colonial-traces":
        // Put fragments with traces first, then by number of traces
        return fs.sort((a, b) => {
          const aa = a.colonialTraces?.length ?? 0;
          const bb = b.colonialTraces?.length ?? 0;
          return bb - aa;
        });

      case "popularity": {
        if (!getViewCount) return fs; // no data yet
        return fs.sort((a, b) => (getViewCount(b.youtubeId) ?? 0) - (getViewCount(a.youtubeId) ?? 0));
      }

      case "algorithmic-ranking":
        // If you later store rank hints (1=top), smaller should come first
        return fs.sort((a, b) => (a.algRankHint ?? 9999) - (b.algRankHint ?? 9999));

      default:
        return fs;
    }
  }, [fragments, mode, getViewCount]);

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stop() {
    clearTimer();
    setIsPlaying(false);
  }

  function playFragment(f: Fragment) {
    const p = playerRef.current;
    if (!p) return;

    setNow(f);

    // Load correct video if needed
    // @ts-expect-error react-youtube player typing varies; methods exist on IFrame Player
    p.loadVideoById({ videoId: f.youtubeId, startSeconds: f.start });

    // Schedule jump to next fragment
    clearTimer();
    const ms = fragmentDuration(f) * 1000;

    timerRef.current = window.setTimeout(() => {
      if (!isPlayingRef.current) return;
      next();
    }, ms);
  }

  // Use ref to avoid stale closure in timer callback
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const idx = now ? ordered.findIndex((x) => x.id === now.id) : -1;

  function next() {
    const nextFrag = ordered[(idx + 1 + ordered.length) % ordered.length];
    playFragment(nextFrag);
  }

  function start() {
    if (ordered.length === 0) return;
    setIsPlaying(true);
    const first = now ?? ordered[0];
    playFragment(first);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Mode{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="popularity">popularity</option>
            <option value="algorithmic-ranking">algorithmic ranking</option>
            <option value="species-visibility">species visibility</option>
            <option value="emotional-tone">emotional tone</option>
            <option value="colonial-traces">colonial traces</option>
            <option value="time-of-day">time of day</option>
            <option value="restoration-discourse">restoration discourse</option>
          </select>
        </label>

        {!isPlaying ? (
          <button onClick={start}>Play recomposition</button>
        ) : (
          <button onClick={stop}>Stop</button>
        )}
        <button onClick={next} disabled={ordered.length === 0}>
          Next
        </button>

        <div style={{ opacity: 0.8 }}>
          {now ? (
            <>
              Now: <strong>{now.id}</strong> ({now.youtubeId} @ {now.start.toFixed(1)}s)
            </>
          ) : (
            <>No fragment selected</>
          )}
        </div>
      </div>

      <YouTube
        videoId={now?.youtubeId ?? ordered[0]?.youtubeId}
        opts={{
          width: "100%",
          height: "390",
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
          },
        }}
        onReady={(e) => {
          playerRef.current = e.target;
        }}
        onError={() => stop()}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {ordered.map((f) => {
          const active = now?.id === f.id;
          const s = clamp01(f.speciesVisibility ?? 0);
          return (
            <button
              key={f.id}
              onClick={() => {
                setIsPlaying(false);
                playFragment(f);
              }}
              style={{
                textAlign: "left",
                padding: 10,
                border: active ? "2px solid currentColor" : "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                background: "transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{f.id}</strong>
                <span style={{ opacity: 0.7 }}>{(f.end - f.start).toFixed(1)}s</span>
              </div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>{f.youtubeId}</div>
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                tone: {f.emotionalTone ?? "—"} · time: {f.timeOfDay ?? "—"} · species: {s.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
