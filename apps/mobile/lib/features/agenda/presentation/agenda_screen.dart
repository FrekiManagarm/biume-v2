import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../config/app_design.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../../injection_container.dart';
import '../domain/agenda_repository.dart';
import '../domain/appointment.dart';
import 'agenda_cubit.dart';
import 'appointment_row.dart';

/// Câble le cubit depuis l'injection et déclenche le chargement.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de `load` se voie.
class AgendaPage extends StatelessWidget {
  const AgendaPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          AgendaCubit(getIt<AgendaRepository>())..load(DateTime.now()),
      child: const AgendaScreen(),
    );
  }
}

/// La tournée des huit jours. L'accueil ne montre qu'aujourd'hui ; ce qui
/// vient après se consulte ici, quand le praticien organise sa semaine plutôt
/// que sa prochaine heure.
class AgendaScreen extends StatelessWidget {
  const AgendaScreen({this.now, super.key});

  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<AgendaCubit, AgendaState>(
          // Un jour hors fenêtre est une réponse ponctuelle : elle s'affiche
          // dans une feuille modale ou un message, jamais en remplaçant la
          // fenêtre affichée en-dessous.
          listenWhen: (_, current) =>
              current is AgendaDayLoaded || current is AgendaDayUnavailable,
          listener: (context, state) => switch (state) {
            AgendaDayLoaded(:final day, :final appointments) =>
              _showDaySheet(context, day, appointments, now),
            AgendaDayUnavailable(:final message) => ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text(message))),
            _ => null,
          },
          buildWhen: (_, current) =>
              current is AgendaInitial ||
              current is AgendaLoading ||
              current is AgendaLoaded,
          builder: (context, state) => Column(
            children: [
              const ScreenHeader(title: 'Vos séances', subtitle: 'Huit jours'),
              Expanded(
                child: switch (state) {
                  AgendaInitial() || AgendaLoading() => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  AgendaLoaded(:final days, :final offlineMessage) => _Window(
                    days: days,
                    offlineMessage: offlineMessage,
                    now: now,
                  ),
                  AgendaDayLoaded() ||
                  AgendaDayUnavailable() => const SizedBox.shrink(),
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

void _showDaySheet(
  BuildContext context,
  DateTime day,
  List<Appointment> appointments,
  DateTime? now,
) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) => SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          AppShape.of(sheetContext).gutter,
          24,
          AppShape.of(sheetContext).gutter,
          24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              agendaDayLabel(day, now: now),
              style: Theme.of(sheetContext).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            if (appointments.isEmpty)
              Text(
                'Aucune séance',
                style: Theme.of(sheetContext).textTheme.bodyMedium,
              )
            else
              for (final appointment in appointments)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppDesign.gapList),
                  child: AppointmentRow(appointment, now: now),
                ),
          ],
        ),
      ),
    ),
  );
}

class _Window extends StatelessWidget {
  const _Window({
    required this.days,
    required this.offlineMessage,
    required this.now,
  });

  final List<AgendaDay> days;
  final String? offlineMessage;
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.fromLTRB(
        AppShape.of(context).gutter,
        0,
        AppShape.of(context).gutter,
        32,
      ),
      children: [
        if (offlineMessage != null) ...[
          // Le message dit « ces données peuvent dater », jamais « il n'y a
          // rien » : la fenêtre reste affichée.
          NoticeBanner(
            icon: Icons.wifi_off_outlined,
            message: '$offlineMessage Voici votre dernier agenda connu.',
          ),
          const SizedBox(height: 16),
        ],
        for (final day in days) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(
              agendaDayLabel(day.day, now: now),
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          if (day.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Text(
                'Aucune séance',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            )
          else ...[
            for (final appointment in day.appointments)
              Padding(
                padding: const EdgeInsets.only(bottom: AppDesign.gapList),
                child: AppointmentRow(appointment, now: now),
              ),
            const SizedBox(height: 16),
          ],
        ],
        const SizedBox(height: 8),
        Center(
          child: TextButton.icon(
            onPressed: () => _pickDate(context),
            icon: const Icon(Icons.calendar_month, size: 20),
            label: const Text('Une autre date'),
          ),
        ),
      ],
    );
  }

  Future<void> _pickDate(BuildContext context) async {
    final cubit = context.read<AgendaCubit>();
    final today = now ?? DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: today,
      firstDate: today.subtract(const Duration(days: 365)),
      lastDate: today.add(const Duration(days: 365)),
    );
    if (picked != null) {
      await cubit.showDay(picked);
    }
  }
}

/// « Aujourd'hui » et « Demain » se disent ainsi, jamais par leur date : un
/// praticien qui regarde son agenda ne compte pas les jours depuis
/// aujourd'hui, il lit un mot.
String agendaDayLabel(DateTime day, {DateTime? now}) {
  final reference = now ?? DateTime.now();
  final today = DateTime(reference.year, reference.month, reference.day);
  final tomorrow = today.add(const Duration(days: 1));

  if (day.year == today.year &&
      day.month == today.month &&
      day.day == today.day) {
    return "Aujourd'hui";
  }
  if (day.year == tomorrow.year &&
      day.month == tomorrow.month &&
      day.day == tomorrow.day) {
    return 'Demain';
  }
  final formatted = DateFormat('EEEE d MMMM', 'fr_FR').format(day);
  return formatted[0].toUpperCase() + formatted.substring(1);
}
