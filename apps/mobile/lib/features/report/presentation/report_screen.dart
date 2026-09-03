import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_palette.dart';
import '../../../core/telemetry/telemetry.dart';
import '../../../injection_container.dart';
import '../domain/owner_email.dart';
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
      create: (_) =>
          ReportCubit(getIt<ReportRepository>(), telemetry: getIt<Telemetry>())
            ..load(reportId),
      child: const ReportScreen(),
    );
  }
}

/// Le mobile **valide, il n'édite pas**.
///
/// Chaque proposition offre trois gestes et trois seulement : confirmer,
/// écarter, voir la source. Aucun champ de saisie de texte libre n'existe sur
/// cet écran, hormis l'adresse électronique du propriétaire quand elle
/// manque — la seule autre saisie de l'application est la correction de
/// transcription.
class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  // Le compte rendu voyage vers le suivi avec son identifiant de parcours de
  // télémétrie — porté ici depuis le dernier `ReportLoaded` vu, puisque
  // `ReportFinalized` ne le transporte pas lui-même.
  String? _captureId;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Scaffold(
      appBar: AppBar(title: const Text('Compte rendu')),
      body: SafeArea(
        child: BlocListener<ReportCubit, ReportState>(
          listener: (context, state) {
            if (state is ReportLoaded) {
              _captureId = state.data.captureId;
            } else if (state is ReportFinalized) {
              context.pushReplacement(
                '/comptes-rendus/${state.reportId}/suivi'
                '?capture=${_captureId ?? ''}',
              );
            }
          },
          child: BlocBuilder<ReportCubit, ReportState>(
            builder: (context, state) => switch (state) {
              ReportInitial() || ReportLoading() => const Center(
                child: CircularProgressIndicator(),
              ),
              ReportPreparing() => _Preparing(palette: palette),
              ReportUnavailable(:final message) => Center(child: Text(message)),
              ReportLoaded() => _Proposals(state),
              ReportFinalized() => const Center(
                child: CircularProgressIndicator(),
              ),
            },
          ),
        ),
      ),
    );
  }
}

class _Preparing extends StatelessWidget {
  const _Preparing({required this.palette});

  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
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
              style: TextStyle(color: palette.inkMuted),
            ),
          ],
        ),
      ),
    );
  }
}

class _Proposals extends StatelessWidget {
  const _Proposals(this.state);

  final ReportLoaded state;

  Future<void> _finaliser(BuildContext context) async {
    final cubit = context.read<ReportCubit>();
    final data = state.data;

    if (data.owner.email != null) {
      cubit.finalize(sendToOwner: true);
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      // showModalBottomSheet insère la feuille au-dessus du Navigator : elle
      // n'hérite pas du `BlocProvider` posé par `ReportPage`, il faut le
      // reproposer explicitement.
      builder: (sheetContext) => BlocProvider.value(
        value: cubit,
        child: _MissingEmailSheet(ownerName: data.owner.name),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;
    final data = state.data;
    final readOnly = data.isReadOnly;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (readOnly)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: palette.successSurface,
              border: Border.all(color: palette.successBorder),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              data.status == ReportStatus.sent
                  ? 'Compte rendu envoyé'
                  : 'Compte rendu finalisé',
              style: TextStyle(color: palette.ink),
            ),
          ),
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
            data: data,
            palette: palette,
            busy: state.busy,
            readOnly: readOnly,
          ),
        if (!readOnly) ...[
          const SizedBox(height: 24),
          FilledButton(
            onPressed: data.canFinalize && !state.busy
                ? () => _finaliser(context)
                : null,
            child: const Text('Finaliser et partager'),
          ),
        ],
      ],
    );
  }
}

/// Le garde-fou de l'adresse manquante est un geste, pas un blocage : la
/// feuille propose d'ajouter l'adresse et d'envoyer, ou de finaliser sans
/// envoyer.
class _MissingEmailSheet extends StatefulWidget {
  const _MissingEmailSheet({required this.ownerName});

  final String ownerName;

  @override
  State<_MissingEmailSheet> createState() => _MissingEmailSheetState();
}

class _MissingEmailSheetState extends State<_MissingEmailSheet> {
  final _controller = TextEditingController();
  String? _erreur;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Validée sur place. Une adresse vide ou malformée reviendrait du serveur
  /// en message générique, après un aller-retour, et sans dire quoi corriger.
  void _enregistrerEtEnvoyer() {
    final erreur = ownerEmailError(_controller.text);
    if (erreur != null) {
      setState(() => _erreur = erreur);
      return;
    }

    final cubit = context.read<ReportCubit>();
    Navigator.of(context).pop();
    cubit.addOwnerEmailThenFinalize(normalizeOwnerEmail(_controller.text));
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ReportCubit>();

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: 24 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "${widget.ownerName} n'a pas d'adresse e-mail. Sans elle, Biume "
            'ne peut pas lui envoyer le compte rendu.',
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            decoration: InputDecoration(
              hintText: 'Adresse e-mail',
              errorText: _erreur,
            ),
            onChanged: (_) {
              if (_erreur != null) setState(() => _erreur = null);
            },
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _enregistrerEtEnvoyer,
            child: const Text('Enregistrer et envoyer'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              cubit.finalize(sendToOwner: false);
            },
            child: const Text('Finaliser sans envoyer'),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.section,
    required this.data,
    required this.palette,
    required this.busy,
    required this.readOnly,
  });

  final ReportSection section;
  final ReportProposals data;
  final AppPalette palette;
  final bool busy;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final proposals = data.proposals
        .where((p) => p.section == section)
        .toList();
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
              _ProposalCard(
                proposal: proposal,
                palette: palette,
                busy: busy,
                readOnly: readOnly,
              ),
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
    required this.readOnly,
  });

  final Proposal proposal;
  final AppPalette palette;
  final bool busy;
  final bool readOnly;

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
            if (readOnly || proposal.isDecided)
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
                          : () => context.read<ReportCubit>().confirm(
                              proposal.id,
                            ),
                      child: const Text('Valider'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: busy
                          ? null
                          : () => context.read<ReportCubit>().dismiss(
                              proposal.id,
                            ),
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
