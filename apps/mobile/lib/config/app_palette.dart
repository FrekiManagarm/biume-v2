import 'package:flutter/material.dart';

/// Transposition de `packages/ui/src/styles/product.css`, qui fait foi.
///
/// Le violet porte l'action qui fait avancer le praticien, le vert porte l'état
/// atteint. Un ton n'est pas un choix esthétique : il dit au praticien si on
/// attend quelque chose de lui ou si c'est réglé.
@immutable
class AppPalette {
  const AppPalette({
    required this.background,
    required this.surface,
    required this.surfaceMuted,
    required this.border,
    required this.borderStrong,
    required this.ink,
    required this.inkMuted,
    required this.inkSubtle,
    required this.primary,
    required this.onPrimary,
    required this.primaryPressed,
    required this.primarySurface,
    required this.primaryBorder,
    required this.success,
    required this.onSuccess,
    required this.successSurface,
    required this.successBorder,
    required this.warning,
    required this.onWarning,
    required this.warningSurface,
    required this.warningBorder,
    required this.danger,
    required this.onDanger,
    required this.dangerSurface,
    required this.dangerBorder,
    required this.recording,
  });

  /// Fond de page. Jamais blanc : le blanc appartient aux surfaces posées
  /// dessus, sinon plus rien ne détache une carte de la page.
  final Color background;
  final Color surface;
  final Color surfaceMuted;
  final Color border;
  final Color borderStrong;

  /// Titres et tout ce qui doit se lire d'un coup d'œil.
  final Color ink;

  /// Corps de texte.
  final Color inkMuted;

  /// Métadonnées, horodatages, lignes secondaires.
  final Color inkSubtle;

  final Color primary;
  final Color onPrimary;
  final Color primaryPressed;

  /// Teinte violette pour surfaces et bordures — décorative, jamais du texte.
  final Color primarySurface;
  final Color primaryBorder;

  /// Vert : entreprise active, session sécurisée, dictée envoyée.
  final Color success;
  final Color onSuccess;
  final Color successSurface;
  final Color successBorder;

  /// États dégradés et hors ligne, qui sont des avertissements et non des
  /// pannes.
  final Color warning;
  final Color onWarning;
  final Color warningSurface;
  final Color warningBorder;

  final Color danger;
  final Color onDanger;
  final Color dangerSurface;
  final Color dangerBorder;

  /// L'indicateur d'enregistrement en cours, distinct du rouge d'erreur : il
  /// dit « ça tourne », pas « ça a raté ».
  final Color recording;

  static const light = AppPalette(
    background: Color(0xFFF9FAFB),
    surface: Color(0xFFFFFFFF),
    surfaceMuted: Color(0xFFF8FAFC),
    border: Color(0xFFCBD5E1),
    borderStrong: Color(0xFF94A3B8),
    ink: Color(0xFF020617),
    inkMuted: Color(0xFF475569),
    inkSubtle: Color(0xFF64748B),
    primary: Color(0xFF6A52D6),
    onPrimary: Color(0xFFFFFFFF),
    primaryPressed: Color(0xFF5943BB),
    primarySurface: Color(0xFFF3F0FD),
    primaryBorder: Color(0xFFD8CFFA),
    success: Color(0xFF047857),
    onSuccess: Color(0xFFFFFFFF),
    successSurface: Color(0xFFECFDF5),
    successBorder: Color(0xFFA7F3D0),
    warning: Color(0xFFB45309),
    onWarning: Color(0xFFFFFFFF),
    warningSurface: Color(0xFFFFFBEB),
    warningBorder: Color(0xFFFDE68A),
    danger: Color(0xFFB91C1C),
    onDanger: Color(0xFFFFFFFF),
    dangerSurface: Color(0xFFFEF2F2),
    dangerBorder: Color(0xFFFECACA),
    recording: Color(0xFFB91C1C),
  );

  static const dark = AppPalette(
    background: Color(0xFF020617),
    surface: Color(0xFF0F172A),
    surfaceMuted: Color(0xFF16213B),
    border: Color(0xFF2F3F59),
    borderStrong: Color(0xFF4A5B75),
    ink: Color(0xFFF8FAFC),
    inkMuted: Color(0xFFCBD5E1),
    inkSubtle: Color(0xFF94A3B8),
    primary: Color(0xFFA996F2),
    onPrimary: Color(0xFF140E2B),
    primaryPressed: Color(0xFF8F79E8),
    primarySurface: Color(0xFF1C1A3A),
    primaryBorder: Color(0xFF3B3470),
    success: Color(0xFF34D399),
    onSuccess: Color(0xFF07271F),
    successSurface: Color(0xFF07271F),
    successBorder: Color(0xFF115E4A),
    warning: Color(0xFFFCD34D),
    onWarning: Color(0xFF2A2110),
    warningSurface: Color(0xFF2A2110),
    warningBorder: Color(0xFF78350F),
    danger: Color(0xFFFCA5A5),
    onDanger: Color(0xFF2A0D0D),
    dangerSurface: Color(0xFF2A1113),
    dangerBorder: Color(0xFF7F1D1D),
    recording: Color(0xFFFCA5A5),
  );
}
