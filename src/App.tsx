import { useState, useEffect } from "react";
import { Box } from "@mui/material";

import EditListWindow from "./components/editListWindow";
import VideoSearch from "./components/videoSearchWindow";
import CompletedListWindow from "./components/completedListWindow";
import EditWindow from "./components/editWindow";
import VideoPlayerModal from "./components/modal/videoPlayerModal";

import manifest from "../public/manifest.json";
import type { Manifest } from "./types";

const MODE: string = "";
const LEFT_PANE_WIDTH = "20%";
const CENTER_PANE_WIDTH = "60%";
const RIGHT_PANE_WIDTH = "20%";

export default function App() {
  const [manifestData, setManifestData] = useState<Manifest>(manifest as Manifest);
  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    videoId?: string;
    start?: number;
    end?: number | null;
    autoPlay?: boolean;
  }>({ open: false });

  const openVideo = (videoId: string, start?: number, end?: number | null) =>
    setVideoModal({ open: true, videoId, start, end, autoPlay: true });

  const closeVideo = () =>
    setVideoModal({ open: false, videoId: undefined, start: undefined, end: undefined, autoPlay: false });

  useEffect(() => {
    console.log("Manifest data updated:", manifestData);
  }, [manifestData]);

  const resumeEdit = (videoId: string) => {
    setManifestData(prev => {
      const completed = prev.completed ?? [];
      const found = completed.find(v => v.videoId === videoId);
      if (!found) return prev;

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
            <EditWindow mode={MODE} manifestData={manifestData} setManifestData={setManifestData} />
          </Box>

        </Box>

        <Box sx={{ width: RIGHT_PANE_WIDTH, height: "100%", backgroundColor: "primary.dark", margin: 1, borderRadius: 2 }}>
          <CompletedListWindow
            mode={MODE}
            manifestData={manifestData}
            setManifestData={setManifestData}
            onOpenVideoModal={openVideo}
            onResumeEdit={resumeEdit}
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
