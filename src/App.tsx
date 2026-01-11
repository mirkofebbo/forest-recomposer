import * as React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';

function Copyright() {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{
        color: 'text.secondary',
      }}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function App() {
  console.log(import.meta.env.VITE_YOUTUBE_KEY) // "123"
  console.log(import.meta.env.DB_PASSWORD) // undefined
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Material UI Vite example in TypeScript
        </Typography>
        <Copyright />
      </Box>
    </Container>
  );
}