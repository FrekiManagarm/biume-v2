import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../config/app_palette.dart';
import '../../../core/telemetry/telemetry.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../../injection_container.dart';
import '../domain/proposal.dart';
import '../domain/report_repository.dart';
import 'report_cubit.dart';

/// Câble le cubit et déclenche le chargement.
///
/// Séparé de l'écran présentationnel pour que celui-ci soit testable sans
/// conteneur d'injection — et pour qu'un oubli de `load` se voie.
class ReportPage extends StatelessWidget {
  const ReportPage({
    required this.reportId,
    this.fromPatientSheet = false,
    super.key,
  });

  final String reportId;

  /// Vrai quand l'appel vient de la fiche animal (`?source=fiche`) : un
  /// compte rendu passé doit s'ouvrir hors ligne, depuis `CachedReports`.
  final bool fromPatientSheet;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          ReportCubit(getIt<ReportRepository>(), telemetry: getIt<Telemetry>())
            ..load(reportId, preferCache: fromPatientSheet),
      child: const ReportScreen(),
    );
  }
}

/// Le mobile **valide, il n'édite pas**.
///
/// Chaque proposition offre trois gestes et trois seulement : confirmer,
/// écarter, voir la source. Aucun champ de saisie de texte libre n'existe sur
/// cet écran — la seule saisie de l'application est la correction de
/// transcription, et l'adresse du propriétaire se complète à l'écran suivant.
///
/// Une seule proposition est ouverte à la fois. Sept cartes dépliées se lisent
/// comme un formulaire à remplir ; une seule se lit comme une question posée.
class ReportScreen extends StatelessWidget {
  const ReportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<ReportCubit, ReportState>(
          builder: (context, state) => switch (state) {
            ReportInitial() || ReportLoading() => const Center(
              child: CircularProgressIndicator(),
            ),
            ReportPreparing() => const _Preparing(),
            ReportUnavailable(:final message) => _Unavailable(message: message),
            ReportLoaded() => _Proposals(state),
            // La finalisation vit à l'écran suivant : cet état n'est plus
            // atteint depuis ici, mais le `switch` reste exhaustif.
            ReportFinalized() => const Center(
              child: CircularProgressIndicator(),
            ),
          },
        ),
      ),
    );
  }
}

class _Preparing extends StatelessWidget {
  const _Preparing();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ScreenHeader(title: 'Compte rendu'),
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 24),
                  Text(
                    'Biume prépare le compte rendu',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Vous pouvez quitter cet écran.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Unavailable extends StatelessWidget {
  const _Unavailable({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ScreenHeader(title: 'Compte rendu'),
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Proposals extends StatelessWidget {
  const _Proposals(this.state);

  final ReportLoaded state;

  @override
  Widget build(BuildContext context) {
    final data = state.data;
    final readOnly = data.isReadOnly;
    final restant = _resteAVerifier(data);

    return Column(
      children: [
        ScreenHeader(
          title: 'Compte rendu',
          subtitle: '${data.patientName} · ${data.owner.name}',
        ),
        if (!readOnly)
          Padding(
            padding: EdgeInsets.fromLTRB(
              AppShape.of(context).gutter,
              0,
              AppShape.of(context).gutter,
              14,
            ),
            child: _Progress(data: data),
          ),
        Expanded(
          child: ListView(
            padding: EdgeInsets.fromLTRB(
              AppShape.of(context).gutter,
              0,
              AppShape.of(context).gutter,
              16,
            ),
            children: [
              if (readOnly) ...[
                NoticeBanner(
                  icon: Icons.check,
                  tone: NoticeTone.success,
                  message: data.status == ReportStatus.sent
                      ? 'Compte rendu envoyé'
                      : 'Compte rendu finalisé',
                ),
                const SizedBox(height: 14),
              ],
              if (state.message != null) ...[
                NoticeBanner(
                  icon: Icons.error_outline,
                  message: state.message!,
                ),
                const SizedBox(height: 14),
              ],
              for (final section in ReportSection.values)
                _Section(
                  section: section,
                  data: data,
                  busy: state.busy,
                  readOnly: readOnly,
                ),
            ],
          ),
        ),
        if (!readOnly)
          ActionDock(
            // Éteint, le bouton garde sa place et dit ce qui manque : le
            // faire disparaître laisserait croire que l'écran est fini.
            child: FilledButton(
              onPressed: data.canFinalize && !state.busy
                  ? () => context.push(
                      '/comptes-rendus/${data.reportId}/finaliser',
                    )
                  : null,
              child: Text(
                restant == 0
                    ? 'Terminer'
                    : 'Terminer — $restant à vérifier',
              ),
            ),
          ),
      ],
    );
  }
}

/// Ce qu'il reste à décider : les propositions non tranchées, plus les
/// sections vides qu'aucune proposition ne viendra fermer. C'est ce nombre
/// que le bouton final annonce, et il doit correspondre à ce qui bloque
/// réellement la finalisation.
int _resteAVerifier(ReportProposals data) {
  var reste = 0;
  for (final section in ReportSection.values) {
    final etat = data.sections[section] ?? SectionState.empty;
    if (etat == SectionState.confirmed || etat == SectionState.notApplicable) {
      continue;
    }
    final indecises = data.proposals
        .where((p) => p.section == section && !p.isDecided)
        .length;
    reste += indecises == 0 ? 1 : indecises;
  }
  return reste;
}

class _Progress extends StatelessWidget {
  const _Progress({required this.data});

  final ReportProposals data;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final total = data.proposals.length;
    final decidees = data.proposals.where((p) => p.isDecided).length;
    final part = total == 0 ? 0.0 : decidees / total;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              total == 0
                  ? 'Aucune proposition à vérifier'
                  : '$decidees proposition${decidees > 1 ? 's' : ''} '
                        'vérifiée${decidees > 1 ? 's' : ''} sur $total',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: palette.inkMuted,
              ),
            ),
            Text(
              '${(part * 100).round()} %',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: palette.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 7),
        ClipRRect(
          borderRadius: BorderRadius.circular(AppDesign.radiusPill),
          child: Container(
            height: 7,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppDesign.trackDark
                : AppDesign.trackLight,
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: part,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [palette.primary, palette.success],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.section,
    required this.data,
    required this.busy,
    required this.readOnly,
  });

  final ReportSection section;
  final ReportProposals data;
  final bool busy;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final proposals = data.proposals
        .where((p) => p.section == section)
        .toList();
    final sectionState = data.sections[section] ?? SectionState.empty;
    final decidees = proposals.where((p) => p.isDecided).toList();
    final indecises = proposals.where((p) => !p.isDecided).toList();

    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionLabel(
            sectionTitles[section]!,
            // Le libellé métier, jamais l'état machine.
            trailing: _SectionChip(state: sectionState, palette: palette),
          ),
          const SizedBox(height: 12),
          if (section == ReportSection.anatomical)
            // L'outil anatomique demande de la précision de pointage sur un
            // schéma corporel : c'est le pire écran possible sur un téléphone
            // tenu à bout de bras dans une écurie.
            SurfaceCard(
              radius: 24,
              child: Text(
                'Consultable et modifiable sur biume.app.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            )
          else ...[
            // Une seule question posée à la fois, en tête de section : ce qui
            // reste à faire passe devant ce qui est fait, et les suivantes
            // attendent leur tour, annoncées mais pas dépliées.
            if (indecises.isNotEmpty) ...[
              _ActiveProposal(
                proposal: indecises.first,
                transcript: data.transcript,
                busy: busy,
                readOnly: readOnly,
              ),
              if (indecises.length > 1)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(
                    '${indecises.length - 1} proposition'
                    '${indecises.length > 2 ? 's' : ''} restante'
                    '${indecises.length > 2 ? 's' : ''} dans cette section',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              if (decidees.isNotEmpty) const SizedBox(height: 12),
            ] else if (proposals.isEmpty) ...[
              Text(
                'Rien à vérifier ici.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              // Sans ce geste, une section que rien ne remplit resterait
              // indécise pour toujours et le compte rendu ne se fermerait
              // jamais.
              if (!readOnly &&
                  sectionState != SectionState.confirmed &&
                  sectionState != SectionState.notApplicable) ...[
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: busy
                      ? null
                      : () => context.read<ReportCubit>().decideWholeSection(
                          section,
                          SectionState.notApplicable,
                        ),
                  child: const Text('Sans objet pour cette séance'),
                ),
              ],
            ],
            for (final proposal in decidees)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _DecidedRow(proposal: proposal, palette: palette),
              ),
          ],
        ],
      ),
    );
  }
}

class _SectionChip extends StatelessWidget {
  const _SectionChip({required this.state, required this.palette});

  final SectionState state;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    final (foreground, background, border) = switch (state) {
      SectionState.confirmed => (
        palette.success,
        palette.successSurface,
        palette.successBorder,
      ),
      SectionState.notApplicable => (
        palette.inkSubtle,
        palette.surfaceMuted,
        null,
      ),
      _ => (palette.warning, palette.warningSurface, palette.warningBorder),
    };

    return StatusChip(
      label: sectionLabels[state]!,
      foreground: foreground,
      background: background,
      border: border,
    );
  }
}

/// La proposition en cours d'examen : le texte, la phrase d'où il vient, et
/// deux gestes. La citation est la traçabilité rendue visible — le praticien
/// vérifie d'où vient la phrase avant de l'envoyer au propriétaire.
class _ActiveProposal extends StatelessWidget {
  const _ActiveProposal({
    required this.proposal,
    required this.transcript,
    required this.busy,
    required this.readOnly,
  });

  final Proposal proposal;
  final String transcript;
  final bool busy;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    return SurfaceCard(
      radius: 24,
      padding: const EdgeInsets.all(18),
      borderColor: palette.primaryBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            proposal.text,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w500,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 13),
            decoration: BoxDecoration(
              color: palette.primarySurface,
              borderRadius: BorderRadius.circular(AppDesign.radiusControl),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DANS LA DICTÉE',
                  semanticsLabel: 'Dans la dictée',
                  style: AppTypography.chip(palette.primary).copyWith(
                    fontSize: 11,
                    letterSpacing: 0.9,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '« ${proposal.anchor.quote} »',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                    color: palette.inkMuted,
                  ),
                ),
              ],
            ),
          ),
          if (!readOnly) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: busy
                        ? null
                        : () =>
                              context.read<ReportCubit>().confirm(proposal.id),
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text('Valider'),
                    style: FilledButton.styleFrom(
                      backgroundColor: palette.success,
                      foregroundColor: palette.onSuccess,
                      minimumSize: const Size.fromHeight(
                        AppDesign.heightSecondary,
                      ),
                      textStyle: Theme.of(
                        context,
                      ).textTheme.bodyLarge?.copyWith(fontSize: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          AppDesign.radiusControl,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: busy
                        ? null
                        : () =>
                              context.read<ReportCubit>().dismiss(proposal.id),
                    child: const Text('Sans objet'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Ce qui est tranché se replie en une ligne calme : le travail fait doit se
/// voir sans reprendre la place du travail restant.
class _DecidedRow extends StatelessWidget {
  const _DecidedRow({required this.proposal, required this.palette});

  final Proposal proposal;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    final confirme = proposal.state == SectionState.confirmed;

    return SurfaceCard(
      radius: 24,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 26,
            height: 26,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              color: confirme ? palette.successSurface : palette.surfaceMuted,
              shape: BoxShape.circle,
              border: Border.all(
                color: confirme ? palette.successBorder : palette.border,
              ),
            ),
            child: Icon(
              confirme ? Icons.check : Icons.remove,
              size: 14,
              color: confirme ? palette.success : palette.inkSubtle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  proposal.text,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  sectionLabels[proposal.state]!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: confirme ? palette.success : palette.inkSubtle,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
