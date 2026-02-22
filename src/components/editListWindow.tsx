import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Container, Typography, Box, CardContent, Card, CardMedia } from '@mui/material';
import type { Manifest } from "../types";
import BasicMenu from "./utils/BasicMenu";

import CloseIcon from '@mui/icons-material/Close';

export default function EditListWindow({ mode, manifestData, setManifestData, onOpenVideoModal }:
    {
        mode?: string,
        manifestData?: Manifest,
        setManifestData?: Dispatch<SetStateAction<Manifest>>,
        onOpenVideoModal: (videoId: string) => void
    }) {
    const [showInfo, setShowInfo] = useState<boolean>(false);

    const toEdit = manifestData?.to_edit ?? [];
    
    return (
        <Container
            maxWidth={false}
            sx={[
                mode === "DEBUG" && { border: "3px solid red", borderRadius: 1 },
                {
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    py: 2,
                    minHeight: 0,
                },
            ]}
        >
            {/* Edit List Window */}

            {toEdit.length === 0 ? (
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
                        {toEdit.map((it, idx) => {
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
                                    {/* Title, channel, and menu */}
                                    <CardContent sx={{ p: 1.25 }}>
                                        <Box sx={{ flexDirection: "row", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                                            <Box sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                {it.title ?? "Untitled"}
                                            </Box>
                                            <BasicMenu itemId={vid} manifestData={manifestData} setManifestData={setManifestData} setShowInfo={setShowInfo} onOpenVideoModal={onOpenVideoModal} />
                                        </Box>
                                        {showInfo && (
                                            <Box sx={{ mt: 0.5, fontSize: "0.8rem", color: "text.secondary" }}>
                                                <CloseIcon onClick={() => setShowInfo(false)} />
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {it.channelTitle} &bull; {new Date(it.publishedAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Container>
    );
}