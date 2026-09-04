import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'app_design.dart';
import 'app_palette.dart';

/// Une surface est tenue par sa bordure, pas par son ombre. L'élévation est
/// dépensée uniquement sur ce qui flotte réellement au-dessus du contenu.
///
/// Les rayons et les hauteurs de cible viennent de [AppDesign] ; la grammaire
/// de la plateforme vient de [AppShape], que le thème lit une fois pour poser
/// la forme de ses boutons.
ThemeData buildAppTheme(
  AppPalette palette,
  Brightness brightness, {
  TargetPlatform? platform,
}) {
  final resolved = platform ?? defaultTargetPlatform;
  final shape = resolved == TargetPlatform.android
      ? AppShape.material
      : AppShape.cupertino;
  final dark = brightness == Brightness.dark;
  final cardBorder = dark
      ? AppDesign.cardBorderDark
      : AppDesign.cardBorderLight;
  final track = dark ? AppDesign.trackDark : AppDesign.trackLight;

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

  final text = AppTypography.textTheme(palette);

  return ThemeData(
    useMaterial3: true,
    platform: platform,
    colorScheme: scheme,
    fontFamily: AppTypography.jakarta,
    textTheme: text,
    scaffoldBackgroundColor: palette.background,
    dividerColor: cardBorder,
    cardTheme: CardThemeData(
      elevation: 0,
      color: palette.surface,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: cardBorder),
        borderRadius: BorderRadius.circular(shape.card),
      ),
    ),
    // L'action pleine largeur du socle : une seule par écran, 58 px, et
    // éteinte elle garde sa place — elle dit ce qui manque, elle ne disparaît
    // pas.
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: palette.primary,
        foregroundColor: palette.onPrimary,
        disabledBackgroundColor: track,
        disabledForegroundColor: palette.inkSubtle,
        minimumSize: const Size.fromHeight(AppDesign.heightPrimaryAction),
        textStyle: text.labelLarge,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(shape.action),
        ),
      ),
    ),
    // Le geste secondaire : bordé, jamais plein. Il ne peut pas se confondre
    // avec l'action attendue.
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: palette.inkMuted,
        backgroundColor: palette.surface,
        side: BorderSide(color: palette.border),
        minimumSize: const Size.fromHeight(AppDesign.heightSecondary),
        textStyle: text.bodyLarge?.copyWith(fontSize: 15),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDesign.radiusControl),
        ),
      ),
    ),
    // Le repli : « Corriger le texte », « Pas de suivi pour cette séance ».
    // Du texte, pas de contour — sinon il se lit comme un second choix
    // équivalent.
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: palette.inkMuted,
        minimumSize: const Size.fromHeight(AppDesign.heightSecondary),
        textStyle: text.bodyLarge?.copyWith(fontSize: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(shape.action),
        ),
      ),
    ),
    // Champs à 56 px, étiquette posée au-dessus par l'écran plutôt que
    // flottante : debout, le praticien doit lire ce qu'il remplit sans que le
    // libellé rétrécisse sous son doigt.
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: palette.surface,
      constraints: const BoxConstraints(minHeight: AppDesign.heightField),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      hintStyle: text.bodyLarge?.copyWith(
        fontWeight: FontWeight.w400,
        color: palette.inkSubtle,
      ),
      labelStyle: text.bodySmall?.copyWith(fontWeight: FontWeight.w600),
      floatingLabelStyle: text.bodySmall?.copyWith(
        fontWeight: FontWeight.w600,
        color: palette.primary,
      ),
      border: OutlineInputBorder(
        borderSide: BorderSide(color: cardBorder),
        borderRadius: BorderRadius.circular(AppDesign.radiusControl),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: cardBorder),
        borderRadius: BorderRadius.circular(AppDesign.radiusControl),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: palette.primary, width: 1.5),
        borderRadius: BorderRadius.circular(AppDesign.radiusControl),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: BorderSide(color: palette.danger),
        borderRadius: BorderRadius.circular(AppDesign.radiusControl),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderSide: BorderSide(color: palette.danger, width: 1.5),
        borderRadius: BorderRadius.circular(AppDesign.radiusControl),
      ),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(
      color: palette.primary,
      linearTrackColor: track,
      linearMinHeight: 7,
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.selected)
            ? palette.onPrimary
            : palette.surface,
      ),
      trackColor: WidgetStateProperty.resolveWith(
        (states) =>
            states.contains(WidgetState.selected) ? palette.primary : track,
      ),
      trackOutlineColor: WidgetStateProperty.resolveWith(
        (states) =>
            states.contains(WidgetState.selected) ? palette.primary : cardBorder,
      ),
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: palette.background,
      foregroundColor: palette.ink,
      titleTextStyle: text.titleLarge,
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: palette.background,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(shape.surface),
        ),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: palette.ink,
      contentTextStyle: text.bodyMedium?.copyWith(color: palette.background),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDesign.radiusControl),
      ),
    ),
  );
}
