import type { CSSProperties } from 'react';
import { palette } from './palette';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body3: CSSProperties;
  }
  interface TypographyVariantsOptions {
    body3?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
  }
}

const heading = {
  letterSpacing: 0,
  fontWeight: 700,
  color: palette.primary.main,
};

export const typography = {
  fontFamily: '"Roboto", sans-serif',
  h1: { fontSize: '2.25rem', lineHeight: '3rem', ...heading },
  h2: { fontSize: '2rem', lineHeight: '2.25rem', ...heading },
  h3: { fontSize: '1.75rem', lineHeight: '2rem', ...heading },
  h4: { fontSize: '1.5rem', lineHeight: '1.75rem', ...heading },
  h5: { fontSize: '1.25rem', lineHeight: '1.5rem', ...heading },
  h6: { fontSize: '1.125rem', lineHeight: '1.375rem', ...heading },
  body1: { fontSize: '1rem', lineHeight: '1.375rem', letterSpacing: 0 },
  body2: { fontSize: '0.875rem', lineHeight: '1.375rem', letterSpacing: 0 },
  body3: { fontSize: '0.75rem', lineHeight: '1.375rem', letterSpacing: 0 },
};
