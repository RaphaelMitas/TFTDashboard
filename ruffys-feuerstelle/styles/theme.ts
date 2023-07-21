import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({

  palette: {
    mode: 'dark',
    primary: {
      light: '#70d4eb',
      main: '#4DCAE6',
      dark: '#358da1',
      contrastText: '#FFFFFF',
    },
    background: {
      // paper: '#1d1d1d',
    }
  },

  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
});

export default defaultTheme;
