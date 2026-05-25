import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c8f04a',
      contrastText: '#0f0f0f',
    },
    secondary: {
      main: '#4af0b8',
      contrastText: '#0f0f0f',
    },
    warning: {
      main: '#f0b44a',
    },
    error: {
      main: '#f04a4a',
    },
    background: {
      default: '#0f0f0f',
      paper: '#171717',
    },
    divider: '#2a2a2a',
    text: {
      primary: '#efefed',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { scrollbarWidth: 'thin', scrollbarColor: '#2a2a2a transparent' },
        '::-webkit-scrollbar': { width: 4 },
        '::-webkit-scrollbar-thumb': { background: '#2a2a2a', borderRadius: 2 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
        containedPrimary: { color: '#0f0f0f' },
        containedSecondary: { color: '#0f0f0f' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: '#2a2a2a' },
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: 'var(--font-dm-mono), "DM Mono", monospace', fontSize: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;
