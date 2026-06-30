// JNAS AI Core - Global Design Tokens System Configuration

export interface TokenMeta {
  value: string;
  variable?: string;
  description: string;
}

export interface TypographyMeta {
  family: string;
  variable: string;
  usage: string;
}

export const SpacingTokens: Record<string, TokenMeta> = {
  xs: { value: '4px', variable: 'gap-1 / p-1', description: 'Micro padding, inline indicators, form labels' },
  sm: { value: '8px', variable: 'gap-2 / p-2', description: 'Tactile buttons, secondary control margins' },
  md: { value: '16px', variable: 'gap-4 / p-4', description: 'Card padding, grid layout gutters, form groups' },
  lg: { value: '24px', variable: 'gap-6 / p-6', description: 'Outer grid frames, section margins, display panels' },
  xl: { value: '32px', variable: 'gap-8 / p-8', description: 'Branding displays, sparse layouts' },
};

export const TypographyTokens: Record<string, TypographyMeta> = {
  sans: { family: '"Inter", sans-serif', variable: '--font-sans', usage: 'Global body layout, general telemetry grids' },
  mono: { family: '"JetBrains Mono", monospace', variable: '--font-mono', usage: 'Hex dumps, memory registers, latency counters' },
  display: { family: '"Space Grotesk", sans-serif', variable: '--font-display', usage: 'Major headers, login cards, branding' },
};

export const BorderRadiusTokens: Record<string, TokenMeta> = {
  xs: { value: '2px', variable: 'rounded-xs', description: 'Tactile interactive nodes (badges, input borders)' },
  sm: { value: '4px', variable: 'rounded-sm', description: 'Main containers, system bento card blocks' },
  md: { value: '8px', variable: 'rounded-md', description: 'Modals, overlays, dropdown lists' },
};

export const ElevationTokens: Record<string, TokenMeta> = {
  flat: { value: 'none', description: 'Minimalist border frames, avoiding heavy shadows' },
  glow: { value: '0 0 15px rgba(6, 182, 212, 0.15)', description: 'Cyan accent luminescence on active focus' },
};

export const ResponsiveBreakpoints: Record<string, TokenMeta> = {
  sm: { value: '640px', description: 'Handheld viewport boundary' },
  md: { value: '768px', description: 'Horizontal tablet view' },
  lg: { value: '1024px', description: 'Mid-size laptop frame size' },
  xl: { value: '1280px', description: 'High-definition workstation monitors' },
  '2xl': { value: '1536px', description: 'Ultra-wide and ultra-density screens' },
};
