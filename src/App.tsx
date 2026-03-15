import { useState, useEffect } from "react";
import { Box } from "@mui/material";

import EditListWindow from "./components/editListWindow";
import VideoSearch from "./components/videoSearchWindow";
import CompletedListWindow from "./components/completedListWindow";
import EditWindow from "./components/editWindow";
import VideoPlayerModal from "./components/modal/videoPlayerModal";
import RecomposeWindow from "./components/recomposeWindow";

import manifest from "../public/manifest.json";
import type { Manifest, RecomposeItem } from "./types";

const MODE: string = "";
const LEFT_PANE_WIDTH = "20%";
const CENTER_PANE_WIDTH = "60%";
const RIGHT_PANE_WIDTH = "20%";

export default function App() {
  const [manifestData, setManifestData] = useState<Manifest>(manifest as Manifest);
  const [isRecomposing, setIsRecomposing] = useState(false);

  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    videoId?: string;
    start?: number;
    end?: number | null;
    autoPlay?: boolean;
  }>({ open: false });

  const [selectedClips, setSelectedClips] = useState<
    { videoId: string; clipId: string; start: number; end: number | null; tags?: string[]; note?: string }[]
  >([]);


  const openVideo = (videoId: string, start?: number, end?: number | null) =>
    setVideoModal({ open: true, videoId, start, end, autoPlay: true, loop: false, muted: false });

  const closeVideo = () =>
    setVideoModal({ open: false, videoId: undefined, start: undefined, end: undefined, autoPlay: false });

  const addSelectedClip = (payload: {
    videoId: string;
    clipId: string;
    start: number;
    end: number | null;
    tags?: string[];
    note?: string;
  }) => {
    setSelectedClips((prev) => {
      const exists = prev.some((p) => p.videoId === payload.videoId && p.clipId === payload.clipId);
      return exists ? prev : [payload, ...prev];
    });

    setManifestData((prev) => {
      const recompose = prev.recompose ?? [];
      const exists = recompose.some((p) => p.videoId === payload.videoId && p.clipId === payload.clipId);
      if (exists) return prev;

      const sourceVideo =
        (prev.completed ?? []).find((v) => v.videoId === payload.videoId) ??
        (prev.in_progress ?? []).find((v) => v.videoId === payload.videoId) ??
        (prev.to_edit ?? []).find((v) => v.videoId === payload.videoId);

      const newItem: RecomposeItem = {
        videoId: payload.videoId,
        clipId: payload.clipId,
        title: sourceVideo?.title ?? "",
        channelTitle: sourceVideo?.channelTitle ?? "",
        publishedAt: sourceVideo?.publishedAt ?? "",
        thumbnailUrl: sourceVideo?.thumbnailUrl ?? "",
        start: payload.start,
        end: payload.end ?? null,
        tags: payload.tags,
        note: payload.note,
      };

      return { ...prev, recompose: [newItem, ...recompose] };
    });
  };

  const removeSelectedClip = (videoId: string, clipId: string) => {
    setSelectedClips((prev) => prev.filter((p) => !(p.videoId === videoId && p.clipId === clipId)));
  };

  const deleteCompletedClip = (videoId: string, clipId: string) => {
    setManifestData((prev) => {
      const completed = (prev.completed ?? []).map((v) => {
        if (v.videoId !== videoId) return v;
        return { ...v, clips: (v.clips ?? []).filter((c) => c.id !== clipId) };
      });
      return { ...prev, completed };
    });

    removeSelectedClip(videoId, clipId);
  };

  useEffect(() => {
    console.log("Manifest data updated:", manifestData);
  }, [manifestData]);

  const resumeEdit = (videoId: string) => {
    setManifestData(prev => {
      const completed = prev.completed ?? [];
      const found = completed.find(v => v.videoId === videoId);
      if (!found) return prev;
      setIsRecomposing(false);
      return {
        ...prev,
        completed: completed.filter(v => v.videoId !== videoId),
        // put it at the top of in_progress
        in_progress: [found, ...(prev.in_progress ?? [])],
        // optional: also remove from to_edit just in case
        to_edit: (prev.to_edit ?? []).filter(v => v.videoId !== videoId),
      };
    });
  };

  const onRecompose = () => {
    setIsRecomposing(true);
  }
  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw" }}>
        <Box sx={{ width: LEFT_PANE_WIDTH, height: "100%", backgroundColor: "primary.dark", margin: 1, borderRadius: 2 }}>
          <EditListWindow mode={MODE} manifestData={manifestData} setManifestData={setManifestData} onOpenVideoModal={openVideo} />
        </Box>

        <Box sx={{ width: CENTER_PANE_WIDTH, height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <Box sx={{ backgroundColor: "primary.dark", margin: 1, borderRadius: 2 }}>
            <VideoSearch mode={MODE} manifestData={manifestData} setManifestData={setManifestData} onOpenVideoModal={openVideo} />
          </Box>
          <Box sx={{ height: "100%", backgroundColor: "primary.dark", margin: 1, borderRadius: 2 }}>
            {isRecomposing ? (
              <RecomposeWindow mode={MODE} manifestData={manifestData} setManifestData={setManifestData} />
            ) : (
              <EditWindow mode={MODE} manifestData={manifestData} setManifestData={setManifestData} />
            )}
          </Box>

        </Box>

        <Box sx={{ width: RIGHT_PANE_WIDTH, height: "100%", backgroundColor: "primary.dark", margin: 1, borderRadius: 2 }}>
          <CompletedListWindow
            mode={MODE}
            manifestData={manifestData}
            setManifestData={setManifestData}
            onOpenVideoModal={openVideo}
            onResumeEdit={resumeEdit}
            onDeleteClip={deleteCompletedClip}
            onSelectClip={(videoId, clip) =>
              addSelectedClip({ videoId, clipId: clip.id, start: clip.start, end: clip.end ?? null, tags: clip.tags, note: clip.note })
            }
            onRecompose={onRecompose}
          />
        </Box>
      </Box>
      <VideoPlayerModal
        open={videoModal.open}
        videoId={videoModal.videoId}
        start={videoModal.start}
        end={videoModal.end}
        autoPlay={videoModal.autoPlay}
        onClose={closeVideo}
      />    </>

  );
}
