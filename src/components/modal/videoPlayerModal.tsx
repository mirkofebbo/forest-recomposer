import React, { useEffect, useMemo, useState } from "react";
import { Modal, Box, Typography, IconButton, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import YouTubePlayer from "../youtube/youTubePlayer"; // adjust path if needed

function fmtSec(t: number) {
  const s = Math.floor(t % 60);
  const m = Math.floor((t / 60) % 60);
  const h = Math.floor(t / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function VideoPlayerModal({
  open,
  videoId,
  start,
  end,
  autoPlay = false,
  // optional behavior knobs (super useful with hover)
  loop = false,
  muted = false,
  onClose,
}: {
  open: boolean;
  videoId?: string;
  start?: number;
  end?: number | null;
  autoPlay?: boolean;
  loop?: boolean;      // hover preview => true
  muted?: boolean;     // hover preview => true
  onClose: () => void;
}) {
  const [player, setPlayer] = useState<any | null>(null);

  // Reset player ref when closing / switching videos (prevents stale control calls)
  useEffect(() => {
    if (!open) setPlayer(null);
  }, [open]);

  const rangeLabel = useMemo(() => {
    if (start == null && end == null) return null;
    const a = start == null ? "0:00" : fmtSec(start);
    const b = end == null ? "END" : fmtSec(end);
    return `${a} → ${b}`;
  }, [start, end]);

  // On open / when ready: seek to start and play (optional)
  useEffect(() => {
    if (!open || !player) return;

    try {
      if (muted) player.mute?.();
      else player.unMute?.();
    } catch {}

    if (start != null) {
      try {
        player.seekTo?.(start, true);
      } catch {}
    }

    if (autoPlay) {
      try {
        player.playVideo?.();
      } catch {}
    }
  }, [open, player, start, autoPlay, muted]);

  // Enforce end boundary (pause or loop)
  useEffect(() => {
    if (!open || !player) return;
    if (end == null) return;

    let raf = 0;
    const tick = () => {
      const t = Number(player.getCurrentTime?.() ?? 0);

      if (t >= end) {
        if (loop) {
          // loop back to start (or 0)
          const s = start ?? 0;
          player.seekTo?.(s, true);
          player.playVideo?.();
        } else {
          player.pauseVideo?.();
        }
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, player, start, end, loop]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Clip Preview
            </Typography>
            {rangeLabel && <Chip size="small" label={rangeLabel} />}
            {loop && <Chip size="small" label="LOOP" />}
            {muted && <Chip size="small" label="MUTED" />}
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Video content */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            bgcolor: "black",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {videoId ? (
            <YouTubePlayer
              key={videoId}              // important: force rebuild when switching videos
              videoId={videoId}
              onPlayerReady={setPlayer}
            />
          ) : (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "white", opacity: 0.8 }}>
              No video selected
            </Box>
          )}
        </Box>

        {/* Optional info */}
        <Typography sx={{ mt: 1, fontSize: 13, opacity: 0.75 }}>
          Video ID: {videoId ?? "none"}
        </Typography>
      </Box>
    </Modal>
  );
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 820,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  outline: "none",
};