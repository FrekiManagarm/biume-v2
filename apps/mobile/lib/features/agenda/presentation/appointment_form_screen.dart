import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../config/app_palette.dart';
import '../../../core/lifecycle/foreground_refresh.dart';
import '../../../injection_container.dart';
import '../../records/domain/patient.dart';
import '../../records/domain/patient_repository.dart';
import '../domain/appointment.dart';
import '../domain/appointment_write_repository.dart';
import 'appointment_form_cubit.dart';

/// Câble le cubit depuis l'injection.
///
/// En création avec un animal préchoisi (`?animal=` porté par la route
/// depuis une fiche animal), résout l'identifiant contre le cache local
/// avant de construire le cubit : aucune requête réseau pour un simple
/// préremplissage.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de câblage se voie.
class AppointmentFormPage extends StatelessWidget {
  const AppointmentFormPage({this.existing, this.patientId, super.key});

  /// Non nul en déplacement.
  final Appointment? existing;

  /// Identifiant de l'animal préchoisi, en création seulement.
  final String? patientId;

  @override
  Widget build(BuildContext context) {
    if (existing != null || patientId == null) {
      return _CubitProvider(existing: existing, initialPatient: null);
    }

    return FutureBuilder<List<Patient>>(
      future: getIt<PatientRepository>().watchAll().first,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        Patient? match;
        for (final patient in snapshot.data!) {
          if (patient.id == patientId) {
            match = patient;
            break;
          }
        }
        return _CubitProvider(existing: existing, initialPatient: match);
      },
    );
  }
}

class _CubitProvider extends StatelessWidget {
  const _CubitProvider({required this.existing, required this.initialPatient});

  final Appointment? existing;
  final Patient? initialPatient;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          AppointmentFormCubit(
              getIt<AppointmentWriteRepository>(),
              existing: existing,
              initialPatient: initialPatient,
              now: DateTime.now,
            )
            ..start(),
      child: const AppointmentFormScreen(),
    );
  }
}

/// Cinq champs, dont trois déjà remplis en déplacement. Un chevauchement
/// n'est jamais montré avant l'écriture : le serveur écrit d'abord, et
/// l'écran ne fait que rapporter ce qu'il a signalé.
class AppointmentFormScreen extends StatelessWidget {
  const AppointmentFormScreen({
    this.onForegroundRefresh = refreshForeground,
    super.key,
  });

  /// Ce qui rend l'agenda à jour après une écriture réussie. Injectable pour
  /// que l'écran reste testable sans conteneur d'injection ; en production
  /// c'est le rafraîchissement de premier plan.
  final Future<void> Function() onForegroundRefresh;

  @override
  Widget build(BuildContext context) {
    final isMove = context.read<AppointmentFormCubit>().isMove;

    return Scaffold(
      appBar: AppBar(
        title: Text(isMove ? 'Déplacer la séance' : 'Nouvelle séance'),
      ),
      body: SafeArea(
        child: BlocConsumer<AppointmentFormCubit, AppointmentFormState>(
          listenWhen: (previous, current) =>
              previous.saved == null && current.saved != null,
          // L'agenda doit refléter le changement dès que l'écriture a
          // réussi, conflits ou pas.
          listener: (_, _) => unawaited(onForegroundRefresh()),
          builder: (context, state) {
            if (state.saved != null) {
              return _Confirmation(saved: state.saved!, isMove: isMove);
            }
            return _Form(state: state, isMove: isMove);
          },
        ),
      ),
    );
  }
}

class _Form extends StatelessWidget {
  const _Form({required this.state, required this.isMove});

  final AppointmentFormState state;
  final bool isMove;

  Future<void> _choisirAnimal(BuildContext context) async {
    final patient = await context.push<Patient>('/animaux/choisir');
    if (patient != null && context.mounted) {
      context.read<AppointmentFormCubit>().choosePatient(patient);
    }
  }

  Future<void> _choisirJour(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: state.day,
      firstDate: now.subtract(const Duration(days: 365)),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null && context.mounted) {
      context.read<AppointmentFormCubit>().chooseDay(picked);
    }
  }

  Future<void> _choisirHeure(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: state.start,
    );
    if (picked != null && context.mounted) {
      context.read<AppointmentFormCubit>().chooseStart(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;
    final dayLabel = DateFormat('EEEE d MMMM', 'fr_FR').format(state.day);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (state.message != null)
          _MessageBanner(message: state.message!, offline: state.offline, palette: palette),
        if (!isMove) ...[
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(state.patient?.name ?? 'Choisir un animal'),
            subtitle: state.patient != null
                ? Text(state.patient!.subtitle)
                : null,
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _choisirAnimal(context),
          ),
          const Divider(height: 24),
        ],
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Jour'),
          subtitle: Text(dayLabel[0].toUpperCase() + dayLabel.substring(1)),
          trailing: const Icon(Icons.calendar_month),
          onTap: () => _choisirJour(context),
        ),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Heure'),
          subtitle: Text(state.start.format(context)),
          trailing: const Icon(Icons.schedule),
          onTap: () => _choisirHeure(context),
        ),
        if (!isMove) ...[
          const SizedBox(height: 16),
          Text('Durée', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          SegmentedButton<int>(
            segments: [
              for (final minutes in appointmentDurationOptionsMinutes)
                ButtonSegment(value: minutes, label: Text('$minutes min')),
            ],
            // La durée par défaut vient du cache et peut ne correspondre à
            // aucun des quatre choix proposés : dans ce cas, rien n'est
            // sélectionné plutôt qu'un choix erroné imposé au praticien.
            selected:
                appointmentDurationOptionsMinutes.contains(
                  state.duration.inMinutes,
                )
                ? {state.duration.inMinutes}
                : const <int>{},
            emptySelectionAllowed: true,
            onSelectionChanged: (selection) {
              if (selection.isEmpty) return;
              context.read<AppointmentFormCubit>().chooseDuration(
                Duration(minutes: selection.first),
              );
            },
          ),
          const SizedBox(height: 16),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('À domicile'),
            value: state.atHome,
            onChanged: (value) =>
                context.read<AppointmentFormCubit>().toggleAtHome(value),
          ),
        ],
        const SizedBox(height: 24),
        FilledButton(
          onPressed: state.busy
              ? null
              : () => context.read<AppointmentFormCubit>().submit(),
          child: Text(isMove ? 'Déplacer la séance' : 'Prendre la séance'),
        ),
      ],
    );
  }
}

class _MessageBanner extends StatelessWidget {
  const _MessageBanner({
    required this.message,
    required this.offline,
    required this.palette,
  });

  final String message;
  final bool offline;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    final surface = offline ? palette.warningSurface : palette.dangerSurface;
    final border = offline ? palette.warningBorder : palette.dangerBorder;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surface,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(message, style: TextStyle(color: palette.ink)),
          // Hors ligne, la création est impossible, mais deux gestes
          // restent possibles : dicter tout de suite, rattacher plus tard.
          // Un praticien ne doit jamais rester devant un échec muet.
          if (offline) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: OutlinedButton(
                onPressed: () => context.push('/dicter'),
                child: const Text('Dicter'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Le geste terminal, une fois l'écriture faite. Les conflits sont montrés
/// ici, jamais avant : le serveur écrit d'abord, puis signale.
class _Confirmation extends StatelessWidget {
  const _Confirmation({required this.saved, required this.isMove});

  final AppointmentWriteOutcome saved;
  final bool isMove;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          isMove ? 'La séance est déplacée.' : 'La séance est prise.',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        if (saved.conflicts.isNotEmpty) ...[
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: palette.warningSurface,
              border: Border.all(color: palette.warningBorder),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final conflict in saved.conflicts)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      conflict.sentence,
                      style: TextStyle(color: palette.ink),
                    ),
                  ),
                Text(
                  'La séance est prise quand même.',
                  style: TextStyle(
                    color: palette.ink,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 24),
        FilledButton(
          onPressed: () => context.pop(),
          child: const Text('Terminé'),
        ),
      ],
    );
  }
}
