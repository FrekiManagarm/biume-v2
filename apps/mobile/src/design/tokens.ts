import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * The mobile design language is the web `select-organization` page transposed
 * to a phone: a slate canvas, white surfaces separated by a single hairline,
 * the Biume violet on the one action that moves the practitioner forward, and
 * emerald reserved for state — active, secure, sent.
 *
 * Two constraints changed values rather than intent:
 *
 * - The web primary (`hsl(251 73% 72%)`) carries white text at 3.1:1. That
 *   fails on a phone held at arm's length in a stable, so filled controls use a
 *   darkened violet of the same hue at 5.4:1 and keep the light tint for
 *   surfaces and borders, where contrast is not a reading requirement.
 * - Dark is a real appearance, not an inversion. The canvas is the ink of the
 *   light theme, the tint brightens the way system tints do, and filled violet
 *   flips to dark text rather than dropping below the contrast floor.
 */
export type Palette = {
  /** Page background. Never white: white belongs to the surfaces on top of it. */
  canvas: string;
  surface: string;
  /** Pressed state of a surface that is itself a control. */
  surfacePressed: string;
  /** Neutral fill for icon tiles and inert chips. */
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  /** Headings and anything that must be read at a glance. */
  ink: string;
  /** Body copy. */
  inkMuted: string;
  /** Metadata, timestamps, secondary lines. */
  inkSubtle: string;
  primary: string;
  onPrimary: string;
  primaryPressed: string;
  /** Violet tint for surfaces and borders — decorative, never text. */
  primarySurface: string;
  primaryBorder: string;
  /** Emerald: active organization, secure session, capture sent. */
  accent: string;
  accentSurface: string;
  accentBorder: string;
  danger: string;
  onDanger: string;
  dangerSurface: string;
  dangerBorder: string;
  /** Offline and degraded states, which are warnings and not failures. */
  warning: string;
  warningSurface: string;
  warningBorder: string;
  /** The live recording indicator. */
  recording: string;
  /** Focus ring on text inputs. */
  focus: string;
};

const light: Palette = {
  canvas: '#f9fafb',
  surface: '#ffffff',
  surfacePressed: '#f1f5f9',
  surfaceSunken: '#f8fafc',
  // One step darker than the web's `slate-200`: on a phone held outdoors the
  // hairline is the only thing that draws a surface, since the shadow is gone.
  border: '#cbd5e1',
  borderStrong: '#94a3b8',
  ink: '#020617',
  inkMuted: '#475569',
  inkSubtle: '#64748b',
  primary: '#6a52d6',
  onPrimary: '#ffffff',
  primaryPressed: '#5943bb',
  primarySurface: '#f3f0fd',
  primaryBorder: '#d8cffa',
  accent: '#047857',
  accentSurface: '#ecfdf5',
  accentBorder: '#a7f3d0',
  danger: '#b91c1c',
  onDanger: '#ffffff',
  dangerSurface: '#fef2f2',
  dangerBorder: '#fecaca',
  warning: '#b45309',
  warningSurface: '#fffbeb',
  warningBorder: '#fde68a',
  recording: '#dc2626',
  focus: '#6a52d6',
};

const dark: Palette = {
  canvas: '#020617',
  surface: '#0f172a',
  surfacePressed: '#1e293b',
  surfaceSunken: '#16213b',
  border: '#2f3f59',
  borderStrong: '#4a5b75',
  ink: '#f8fafc',
  inkMuted: '#cbd5e1',
  inkSubtle: '#94a3b8',
  primary: '#a996f2',
  onPrimary: '#140e2b',
  primaryPressed: '#8f79e8',
  primarySurface: '#1c1a3a',
  primaryBorder: '#3b3470',
  accent: '#34d399',
  accentSurface: '#07271f',
  accentBorder: '#115e4a',
  danger: '#fca5a5',
  onDanger: '#2a0d0d',
  dangerSurface: '#2a1113',
  dangerBorder: '#7f1d1d',
  warning: '#fcd34d',
  warningSurface: '#2a2110',
  warningBorder: '#78350f',
  recording: '#f87171',
  focus: '#a996f2',
};

export const palettes = { light, dark } as const;

/** 4-based, like the web scale, so both surfaces round to the same rhythm. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  /** Chips and badges. */
  sm: 8,
  /** Controls: buttons, inputs, icon tiles. */
  md: 14,
  /** Cards and grouped lists. */
  lg: 20,
  pill: 999,
} as const;

/**
 * La même famille que le web. Les tokens ne portaient que taille, graisse et
 * interlettrage : deux applications aux mêmes couleurs mais à deux voix
 * n'étaient pas la même application. Le nom doit correspondre exactement à la
 * clé passée à `useFonts` dans `app/_layout.tsx`, faute de quoi React Native
 * retombe silencieusement sur la police système sans lever d'erreur.
 */
const fontFamily = 'HankenGrotesk';

/**
 * Fixed sizes rather than a fluid scale: a phone has one viewport, and Dynamic
 * Type already scales every `Text` here because font scaling is left on.
 */
export const typography = {
  display: { fontFamily, fontSize: 30, lineHeight: 36, fontWeight: '600', letterSpacing: -0.6 },
  title: { fontFamily, fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: -0.4 },
  heading: { fontFamily, fontSize: 17, lineHeight: 23, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontFamily, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '500' },
} satisfies Record<string, TextStyle>;

/** The clock is the one place where a number is the interface. */
export const clockType = {
  fontFamily,
  fontSize: 60,
  lineHeight: 68,
  fontWeight: '200',
  letterSpacing: -1.5,
  fontVariant: ['tabular-nums'],
} satisfies TextStyle;

/**
 * The web pairs a hairline border with a 70px blur shadow. At 3x on a phone
 * that shadow is invisible and costs a raster pass, so surfaces here are
 * carried by the border alone and elevation is spent only on the control that
 * floats above the content.
 */
export const elevation: Record<'raised', ViewStyle> = {
  raised: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.14,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    default: { elevation: 3 },
  }) as ViewStyle,
};

/** iOS asks for 44pt; a gloved hand in the field asks for more. */
export const controlHeight = { sm: 44, md: 50, lg: 56 } as const;

export const iconSize = { sm: 16, md: 20, lg: 24 } as const;
