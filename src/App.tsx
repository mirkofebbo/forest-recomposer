import React from "react";
import { Box } from "@mui/material";

import EditListWindow from "./components/editListWindow";
import VideoSearch from "./components/videoSearchWindow";
import CompletedListWindow from "./components/completedListWindow";
import EditWindow from "./components/editWindow";

const MODE: string = "DEBUG";
const LEFT_PANE_WIDTH = "20%";
const CENTER_PANE_WIDTH = "60%";
const RIGHT_PANE_WIDTH = "20%";

export default function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw" }}>
      <Box sx={{ width: LEFT_PANE_WIDTH, height: "100%" }}>
        <EditListWindow mode={MODE} />
      </Box>

      <Box sx={{ width: CENTER_PANE_WIDTH, height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <Box>
          <VideoSearch mode={MODE} />
        </Box>
        <Box sx={{ height: "100%" }}>
          <EditWindow mode={MODE} />
        </Box>

      </Box>

      <Box sx={{ width: RIGHT_PANE_WIDTH, height: "100%" }}>
        <CompletedListWindow mode={MODE} />
      </Box>
    </Box>
  );
}
