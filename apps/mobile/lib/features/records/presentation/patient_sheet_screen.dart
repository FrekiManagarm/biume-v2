import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/contact/contact_actions.dart';
import '../../../config/app_palette.dart';
import '../../../injection_container.dart';
import '../domain/owner_repository.dart';
import '../domain/patient.dart';
import '../domain/patient_history.dart';
import '../domain/patient_repository.dart';
import 'patient_sheet_cubit.dart';

/// Câble le cubit depuis l'injection et déclenche le chargement.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de `load` se voie.
class PatientSheetPage extends StatelessWidget {
  const PatientSheetPage({required this.patientId, super.key});

  final String patientId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          PatientSheetCubit(getIt<PatientRepository>(), getIt<OwnerRepository>())
            ..load(patientId),
      child: const PatientSheetScreen(),
    );
  }
}

/// La fiche « avant la séance » : ce que l'ostéopathe consulte cinq minutes
/// avant d'entrer, souvent sans réseau. En lecture seule — la gestion des
/// dossiers reste sur le web, aucune saisie n'a sa place ici.
class PatientSheetScreen extends StatelessWidget {
  const PatientSheetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fiche animal')),
      body: SafeArea(
        child: BlocBuilder<PatientSheetCubit, PatientSheetState>(
          builder: (context, state) => switch (state) {
            PatientSheetInitial() => const Center(
              child: CircularProgressIndicator(),
            ),
            PatientSheetUnavailable(:final message) => Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(message, textAlign: TextAlign.center),
              ),
            ),
            PatientSheetLoaded() => _Sheet(state),
          },
        ),
      ),
    );
  }
}

class _Sheet extends StatelessWidget {
  const _Sheet(this.state);

  final PatientSheetLoaded state;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;
    final sheet = state.sheet;
    final patient = sheet.patient;

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (state.offlineMessage != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: palette.warningSurface,
                    border: Border.all(color: palette.warningBorder),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  // L'historique peut dater : la fiche reste affichée, ce
                  // message le dit sans jamais la vider.
                  child: Text(
                    "${state.offlineMessage} Voici les dernières séances connues.",
                    style: TextStyle(color: palette.ink),
                  ),
                ),
              Text(patient.name, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text(
                _headerSubtitle(patient, sheet.ageYears),
                style: TextStyle(color: palette.inkMuted),
              ),
              const SizedBox(height: 20),
              _OwnerCard(owner: sheet.owner, palette: palette),
              const SizedBox(height: 24),
              Text(
                'Dernières séances',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              if (sheet.history.isEmpty)
                Text(
                  'Aucune séance récente.',
                  style: TextStyle(color: palette.inkMuted),
                )
              else
                for (final entry in sheet.history)
                  _HistoryTile(
                    entry: entry,
                    // Le chevron ne s'affiche que sur ce qui s'ouvrira
                    // réellement : hors ligne, ce que le préchargement a
                    // rangé ; en ligne, tout ce qui est finalisé.
                    openable:
                        entry.reportId != null &&
                        state.openableReportIds.contains(entry.reportId),
                    palette: palette,
                  ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: FilledButton(
              onPressed: () =>
                  context.push('/seances/nouvelle?animal=${patient.id}'),
              child: const Text('Prendre une séance'),
            ),
          ),
        ),
      ],
    );
  }
}

/// « Chien · Berger · 5 ans » — chaque segment n'apparaît que s'il est connu :
/// une race ou un âge manquant se tait, plutôt que d'afficher un tiret.
String _headerSubtitle(Patient patient, int? ageYears) {
  final segments = [
    speciesLabels[patient.species] ?? patient.species,
    if (patient.breed != null) patient.breed!,
    if (ageYears != null) '$ageYears ans',
  ];
  return segments.join(' · ');
}

class _OwnerCard extends StatelessWidget {
  const _OwnerCard({required this.owner, required this.palette});

  final Owner owner;
  final AppPalette palette;

  Future<void> _appeler(BuildContext context, String phone) =>
      launchContact(context, Uri(scheme: 'tel', path: phone));

  Future<void> _ecrire(BuildContext context) =>
      launchContact(context, Uri(scheme: 'mailto', path: owner.email));

  @override
  Widget build(BuildContext context) {
    final phone = normalizedPhone(owner.phone);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette.surface,
        border: Border.all(color: palette.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(owner.name, style: Theme.of(context).textTheme.titleMedium),
          if (owner.city != null) ...[
            const SizedBox(height: 4),
            Text(owner.city!, style: TextStyle(color: palette.inkMuted)),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: phone != null ? () => _appeler(context, phone) : null,
                  icon: const Icon(Icons.call_outlined),
                  label: const Text('Appeler'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: owner.email != null ? () => _ecrire(context) : null,
                  icon: const Icon(Icons.email_outlined),
                  label: const Text('Écrire'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({
    required this.entry,
    required this.openable,
    required this.palette,
  });

  final PatientHistoryEntry entry;

  /// Ce compte rendu s'ouvrira vraiment si on tape dessus. Hors ligne, un
  /// seul compte rendu par animal est préchargé : mettre un chevron sur les
  /// autres promet un écran d'erreur.
  final bool openable;

  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    final hasReport = entry.hasFinalizedReport && openable;
    final subtitle = entry.consultationReason.isEmpty
        ? 'Sans motif'
        : entry.consultationReason;

    return ListTile(
      contentPadding: EdgeInsets.zero,
      isThreeLine: true,
      title: Text(DateFormat('d MMMM yyyy', 'fr_FR').format(entry.beginAt.toLocal())),
      // Le motif **et** l'état du compte rendu (spécification 5.10) : sans
      // lui, seul le chevron distinguait ce qui s'ouvre, et une séance sans
      // compte rendu ressemblait à une séance simplement non consultable.
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(subtitle),
          const SizedBox(height: 2),
          Text(
            entry.reportLabel,
            style: TextStyle(color: palette.inkSubtle),
          ),
        ],
      ),
      // Un brouillon ne se consulte pas : lui donner un chevron laisserait
      // croire qu'un compte rendu existe déjà, alors qu'il n'existe pas
      // encore vraiment pour le praticien pressé devant l'écurie.
      trailing: hasReport
          ? Icon(Icons.chevron_right, color: palette.inkSubtle)
          : null,
      onTap: hasReport
          ? () => context.push('/comptes-rendus/${entry.reportId}?source=fiche')
          : null,
    );
  }
}
