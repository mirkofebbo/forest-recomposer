import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

import EditListWindow from "./components/editListWindow";
import VideoSearch from "./components/videoSearchWindow";
import CompletedListWindow from "./components/completedListWindow";
import EditWindow from "./components/editWindow";
import VideoPlayerModal from "./components/modal/videoPlayerModal";

import manifest from "../public/manifest.json";
import type { Manifest } from "./types";

const MODE: string = "DEBUG";
const LEFT_PANE_WIDTH = "20%";
const CENTER_PANE_WIDTH = "60%";
const RIGHT_PANE_WIDTH = "20%";

export default function App() {
  const [manifestData, setManifestData] = useState<Manifest>(manifest as Manifest);
  const [videoModal, setVideoModal] = useState<{ open: boolean; videoId?: string }>({ open: false });

  const openVideo = (videoId: string) => setVideoModal({ open: true, videoId });
  const closeVideo = () => setVideoModal({ open: false, videoId: undefined });


  useEffect(() => {
    console.log("Manifest data updated:", manifestData);
  }, [manifestData]);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw" }}>
        <Box sx={{ width: LEFT_PANE_WIDTH, height: "100%" }}>
          <EditListWindow mode={MODE} manifestData={manifestData} setManifestData={setManifestData} onOpenVideoModal={openVideo} />
        </Box>

        <Box sx={{ width: CENTER_PANE_WIDTH, height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <Box>
            <VideoSearch mode={MODE} manifestData={manifestData} setManifestData={setManifestData} />
          </Box>
          <Box sx={{ height: "100%" }}>
            <EditWindow mode={MODE} />
          </Box>

        </Box>

        <Box sx={{ width: RIGHT_PANE_WIDTH, height: "100%" }}>
          <CompletedListWindow mode={MODE} />
        </Box>
      </Box>
      <VideoPlayerModal open={videoModal.open} videoId={videoModal.videoId} onClose={closeVideo} />
    </>

  );
}
