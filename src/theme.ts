//theme generated with the help of chatgpt 5.2
import { createTheme } from '@mui/material/styles';

/* ======================================================
   FOREST COLOR TOKENS (GLOBAL)
   ====================================================== */

const FOREST_GREEN_DARK = '#3A5A40';
const FOREST_GREEN_MAIN = '#344E41';
const FOREST_GREEN_LIGHT = '#4F7F72';

const MOSS_GREEN_DARK = '#5B7F5A';
const MOSS_GREEN_MAIN = '#7DA87B';
const MOSS_GREEN_LIGHT = '#A6C7A4';

const FOREST_BACKGROUND_DEFAULT = '#344E41';
const FOREST_BACKGROUND_PAPER = '#A3B18A';

const BARK_TEXT_PRIMARY = '#24352D';
const BARK_TEXT_SECONDARY = '#D6E2DB';

const LEAF_SUCCESS = '#4CAF50';
const EARTH_WARNING = '#C2A14D';
const CLAY_ERROR = '#8B3A3A';

const CONTAINED_BUTTON_BG = '#A3B18A';
const CONTAINED_BUTTON_HOVER_BG = '#588157';
const CONTAINED_BUTTON_TEXT = '#16211B';
const FOREST_DIVIDER = '#D6E2DB';

/* ======================================================
    THEME
   ====================================================== */

const forestTheme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: FOREST_GREEN_MAIN,
      light: FOREST_GREEN_LIGHT,
      dark: FOREST_GREEN_DARK,
      contrastText: FOREST_BACKGROUND_PAPER,
    },

    secondary: {
      main: MOSS_GREEN_MAIN,
      light: MOSS_GREEN_LIGHT,
      dark: MOSS_GREEN_DARK,
      contrastText: BARK_TEXT_PRIMARY,
    },

    background: {
      default: FOREST_BACKGROUND_DEFAULT,
      paper: FOREST_BACKGROUND_PAPER,
    },

    text: {
      primary: BARK_TEXT_PRIMARY,
      secondary: BARK_TEXT_SECONDARY,
    },

    success: {
      main: LEAF_SUCCESS,
    },

    warning: {
      main: EARTH_WARNING,
    },

    error: {
      main: CLAY_ERROR,
    },

    divider: FOREST_DIVIDER,
  },

  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,

    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {

        root: {
          borderRadius: 24,
          paddingInline: 20,
          "&.MuiButton-contained": {
            backgroundColor: CONTAINED_BUTTON_BG,
            color: CONTAINED_BUTTON_TEXT,
            "&:hover": {
              backgroundColor: CONTAINED_BUTTON_HOVER_BG,
            },
          },
          "&.Mui-disabled": {
            opacity: 0.6,
          },
        },
      },

    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: FOREST_GREEN_DARK,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default forestTheme;
