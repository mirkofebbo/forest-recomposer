import React, { useState } from "react";
import { Container, Typography, Box, Link, Button, Input } from '@mui/material';
import VideoSearch from "./components/videoSearch";

export default function App() {


  return (
    <Container>
      <Typography variant="h4" gutterBottom>YouTube Search</Typography>

      <VideoSearch />
    </Container>
  );
}
