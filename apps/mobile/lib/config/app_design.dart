import 'package:flutter/material.dart';

import 'app_palette.dart';

/// Ce que le board « Biume Mobile » ajoute à `AppPalette`, qui reste la source
/// de vérité des couleurs. Ici : le dégradé de marque, les rayons, les tailles
/// de cible et l'échelle typographique — rien qui redéfinisse une couleur.
@immutable
class AppDesign {
  const AppDesign._();

  /// Le dégradé ne porte QUE les deux gestes qui font avancer la séance :
  /// « Dicter une séance » et « Finaliser et envoyer ». Partout ailleurs,
  /// l'action est en `palette.primary` plat. S'il apparaît une troisième
  /// fois, il ne veut plus rien dire.
  static const brandGradient = LinearGradient(
    begin: Alignment(-1, -0.4),
    end: Alignment(1, 0.4),
    colors: [Color(0xFF7B62E0), Color(0xFF4FAE93), Color(0xFF3FBF87)],
    stops: [0, 0.78, 1],
  );

  /// Bordure des cartes en thème clair : plus douce que `palette.border`, qui
  /// reste réservé aux champs de saisie et aux boutons secondaires.
  static const cardBorderLight = Color(0xFFE2E8F0);
  static const cardBorderDark = Color(0xFF1E293B);

  /// Fond de la dictée — plus profond que `palette.background` sombre : cet
  /// écran se lit dehors, souvent à bout de bras.
  static const captureBackground = Color(0xFF0B1020);

  /// Le gris inerte du board : fond d'une action éteinte, rail d'une barre de
  /// progression, emplacement d'une photo absente. Il ne dit rien — c'est
  /// exactement son rôle, et c'est pourquoi il n'appartient pas à
  /// `AppPalette`, où chaque ton porte un état.
  static const trackLight = Color(0xFFE7E9EE);
  static const trackDark = Color(0xFF1E293B);

  // Rayons. Trois valeurs, pas une de plus.
  static const radiusControl = 16.0; // champs, boutons secondaires, pastilles
  static const radiusCard = 22.0; // cartes de liste
  static const radiusSurface = 26.0; // grandes surfaces, blocs de récapitulatif
  static const radiusPill = 999.0; // action principale, chips d'état

  // Cibles. Aucune zone tapable sous 52 px : l'app se tient debout, une main.
  static const heightPrimaryAction = 58.0;
  static const heightBrandAction = 60.0;
  static const heightSecondary = 52.0;
  static const heightField = 56.0;

  static const gutter = 22.0; // marge latérale des écrans
  static const gapList = 8.0;
  static const gapSection = 14.0;
}

/// La grammaire locale de la plateforme, posée par-dessus `AppDesign`.
///
/// Android resserre les rayons, arrondit les avatars et pose l'action
/// principale en rectangle plutôt qu'en pilule. La hiérarchie et les couleurs
/// ne bougent pas : seule la forme parle la langue du système.
@immutable
class AppShape {
  const AppShape({
    required this.card,
    required this.surface,
    required this.action,
    required this.avatar,
    required this.gutter,
  });

  /// Cartes de liste et rendez-vous.
  final double card;

  /// Grandes surfaces : récapitulatif de finalisation, blocs de questions.
  final double surface;

  /// L'action pleine largeur du socle bas.
  final double action;

  /// Avatar de l'accueil et boutons d'icône carrés de l'en-tête.
  final double avatar;

  /// Marge latérale des écrans.
  final double gutter;

  static const cupertino = AppShape(
    card: AppDesign.radiusCard,
    surface: AppDesign.radiusSurface,
    action: AppDesign.radiusPill,
    avatar: 14,
    gutter: AppDesign.gutter,
  );

  static const material = AppShape(
    card: 20,
    surface: 22,
    action: 20,
    avatar: AppDesign.radiusPill,
    gutter: 20,
  );

  /// Lu depuis le thème plutôt que depuis `defaultTargetPlatform` : un test
  /// ou une prévisualisation peut ainsi forcer l'une ou l'autre grammaire.
  static AppShape of(BuildContext context) =>
      Theme.of(context).platform == TargetPlatform.android
      ? material
      : cupertino;
}

/// Bricolage Grotesque porte les titres, les heures et le minuteur ; Plus
/// Jakarta Sans porte l'interface. Deux familles, jamais trois.
///
/// Les deux sont embarquées dans `assets/fonts` et déclarées dans
/// `pubspec.yaml` : l'application se lance régulièrement sans réseau, et une
/// police téléchargée à froid décalerait toute la mise en page au premier
/// lancement.
class AppTypography {
  const AppTypography._();

  static const bricolage = 'BricolageGrotesque';
  static const jakarta = 'PlusJakartaSans';

  static TextTheme textTheme(AppPalette palette) => TextTheme(
    // Nom d'animal en tête de fiche, montant d'un écran de finalisation.
    displaySmall: TextStyle(
      fontFamily: bricolage,
      fontWeight: FontWeight.w700,
      fontSize: 32,
      height: 1.05,
      letterSpacing: -0.6,
      color: palette.ink,
    ),
    // « À traiter », « Aujourd'hui ».
    headlineSmall: TextStyle(
      fontFamily: bricolage,
      fontWeight: FontWeight.w700,
      fontSize: 26,
      letterSpacing: -0.5,
      color: palette.ink,
    ),
    // Titre de barre d'app.
    titleLarge: TextStyle(
      fontFamily: bricolage,
      fontWeight: FontWeight.w700,
      fontSize: 22,
      letterSpacing: -0.2,
      color: palette.ink,
    ),
    // Heure d'un rendez-vous, nom dans une carte « À traiter ».
    titleMedium: TextStyle(
      fontFamily: bricolage,
      fontWeight: FontWeight.w600,
      fontSize: 19,
      color: palette.ink,
    ),
    // Ligne principale d'une carte.
    bodyLarge: TextStyle(
      fontFamily: jakarta,
      fontWeight: FontWeight.w600,
      fontSize: 16,
      height: 1.5,
      color: palette.ink,
    ),
    // Corps courant, transcription, propositions.
    bodyMedium: TextStyle(
      fontFamily: jakarta,
      fontWeight: FontWeight.w400,
      fontSize: 15,
      height: 1.55,
      color: palette.inkMuted,
    ),
    // Métadonnées, horodatages, aides de saisie. Plancher : 13.
    bodySmall: TextStyle(
      fontFamily: jakarta,
      fontWeight: FontWeight.w500,
      fontSize: 13,
      height: 1.45,
      color: palette.inkSubtle,
    ),
    // Étiquette de bouton.
    labelLarge: TextStyle(
      fontFamily: jakarta,
      fontWeight: FontWeight.w700,
      fontSize: 17,
      color: palette.ink,
    ),
  );

  /// Le libellé d'une pastille d'état : « À VÉRIFIER », « RÉPONSE AU SUIVI ».
  /// L'interlettrage est ce qui le distingue d'un titre ; sans lui, la
  /// pastille se lit comme un mot crié.
  static TextStyle chip(Color color) => TextStyle(
    fontFamily: jakarta,
    fontWeight: FontWeight.w700,
    fontSize: 12,
    letterSpacing: 0.6,
    color: color,
  );

  /// L'intitulé d'une section : « OBSERVATIONS », « DESTINATAIRE ». Même
  /// famille que la pastille, interlettrage plus large — il ouvre un bloc, il
  /// ne qualifie pas un élément.
  static TextStyle sectionLabel(Color color) => TextStyle(
    fontFamily: jakarta,
    fontWeight: FontWeight.w700,
    fontSize: 12,
    letterSpacing: 1.1,
    color: color,
  );

  /// Le minuteur de dictée. Chiffres tabulaires obligatoires : sans eux, le
  /// compteur tressaute à chaque seconde.
  static TextStyle timer(Color color) => TextStyle(
    fontFamily: bricolage,
    fontWeight: FontWeight.w600,
    fontSize: 68,
    height: 1,
    letterSpacing: -2,
    fontFeatures: const [FontFeature.tabularFigures()],
    color: color,
  );
}
