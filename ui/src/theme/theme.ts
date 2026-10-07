import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';

export const theme = createTheme({
  palette,
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#ffffff' } },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
        slotProps: { inputLabel: { shrink: true } },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '12px',
          lineHeight: '1em',
          color: palette.text.primary,
          '&.Mui-focused:not(.Mui-error)': { color: palette.primary.main },
          '&.MuiInputLabel-shrink': {
            fontSize: '12px',
            transform: 'translate(0, -1.5px) scale(1)',
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          marginTop: '1.25rem',
          '&:before': { borderBottomColor: palette.secondary.light },
          '&:hover:not(.Mui-disabled, .Mui-error):before': {
            borderBottomColor: palette.primary.main,
          },
          '&:after': { borderBottomColor: palette.primary.main },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          fontWeight: 700,
          letterSpacing: '0.06em',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: palette.primary.dark,
          },
        },
      },
    },
  },
});
