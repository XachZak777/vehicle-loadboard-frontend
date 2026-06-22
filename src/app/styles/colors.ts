// Central Tailwind color class tokens.
// All Tailwind color class strings in TSX/TSX files must reference this file.
// Do NOT write raw color classes (e.g. text-amber-500) anywhere outside this file.

export const colors = {
  // ── Amber / brand accent ──────────────────────────────────────────────────
  accentText:       'text-amber-500',
  accentTextStrong: 'text-amber-600',
  accentTextLight:  'text-amber-400',
  accentTextFaint:  'text-amber-300',
  accentTextDark:   'text-amber-700',
  accentTextDeep:   'text-amber-800',
  accentTextDeeper: 'text-amber-900',
  accentTextBright: 'text-amber-100',

  accentBg:         'bg-amber-500',
  accentBgStrong:   'bg-amber-600',
  accentBgLight:    'bg-amber-400',
  accentBgSubtle:   'bg-amber-100',
  accentBgFaint:    'bg-amber-50',
  accentBgMuted:    'bg-amber-500/10',
  accentBgDeep:     'bg-amber-900/30',
  accentBgDeeper:   'bg-amber-950/20',

  accentBorder:        'border-amber-500',
  accentBorderStrong:  'border-amber-600',
  accentBorderLight:   'border-amber-200',
  accentBorderFaint:   'border-amber-300',
  accentBorderMedium:  'border-amber-400',
  accentBorderDark:    'border-amber-700',
  accentBorderDeep:    'border-amber-800',
  accentBorderMuted:   'border-amber-500/30',
  accentBorderMutedHalf: 'border-amber-500/40',
  accentBorderDeepHalf:  'border-amber-800/50',

  accentRing: 'ring-amber-500',

  // ── Amber composite UI patterns ───────────────────────────────────────────
  accentBtn:         'bg-amber-500 hover:bg-amber-600 text-white',
  accentBtnOutline:  'border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10',
  accentChip:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  accentLinkHover:   'hover:text-amber-500',
  accentBgLightDual: 'bg-amber-100 dark:bg-amber-900/30',
  accentBgFaintDual: 'bg-amber-50 dark:bg-amber-950/20',
  accentGradient:    'from-amber-500 to-amber-600',
  accentGradientCard:
    'from-gray-50 via-amber-50/30 to-orange-50/30 dark:from-gray-900/50 dark:via-amber-950/20 dark:to-orange-950/20',
  accentHoverCard: 'hover:border-amber-400 dark:hover:border-amber-500',

  // ── Orange accent ─────────────────────────────────────────────────────────
  orangeText:       'text-orange-500',
  orangeTextStrong: 'text-orange-600',
  orangeTextLight:  'text-orange-400',
  orangeTextDark:   'text-orange-700',
  orangeGradient:   'from-orange-500 to-orange-600',

  // ── Status: error ─────────────────────────────────────────────────────────
  errorText:       'text-red-500',
  errorTextStrong: 'text-red-600',
  errorTextDark:   'text-red-700',
  errorBg:         'bg-red-50',
  errorBorder:     'border-red-500',

  // ── Status: success ───────────────────────────────────────────────────────
  successText:      'text-green-600',
  successTextMuted: 'text-green-500',
  successTextLight: 'text-green-400',
  successTextDark:  'text-green-700',

  // ── Status: info ──────────────────────────────────────────────────────────
  infoText: 'text-blue-500',
  infoBg:   'bg-blue-500',

  // ── Neutral text ──────────────────────────────────────────────────────────
  textPrimary:   'text-gray-900',
  textSecondary: 'text-gray-600',
  textBody:      'text-gray-500',
  textMuted:     'text-gray-400',
  textSubtle:    'text-gray-300',
  textLabel:     'text-gray-700',
  textLight:     'text-gray-100',

  // ── Neutral backgrounds ───────────────────────────────────────────────────
  bgSurface:     'bg-gray-50',
  bgMuted:       'bg-gray-100',
  bgStrong:      'bg-gray-800',
  bgStrongMuted: 'bg-gray-800/50',
  bgDualMode:    'bg-gray-100 dark:bg-gray-800',

  // ── Neutral borders ───────────────────────────────────────────────────────
  borderDefault:      'border-gray-200',
  borderMedium:       'border-gray-300',
  borderBody:         'border-gray-600',
  borderStrong:       'border-gray-700',
  borderFaint:        'border-gray-100',
  borderDualMode:     'border-gray-200 dark:border-gray-700',

  // ── Rare: purple ──────────────────────────────────────────────────────────
  purpleText:      'text-purple-700',
  purpleTextLight: 'text-purple-300',

  // ── Rare: pink → rose gradient ────────────────────────────────────────────
  pinkToRoseGradient: 'from-pink-500 to-rose-600',

  // ── Slate ─────────────────────────────────────────────────────────────────
  slateText:     'text-slate-300',
  slateTextDark: 'text-slate-900',
} as const;
