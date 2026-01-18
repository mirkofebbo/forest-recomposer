import React, { useState } from "react";
import { Container, Typography, Box, Link, Button } from '@mui/material';

export default function EditWindow({mode}: {mode?: string} ) {


    return (
        <Container sx={ [ mode === "DEBUG" && { border: '3px solid blue',  borderRadius: 1 }, {height: "100%"} ] }>
            <Box sx={{ marginTop: 2 }}>
                <Typography variant="h4" gutterBottom>Edit Window</Typography>
            </Box>
        </Container>
    );
}
