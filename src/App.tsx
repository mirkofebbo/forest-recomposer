import React, { useState } from "react";
import { Container, Typography, Box, Link, Button, Input } from '@mui/material';

import EditListWindow from "./components/editListWindow";
import VideoSearch from "./components/videoSearchWindow";
import CompletedListWindow from "./components/completedListWindow";

const MODE: string = "DEBUG";

export default function App() {


  return (
    <Container>
      <EditListWindow mode={MODE}/>
      <Typography variant="h4" gutterBottom>YouTube Search</Typography>
      <VideoSearch mode={MODE} />
      <CompletedListWindow mode={MODE}/>
    </Container>
  );
}
