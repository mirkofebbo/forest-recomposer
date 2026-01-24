import React, { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Manifest, VideoItem } from "../types";
import { Container, Typography, Box, Link, Button } from '@mui/material';

export default function EditWindow({ mode, manifestData, setManifestData, }:
    {
        mode?: string,
        manifestData?: Manifest,
        setManifestData?: Dispatch<SetStateAction<Manifest>>,
    }) {

    const video = manifestData?.in_progress[0];

    useEffect(() => {
        console.log("editWindow Video: ", video);
    }, [manifestData])

    return (
        <Container sx={[mode === "DEBUG" && { border: '3px solid blue', borderRadius: 1 }, { height: "100%" }]}>
            <Box sx={{ marginTop: 2 }}>
                <Typography variant="h4" gutterBottom>Edit Window</Typography>
                {/* Video content area */}
                <Box
                    sx={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        bgcolor: "black",
                        borderRadius: 2,
                        overflow: "hidden",
                    }}
                >
                    {video?.videoId ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <Box
                            sx={{
                                height: "100%",
                                display: "grid",
                                placeItems: "center",
                                color: "white",
                                opacity: 0.8,
                            }}
                        >
                            No video selected
                        </Box>
                    )}
                </Box>

            </Box>
            <Box sx={{ height: "22%", border: "5px solid orange", flexGrow: 1 }} >
                <Typography sx={{marginTop: 2 }} variant="h4" gutterBottom>Timecode Edit Window </Typography>
            </Box>

        </Container>
    );
}
