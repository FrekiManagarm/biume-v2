import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../config/app_palette.dart';
import '../domain/appointment.dart';
import 'agenda_cubit.dart';

/// Le contenu de l'agenda du jour, sans `Scaffold` ni `AppBar` : il vit dans
/// la liste défilante de l'accueil, sous « À traiter ». Un `BlocProvider<
/// AgendaCubit>` doit exister au-dessus.
class AgendaBody extends StatelessWidget {
  const AgendaBody({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return BlocBuilder<AgendaCubit, AgendaState>(
      builder: (context, state) => switch (state) {
        AgendaInitial() || AgendaLoading() => const Padding(
          padding: EdgeInsets.all(32),
          child: Center(child: CircularProgressIndicator()),
        ),
        AgendaLoaded(:final appointments, :final offlineMessage) => Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Vos séances',
                style: Theme.of(context).textTheme.titleLarge,
              ),
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
                  // « il n'y a rien » : la liste reste affichée.
                  child: Text(
                    "$offlineMessage Voici votre dernier agenda connu.",
                    style: TextStyle(color: palette.ink),
                  ),
                ),
              if (appointments.isEmpty)
                Text(
                  "Aucune séance aujourd'hui.",
                  style: TextStyle(color: palette.inkMuted),
                )
              else
                // Non défilante : elle vit dans le `ListView` de l'accueil,
                // qui porte le seul défilement de l'écran.
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
      },
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
