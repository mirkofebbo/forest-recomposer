import React, { useState } from "react";
import { Container, Typography, Box, Link, Button } from '@mui/material';

export default function EditListWindow({mode}: {mode?: string} ) {


    return (
        <Container sx={ [ mode === "DEBUG" && { border: '3px solid red',  borderRadius: 1 }, {height: "100%"} ] }>
            <Box sx={{ marginTop: 2 }}>
                <Typography variant="h4" gutterBottom>list of Video Saved for Edit Window</Typography>
            </Box>
        </Container>
    );
}
