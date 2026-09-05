import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../core/ui/biume_widgets.dart';
import 'agenda_cubit.dart';
import 'appointment_row.dart';

/// Les séances du jour sur l'accueil, sans `Scaffold` ni `AppBar` : ce bloc
/// vit dans la liste défilante de l'accueil, sous « À traiter ». Un
/// `BlocProvider<AgendaCubit>` doit exister au-dessus.
///
/// Seul aujourd'hui s'affiche ici. La fenêtre de huit jours a son écran :
/// empilée sous « À traiter », elle repoussait le socle hors de portée du
/// pouce sans rien dire de plus sur l'heure qui vient.
class AgendaBody extends StatelessWidget {
  const AgendaBody({this.now, super.key});

  /// Injectable pour que « Maintenant » soit vérifiable sans dépendre de
  /// l'horloge de la machine.
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AgendaCubit, AgendaState>(
      buildWhen: (_, current) =>
          current is AgendaInitial ||
          current is AgendaLoading ||
          current is AgendaLoaded,
      builder: (context, state) => Padding(
        padding: EdgeInsets.symmetric(horizontal: AppShape.of(context).gutter),
        child: switch (state) {
          AgendaInitial() || AgendaLoading() => const Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: CircularProgressIndicator()),
          ),
          AgendaLoaded(:final days, :final offlineMessage) => _Today(
            day: days.isEmpty ? null : days.first,
            offlineMessage: offlineMessage,
            now: now,
          ),
          AgendaDayLoaded() || AgendaDayUnavailable() => const SizedBox.shrink(),
        },
      ),
    );
  }
}

class _Today extends StatelessWidget {
  const _Today({
    required this.day,
    required this.offlineMessage,
    required this.now,
  });

  final AgendaDay? day;
  final String? offlineMessage;
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final appointments = day?.appointments ?? const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Aujourd'hui",
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            // La suite de la tournée existe, elle n'encombre pas l'accueil.
            GestureDetector(
              onTap: () => context.push('/agenda'),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                child: Text(
                  '8 jours',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontSize: 14,
                    color: palette.primary,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        if (offlineMessage != null) ...[
          // Le message dit « ces données peuvent dater », jamais « il n'y a
          // rien » : la journée reste affichée.
          NoticeBanner(
            icon: Icons.wifi_off_outlined,
            message: '$offlineMessage Voici votre dernier agenda connu.',
          ),
          const SizedBox(height: 12),
        ],
        if (appointments.isEmpty)
          Text(
            'Aucune séance aujourd\'hui.',
            style: Theme.of(context).textTheme.bodyMedium,
          )
        else
          for (final appointment in appointments)
            Padding(
              padding: const EdgeInsets.only(bottom: AppDesign.gapList),
              child: AppointmentRow(appointment, now: now),
            ),
      ],
    );
  }
}
