import React, { useState } from "react";
import { Container, Typography, Box, Link, Button } from '@mui/material';

export default function EditListWindow({mode}: {mode?: string} ) {


    return (
        <Container>
            <Box sx={ mode === "DEBUG" ? { border: '1px solid red',  borderRadius: 1 } : {} }>
                <Typography variant="h4" gutterBottom>Edit Window</Typography>
            </Box>
        </Container>
    );
}
