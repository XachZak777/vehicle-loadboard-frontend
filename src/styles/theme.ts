// Central JS/TS color constants — for contexts that cannot access CSS variables
// (print windows, HTML email templates, Recharts props).
// All other color usage should reference CSS variables from theme.css.

export const printColors = {
  text: '#111',
  background: '#fff',
  accent: '#f59e0b',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  borderLight: '#e5e7eb',
  rowDivider: '#f3f4f6',
  labelBg: '#fafafa',
  highlight: '#b45309',
  highlightBg: '#fffbeb',
  signatureBorder: '#d1d5db',
};

export const emailColors = {
  text: '#333',
  background: '#f9fafb',
  footer: '#666',
  headerBlue: '#2563eb',
  statusGreen: '#10b981',
  statusRed: '#ef4444',
};

export const chartColors = {
  blue: '#3b82f6',
};
