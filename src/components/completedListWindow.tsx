import React, { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Container, Typography, Box, CardContent, Card, CardMedia } from '@mui/material';
import type { Manifest } from "../types";


export default function CompletedListWindow({ mode, manifestData, setManifestData, onOpenVideoModal }:
    {
        mode?: string,
        manifestData?: Manifest,
        setManifestData?: Dispatch<SetStateAction<Manifest>>,
        onOpenVideoModal: (videoId: string) => void
    }) {

        const completed = manifestData?.completed ?? [];
    return (
        <Container sx={[mode === "DEBUG" && { border: '3px solid orange', borderRadius: 1 }, { height: "100%" }]}>
            {/* Edit List Window */}

            {completed.length === 0 ? (
                <Box sx={{ opacity: 0.7 }}>
                    No videos in <code>to_edit</code> yet.
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "auto",
                        pr: 0.5,
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: 1.5,
                            alignContent: "start",
                        }}
                    >
                        {/* Video cards for each video */}
                        {completed.map((it, idx) => {
                            const vid = it.videoId;
                            const thumb = it.thumbnailUrl;
                            const href = vid ? `https://www.youtube.com/watch?v=${vid}` : undefined;

                            return (
                                <Card
                                    key={`${vid ?? "noid"}-${it.publishedAt ?? "nodate"}-${idx}`}
                                    // component={Link}
                                    // href={href}
                                    // target="_blank"
                                    // rel="noreferrer"
                                    sx={{
                                        cursor: href ? "pointer" : "default",
                                        opacity: href ? 1 : 0.6,
                                        "&:hover": {
                                            boxShadow: href ? 3 : 1,
                                        },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={thumb || ""}
                                        alt={it.title ?? ""}
                                        sx={{
                                            aspectRatio: "16 / 9",
                                            bgcolor: "#f2f2f2",
                                            display: thumb ? "block" : "none",
                                        }}
                                    />
                                    {!thumb && (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                aspectRatio: "16 / 9",
                                                bgcolor: "#f2f2f2",
                                                display: "grid",
                                                placeItems: "center",
                                                opacity: 0.7,
                                            }}
                                        >
                                            No thumbnail
                                        </Box>
                                    )}
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Container>
    );
}
