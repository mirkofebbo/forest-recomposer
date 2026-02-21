import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import forestTheme from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={forestTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
);
;
