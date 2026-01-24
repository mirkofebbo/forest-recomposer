import React, { useEffect } from "react";
import { Container, Typography, Box, Link } from '@mui/material';
import type { Manifest } from "../types";

export default function EditListWindow({ mode, manifestData, setManifestData }: { mode?: string, manifestData?: Manifest, setManifestData?: React.Dispatch<React.SetStateAction<Manifest>> }) {

    const toEdit = manifestData?.to_edit ?? [];

    useEffect(() => {
        console.log("EditWindow manifestData updated:", manifestData);
    }, [manifestData]);

    return (
        <Container
            maxWidth={false}
            sx={[
                mode === "DEBUG" && { border: "3px solid blue", borderRadius: 1 },
                {
                    height: "100%",          // ok if parent controls height
                    display: "flex",
                    flexDirection: "column",
                    py: 2,
                    minHeight: 0,            // IMPORTANT for nested overflow in flex layouts
                },
            ]}
        >
            <Typography variant="h4" gutterBottom>
                Edit Window
            </Typography>

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
                        {toEdit.map((it, idx) => {
                            const vid = it.videoId;
                            const thumb = it.thumbnailUrl;
                            const href = vid ? `https://www.youtube.com/watch?v=${vid}` : undefined;

                            return (
                                <Box
                                    key={`${vid ?? "noid"}-${it.publishedAt ?? "nodate"}-${idx}`}
                                    sx={{
                                        border: "1px solid #ddd",
                                        borderRadius: 1.5,
                                        overflow: "hidden",
                                        bgcolor: "background.paper",
                                    }}
                                >
                                    <Link
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        underline="none"
                                        color="inherit"
                                        sx={{ display: "block" }}
                                        onClick={(e) => {
                                            if (!href) e.preventDefault();
                                        }}
                                    >
                                        {thumb ? (
                                            <Box
                                                component="img"
                                                src={thumb}
                                                alt={it.title ?? ""}
                                                sx={{
                                                    width: "100%",
                                                    display: "block",
                                                    aspectRatio: "16 / 9",
                                                    objectFit: "cover",
                                                    bgcolor: "#f2f2f2",
                                                }}
                                            />
                                        ) : (
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

                                        <Box sx={{ p: 1.25 }}>
                                            <Box sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                {it.title ?? "Untitled"}
                                            </Box>
                                        </Box>
                                    </Link>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Container>
    );
}