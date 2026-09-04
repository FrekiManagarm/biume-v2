import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

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
                  _HistoryTile(entry: entry, palette: palette),
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

/// Message lu quand ni un bouton ne fait rien, ni une exception ne remonte
/// nulle part : aucune application de téléphonie, une adresse mal formée, et
/// il ne devait plus rien se passer en silence — le praticien qui tape doit
/// savoir que ça n'a pas marché, pas croire à un écran figé.
const String _launchFailedMessage = "Impossible d'ouvrir cette application.";

class _OwnerCard extends StatelessWidget {
  const _OwnerCard({required this.owner, required this.palette});

  final Owner owner;
  final AppPalette palette;

  Future<void> _appeler(BuildContext context, String phone) =>
      _launch(context, Uri(scheme: 'tel', path: phone));

  Future<void> _ecrire(BuildContext context) =>
      _launch(context, Uri(scheme: 'mailto', path: owner.email));

  /// `launchUrl` renvoie `false`, sans lever d'exception, quand aucune
  /// application ne sait ouvrir l'adresse — et peut aussi lever une
  /// exception de plateforme selon l'échec. Les deux cas doivent se voir.
  Future<void> _launch(BuildContext context, Uri uri) async {
    var succeeded = false;
    try {
      succeeded = await launchUrl(uri);
    } catch (_) {
      succeeded = false;
    }
    if (succeeded || !context.mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text(_launchFailedMessage)));
  }

  @override
  Widget build(BuildContext context) {
    final phone = _normalizedPhone(owner.phone);

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

/// Un numéro saisi avec des espaces, points ou tirets ne doit pas partir tel
/// quel, simplement encodé, dans l'adresse `tel:` : seuls les chiffres et un
/// éventuel `+` international sont retenus.
String? _normalizedPhone(String? phone) {
  if (phone == null) return null;
  final digits = phone.replaceAll(RegExp('[^0-9+]'), '');
  return digits.isEmpty ? null : digits;
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.entry, required this.palette});

  final PatientHistoryEntry entry;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    final hasReport = entry.hasFinalizedReport;
    final subtitle = entry.consultationReason.isEmpty
        ? 'Sans motif'
        : entry.consultationReason;

    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(DateFormat('d MMMM yyyy', 'fr_FR').format(entry.beginAt.toLocal())),
      subtitle: Text(subtitle),
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
