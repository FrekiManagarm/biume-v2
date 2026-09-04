import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../config/app_palette.dart';
import '../domain/appointment.dart';
import 'agenda_cubit.dart';

/// Le contenu de l'agenda sur huit jours, sans `Scaffold` ni `AppBar` : il vit
/// dans la liste défilante de l'accueil, sous « À traiter ». Un
/// `BlocProvider<AgendaCubit>` doit exister au-dessus.
class AgendaBody extends StatelessWidget {
  const AgendaBody({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AgendaCubit, AgendaState>(
      // Un jour hors fenêtre est une réponse ponctuelle : elle s'affiche dans
      // une feuille modale ou un message, jamais en remplaçant la fenêtre
      // affichée en-dessous.
      listenWhen: (_, current) =>
          current is AgendaDayLoaded || current is AgendaDayUnavailable,
      listener: (context, state) => switch (state) {
        AgendaDayLoaded(:final day, :final appointments) =>
          _showDaySheet(context, day, appointments),
        AgendaDayUnavailable(:final message) => ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message))),
        _ => null,
      },
      buildWhen: (_, current) =>
          current is AgendaInitial ||
          current is AgendaLoading ||
          current is AgendaLoaded,
      builder: (context, state) => switch (state) {
        AgendaInitial() || AgendaLoading() => const Padding(
          padding: EdgeInsets.all(32),
          child: Center(child: CircularProgressIndicator()),
        ),
        AgendaLoaded(:final days, :final offlineMessage) =>
          _AgendaWindow(days: days, offlineMessage: offlineMessage),
        AgendaDayLoaded() || AgendaDayUnavailable() => const SizedBox.shrink(),
      },
    );
  }

  void _showDaySheet(
    BuildContext context,
    DateTime day,
    List<Appointment> appointments,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => _DaySheet(day: day, appointments: appointments),
    );
  }
}

class _AgendaWindow extends StatelessWidget {
  const _AgendaWindow({required this.days, required this.offlineMessage});

  final List<AgendaDay> days;
  final String? offlineMessage;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Vos séances', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          if (offlineMessage != null)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: palette.warningSurface,
                border: Border.all(color: palette.warningBorder),
                borderRadius: BorderRadius.circular(14),
              ),
              // Le message dit « ces données peuvent dater », jamais
              // « il n'y a rien » : la fenêtre reste affichée.
              child: Text(
                "$offlineMessage Voici votre dernier agenda connu.",
                style: TextStyle(color: palette.ink),
              ),
            ),
          // Non défilante : elle vit dans le `ListView` de l'accueil, qui
          // porte le seul défilement de l'écran.
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: days.length,
            separatorBuilder: (_, _) => const SizedBox(height: 20),
            itemBuilder: (context, index) => _DaySection(day: days[index]),
          ),
          const SizedBox(height: 8),
          Center(
            child: TextButton.icon(
              onPressed: () => _pickDate(context),
              icon: const Icon(Icons.calendar_month),
              label: const Text('Une autre date'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDate(BuildContext context) async {
    final cubit = context.read<AgendaCubit>();
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now.subtract(const Duration(days: 365)),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      await cubit.showDay(picked);
    }
  }
}

class _DaySection extends StatelessWidget {
  const _DaySection({required this.day});

  final AgendaDay day;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _dayLabel(day.day),
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        if (day.isEmpty)
          Text('Aucune séance', style: TextStyle(color: palette.inkMuted))
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: day.appointments.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) =>
                _AppointmentCard(day.appointments[index]),
          ),
      ],
    );
  }
}

class _DaySheet extends StatelessWidget {
  const _DaySheet({required this.day, required this.appointments});

  final DateTime day;
  final List<Appointment> appointments;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 24, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _dayLabel(day),
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            if (appointments.isEmpty)
              Text('Aucune séance', style: TextStyle(color: palette.inkMuted))
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: appointments.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, index) =>
                    _AppointmentCard(appointments[index]),
              ),
          ],
        ),
      ),
    );
  }
}

/// « Aujourd'hui » et « Demain » se disent ainsi, jamais par leur date : un
/// praticien qui regarde son agenda ne compte pas les jours depuis
/// aujourd'hui, il lit un mot.
String _dayLabel(DateTime day) {
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
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

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard(this.appointment);

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;
    final now = DateTime.now();

    // Le libellé dit le geste, jamais l'état interne du système. Cette table
    // de décision est celle du web : il n'y en a pas une seconde.
    final label = appointment.isCancelled
        ? 'Annulé'
        : appointment.isDone(now)
        ? 'Créer le compte rendu'
        : 'Préparer le compte rendu';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat.Hm('fr_FR').format(appointment.beginAt.toLocal()),
                  style: TextStyle(color: palette.inkSubtle),
                ),
                // Annulée, une séance ne se déplace plus : il n'y a plus de
                // créneau à lui trouver.
                PopupMenuButton<String>(
                  tooltip: 'Options',
                  enabled: !appointment.isCancelled,
                  onSelected: (value) => switch (value) {
                    'deplacer' => context.push(
                      '/seances/${appointment.id}/deplacer',
                      extra: appointment,
                    ),
                    _ => null,
                  },
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'deplacer', child: Text('Déplacer')),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              appointment.patientName,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: appointment.isCancelled
                  ? null
                  : () => context.push('/dicter?rdv=${appointment.id}'),
              child: Text(label),
            ),
          ],
        ),
      ),
    );
  }
}
