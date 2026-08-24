import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../config/app_palette.dart';
import '../../../injection_container.dart';
import '../domain/proposal.dart';
import '../domain/report_repository.dart';
import 'report_cubit.dart';

/// Câble le cubit et déclenche le chargement.
///
/// Séparé de l'écran présentationnel pour que celui-ci soit testable sans
/// conteneur d'injection — et pour qu'un oubli de `load` se voie.
class ReportPage extends StatelessWidget {
  const ReportPage({required this.reportId, super.key});

  final String reportId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ReportCubit(getIt<ReportRepository>())..load(reportId),
      child: const ReportScreen(),
    );
  }
}

/// Le mobile **valide, il n'édite pas**.
///
/// Chaque proposition offre trois gestes et trois seulement : confirmer,
/// écarter, voir la source. Aucun champ de saisie de texte libre n'existe sur
/// cet écran — la seule saisie de l'application est la correction de
/// transcription.
class ReportScreen extends StatelessWidget {
  const ReportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Compte rendu')),
      body: SafeArea(
        child: BlocBuilder<ReportCubit, ReportState>(
          builder: (context, state) => switch (state) {
            ReportInitial() || ReportLoading() => const Center(
              child: CircularProgressIndicator(),
            ),
            ReportUnavailable(:final message) => Center(child: Text(message)),
            ReportLoaded() => _Proposals(state),
          },
        ),
      ),
    );
  }
}

class _Proposals extends StatelessWidget {
  const _Proposals(this.state);

  final ReportLoaded state;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (state.message != null)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: palette.warningSurface,
              border: Border.all(color: palette.warningBorder),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(state.message!, style: TextStyle(color: palette.ink)),
          ),
        for (final section in ReportSection.values)
          _Section(
            section: section,
            data: state.data,
            palette: palette,
            busy: state.busy,
          ),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: state.data.canFinalize && !state.busy ? () {} : null,
          child: const Text('Finaliser et partager'),
        ),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.section,
    required this.data,
    required this.palette,
    required this.busy,
  });

  final ReportSection section;
  final ReportProposals data;
  final AppPalette palette;
  final bool busy;

  @override
  Widget build(BuildContext context) {
    final proposals =
        data.proposals.where((p) => p.section == section).toList();
    final sectionState = data.sections[section] ?? SectionState.empty;

    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                sectionTitles[section]!,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              // Le libellé métier, jamais l'état machine.
              Text(
                sectionLabels[sectionState]!,
                style: TextStyle(color: palette.inkSubtle),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (section == ReportSection.anatomical)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: palette.surfaceMuted,
                border: Border.all(color: palette.border),
                borderRadius: BorderRadius.circular(14),
              ),
              // L'outil anatomique demande de la précision de pointage sur un
              // schéma corporel : c'est le pire écran possible sur un téléphone
              // tenu à bout de bras dans une écurie.
              child: Text(
                'Consultable et modifiable sur biume.app.',
                style: TextStyle(color: palette.inkMuted),
              ),
            )
          else if (proposals.isEmpty)
            Text(
              'Rien à vérifier ici.',
              style: TextStyle(color: palette.inkMuted),
            )
          else
            for (final proposal in proposals)
              _ProposalCard(proposal: proposal, palette: palette, busy: busy),
        ],
      ),
    );
  }
}

class _ProposalCard extends StatelessWidget {
  const _ProposalCard({
    required this.proposal,
    required this.palette,
    required this.busy,
  });

  final Proposal proposal;
  final AppPalette palette;
  final bool busy;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(proposal.text),
            const SizedBox(height: 8),
            // La traçabilité rendue visible : le praticien vérifie d'où vient
            // la phrase avant de l'envoyer au propriétaire.
            Text(
              '« ${proposal.anchor.quote} »',
              style: TextStyle(
                color: palette.inkSubtle,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 16),
            if (proposal.isDecided)
              Text(
                sectionLabels[proposal.state]!,
                style: TextStyle(color: palette.success),
              )
            else
              Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: busy
                          ? null
                          : () =>
                                context.read<ReportCubit>().confirm(proposal.id),
                      child: const Text('Valider'),
                    ),
                  ),
                  const SizedBox(width: 12),
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
        ),
      ),
    );
  }
}
