import React, { useState } from "react";
import { Container, Typography, Box, Link, Button } from '@mui/material';

export default function CompletedListWindow({mode}: {mode?: string} ) {


    return (
        <Container>
            <Box sx={ mode === "DEBUG" ? { border: '1px solid orange',  borderRadius: 1 } : {} }>
                <Typography variant="h4" gutterBottom>Completed Window</Typography>
            </Box>
        </Container>
    );
}
