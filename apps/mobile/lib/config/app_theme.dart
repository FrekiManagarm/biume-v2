import 'package:flutter/material.dart';

import 'app_palette.dart';

/// Rayons repris de `--radius` et `--radius-card` de `product.css`.
const double appRadius = 14;
const double appCardRadius = 20;
const double appChipRadius = 8;

/// Une surface est tenue par sa bordure, pas par son ombre. L'élévation est
/// dépensée uniquement sur ce qui flotte réellement au-dessus du contenu.
ThemeData buildAppTheme(AppPalette palette, Brightness brightness) {
  final scheme = ColorScheme(
    brightness: brightness,
    primary: palette.primary,
    onPrimary: palette.onPrimary,
    secondary: palette.success,
    onSecondary: palette.onSuccess,
    error: palette.danger,
    onError: palette.onDanger,
    surface: palette.surface,
    onSurface: palette.ink,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: palette.background,
    dividerColor: palette.border,
    cardTheme: CardThemeData(
      elevation: 0,
      color: palette.surface,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: palette.border),
        borderRadius: BorderRadius.circular(appCardRadius),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: palette.primary,
        foregroundColor: palette.onPrimary,
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(appRadius),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: palette.ink,
        side: BorderSide(color: palette.border),
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(appRadius),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: palette.surface,
      border: OutlineInputBorder(
        borderSide: BorderSide(color: palette.border),
        borderRadius: BorderRadius.circular(appRadius),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: palette.border),
        borderRadius: BorderRadius.circular(appRadius),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: palette.primary, width: 2),
        borderRadius: BorderRadius.circular(appRadius),
      ),
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: palette.background,
      foregroundColor: palette.ink,
    ),
  );
}
