import 'package:flutter/material.dart';

import '../../config/app_design.dart';
import '../../config/app_palette.dart';

/// Les pièces que le board réutilise d'un écran à l'autre. Tout le reste se
/// compose avec des `Column`/`Row` ordinaires — il n'y a pas de widget à
/// écrire pour une carte qui ne sert qu'une fois.

/// La palette de l'écran courant. Le thème ne porte que le `ColorScheme` de
/// Material : les tons qui disent un état — attendu, atteint, dégradé — se
/// lisent ici.
AppPalette paletteOf(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark
    ? AppPalette.dark
    : AppPalette.light;

/// L'action qui fait avancer la séance : « Dicter une séance », « Finaliser
/// et envoyer ». Deux emplois dans toute l'application, pas trois.
class BrandAction extends StatelessWidget {
  const BrandAction({
    required this.label,
    required this.onPressed,
    this.icon,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;
    final radius = BorderRadius.circular(AppShape.of(context).action);

    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: AppDesign.brandGradient,
          borderRadius: radius,
        ),
        child: SizedBox(
          height: AppDesign.heightBrandAction,
          width: double.infinity,
          child: TextButton(
            onPressed: onPressed,
            style: TextButton.styleFrom(
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: radius),
              textStyle: const TextStyle(
                fontFamily: AppTypography.jakarta,
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 20),
                  const SizedBox(width: 10),
                ],
                Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Le socle bas : un seul geste par écran, posé sur un dégradé vers le fond
/// pour que le contenu qui passe dessous ne se coupe pas net.
class ActionDock extends StatelessWidget {
  const ActionDock({required this.child, this.secondary, this.note, super.key});

  final Widget child;

  /// Le geste de repli, toujours plus discret : « Corriger le texte »,
  /// « Pas de suivi pour cette séance ».
  final Widget? secondary;

  /// La ligne qui désamorce une méprise sous l'action — « Appeler ne clôt
  /// pas le suivi. »
  final String? note;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    return Container(
      padding: EdgeInsets.fromLTRB(
        AppShape.of(context).gutter,
        16,
        AppShape.of(context).gutter,
        8,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [palette.background.withValues(alpha: 0), palette.background],
          stops: const [0, 0.32],
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            child,
            ?secondary,
            if (note != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  note!,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// La pastille d'état : « À vérifier », « Compte rendu à terminer », « Validé ».
/// Elle prend son ton de `AppPalette` — violet quand on attend un geste, vert
/// quand c'est réglé, ambre quand c'est dégradé.
class StatusChip extends StatelessWidget {
  const StatusChip({
    required this.label,
    required this.foreground,
    required this.background,
    this.border,
    super.key,
  });

  final String label;
  final Color foreground;
  final Color background;
  final Color? border;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppDesign.radiusPill),
        border: border == null ? null : Border.all(color: border!),
      ),
      // Capitales à l'écran, phrase normale pour la synthèse vocale : lue
      // lettre par lettre, « À VÉRIFIER » ne veut plus rien dire.
      child: Text(
        label.toUpperCase(),
        semanticsLabel: label,
        style: AppTypography.chip(foreground),
      ),
    );
  }
}

/// La carte de liste. Une bordure, pas d'ombre portée : à l'écurie, la nuit,
/// une ombre ne se voit pas — c'est la bordure qui détache.
class SurfaceCard extends StatelessWidget {
  const SurfaceCard({
    required this.child,
    this.onTap,
    this.emphasised = false,
    this.padding = const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
    this.radius,
    super.key,
  });

  final Widget child;
  final VoidCallback? onTap;

  /// La carte qui attend un geste maintenant : teinte violette et bordure
  /// accentuée. Une seule par écran.
  final bool emphasised;

  final EdgeInsets padding;

  /// Les grandes surfaces — récapitulatif, bloc de questions — s'arrondissent
  /// davantage que les cartes de liste.
  final double? radius;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final palette = paletteOf(context);
    final corner = BorderRadius.circular(radius ?? AppShape.of(context).card);

    return Material(
      color: emphasised ? palette.primarySurface : palette.surface,
      borderRadius: corner,
      child: InkWell(
        onTap: onTap,
        borderRadius: corner,
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            borderRadius: corner,
            border: Border.all(
              color: emphasised
                  ? palette.primaryBorder
                  : (dark
                        ? AppDesign.cardBorderDark
                        : AppDesign.cardBorderLight),
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}

/// L'en-tête d'un écran de parcours : un bouton de retour de 44 px, puis le
/// titre. `label` remplace le titre par une étiquette centrée quand l'écran
/// se nomme sans se raconter — « Fiche animal », « Suivi ».
class ScreenHeader extends StatelessWidget {
  const ScreenHeader({
    this.title,
    this.subtitle,
    this.label,
    this.leadingIcon = Icons.chevron_left,
    this.onLeading,
    this.trailing,
    super.key,
  }) : assert(
         title != null || label != null,
         "Un en-tête dit soit un titre, soit une étiquette.",
       );

  final String? title;
  final String? subtitle;
  final String? label;

  /// Une croix plutôt qu'un chevron quand l'écran s'abandonne au lieu de se
  /// refermer sur le précédent : la dictée, le nouveau client.
  final IconData leadingIcon;

  final VoidCallback? onLeading;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final leading = IconTile(
      icon: leadingIcon,
      onTap: onLeading ?? () => Navigator.of(context).maybePop(),
      semanticLabel: leadingIcon == Icons.close ? 'Abandonner' : 'Retour',
    );

    if (label != null) {
      return Padding(
        padding: EdgeInsets.fromLTRB(AppShape.of(context).gutter, 6, AppShape.of(context).gutter, 16),
        child: Row(
          children: [
            leading,
            Expanded(
              child: Text(
                label!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontSize: 14,
                  color: palette.inkSubtle,
                ),
              ),
            ),
            trailing ?? const SizedBox(width: 44),
          ],
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.fromLTRB(AppShape.of(context).gutter, 6, AppShape.of(context).gutter, 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          leading,
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title!, style: Theme.of(context).textTheme.titleLarge),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: Text(
                      subtitle!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Le bouton d'icône carré de 44 px des en-têtes : retour, croix, cloche.
/// Carré arrondi sur iOS, rond sur Android — la cible reste la même.
class IconTile extends StatelessWidget {
  const IconTile({
    required this.icon,
    required this.onTap,
    this.semanticLabel,
    this.badge = false,
    super.key,
  });

  final IconData icon;
  final VoidCallback? onTap;
  final String? semanticLabel;

  /// La pastille violette qui dit « il y a du nouveau », sans nombre : le
  /// compte se lit dans « À traiter », pas sur la cloche.
  final bool badge;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final palette = paletteOf(context);
    final corner = BorderRadius.circular(AppShape.of(context).avatar);

    return Semantics(
      button: true,
      label: semanticLabel,
      child: Material(
        color: palette.surface,
        borderRadius: corner,
        child: InkWell(
          onTap: onTap,
          borderRadius: corner,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              borderRadius: corner,
              border: Border.all(
                color: dark
                    ? AppDesign.cardBorderDark
                    : AppDesign.cardBorderLight,
              ),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(icon, size: 20, color: palette.inkMuted),
                if (badge)
                  Positioned(
                    top: 8,
                    right: 9,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: palette.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: palette.surface, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// L'intitulé qui ouvre un bloc : « OBSERVATIONS », « DESTINATAIRE ».
class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {this.trailing, super.key});

  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final label = Text(
      text.toUpperCase(),
      style: AppTypography.sectionLabel(paletteOf(context).inkSubtle),
    );

    if (trailing == null) return label;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [label, trailing!],
    );
  }
}

/// Le ton d'un bandeau. Le hors-ligne est ambre, jamais rouge : il annonce un
/// envoi différé, pas une panne.
enum NoticeTone { warning, success, neutral }

/// Le bandeau d'une ligne : hors ligne, transcription complète, rappel
/// d'irréversibilité.
class NoticeBanner extends StatelessWidget {
  const NoticeBanner({
    required this.message,
    required this.icon,
    this.tone = NoticeTone.warning,
    super.key,
  });

  final String message;
  final IconData icon;
  final NoticeTone tone;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    final (surface, border, ink) = switch (tone) {
      NoticeTone.warning => (
        palette.warningSurface,
        palette.warningBorder,
        palette.warning,
      ),
      NoticeTone.success => (
        palette.successSurface,
        palette.successBorder,
        palette.success,
      ),
      // Un rappel qui n'alerte de rien ne prend ni surface ni bordure : il se
      // pose à même la page, en gris.
      NoticeTone.neutral => (
        Colors.transparent,
        Colors.transparent,
        palette.inkSubtle,
      ),
    };

    return Container(
      width: double.infinity,
      padding: tone == NoticeTone.neutral
          ? const EdgeInsets.symmetric(horizontal: 4)
          : const EdgeInsets.fromLTRB(16, 13, 16, 13),
      decoration: BoxDecoration(
        color: surface,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 1),
            child: Icon(icon, size: 18, color: ink),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: tone == NoticeTone.neutral ? 13 : 14,
                color: tone == NoticeTone.neutral ? palette.inkSubtle : ink,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
