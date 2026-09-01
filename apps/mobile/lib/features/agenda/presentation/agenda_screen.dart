import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../config/app_palette.dart';
import '../../../injection_container.dart';
import '../domain/agenda_repository.dart';
import '../domain/appointment.dart';
import 'agenda_cubit.dart';

class AgendaScreen extends StatelessWidget {
  const AgendaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          AgendaCubit(getIt<AgendaRepository>())..load(DateTime.now()),
      child: const _AgendaView(),
    );
  }
}

class _AgendaView extends StatelessWidget {
  const _AgendaView();

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Scaffold(
      appBar: AppBar(title: const Text('Vos séances')),
      floatingActionButton: FloatingActionButton.extended(
        // La capture libre : le PRODUCT.md la prévoit dès l'étape 1 du
        // parcours, pour une séance qui n'était pas à l'agenda.
        onPressed: () => context.push('/dicter'),
        icon: const Icon(Icons.mic),
        label: const Text('Dicter'),
      ),
      body: SafeArea(
        child: BlocBuilder<AgendaCubit, AgendaState>(
          builder: (context, state) => switch (state) {
            AgendaInitial() || AgendaLoading() => const Center(
              child: CircularProgressIndicator(),
            ),
            AgendaLoaded(:final appointments, :final offlineMessage) => Column(
              children: [
                if (offlineMessage != null)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: palette.warningSurface,
                      border: Border.all(color: palette.warningBorder),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    // Le message dit « ces données peuvent dater », jamais
                    // « il n'y a rien » : la liste reste affichée.
                    child: Text(
                      "$offlineMessage Voici votre dernier agenda connu.",
                      style: TextStyle(color: palette.ink),
                    ),
                  ),
                Expanded(
                  child: appointments.isEmpty
                      ? Center(
                          child: Text(
                            "Aucune séance aujourd'hui.",
                            style: TextStyle(color: palette.inkMuted),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: appointments.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) =>
                              _AppointmentCard(appointments[index]),
                        ),
                ),
              ],
            ),
          },
        ),
      ),
    );
  }
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
            Text(
              DateFormat.Hm('fr_FR').format(appointment.beginAt.toLocal()),
              style: TextStyle(color: palette.inkSubtle),
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
