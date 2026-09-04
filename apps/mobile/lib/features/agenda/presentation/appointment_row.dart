import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../config/app_design.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../records/domain/patient.dart';
import '../domain/appointment.dart';

/// Une séance dans une liste : l'heure à gauche, l'animal et l'état du compte
/// rendu au milieu. La séance en cours prend la surface violette et porte la
/// pastille « Maintenant » sur la ligne du titre, jamais sous l'heure.
class AppointmentRow extends StatelessWidget {
  const AppointmentRow(this.appointment, {this.now, super.key});

  final Appointment appointment;

  /// Injectable pour que « Maintenant » soit vérifiable sans faire dépendre
  /// un test de l'heure de la machine.
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final moment = now ?? DateTime.now();
    final current =
        !appointment.isCancelled &&
        !appointment.beginAt.toLocal().isAfter(moment) &&
        appointment.endAt.toLocal().isAfter(moment);

    // Le libellé dit le geste, jamais l'état interne du système. Cette table
    // de décision est celle du web : il n'y en a pas une seconde.
    final label = appointment.isCancelled
        ? 'Annulé'
        : appointment.isDone(moment)
        ? 'Créer le compte rendu'
        : 'Préparer le compte rendu';

    final species =
        speciesLabels[appointment.species] ?? appointment.species;

    return SurfaceCard(
      emphasised: current,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      onTap: () => _ouvrirLesGestes(context),
      child: Row(
        children: [
          SizedBox(
            width: 56,
            child: Text(
              DateFormat.Hm('fr_FR').format(appointment.beginAt.toLocal()),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: current ? palette.primary : palette.ink,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        '${appointment.patientName} · $species',
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                    if (current) ...[
                      const SizedBox(width: 8),
                      const _NowPill(),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(label, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          Icon(Icons.chevron_right, size: 22, color: palette.inkSubtle),
        ],
      ),
    );
  }

  /// Trois gestes nommés derrière une seule tape, plutôt qu'un menu caché
  /// derrière une icône de débordement : le praticien lit ce qu'il peut
  /// faire au lieu de le deviner.
  void _ouvrirLesGestes(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) => SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              title: Text(
                appointment.patientName,
                style: Theme.of(sheetContext).textTheme.titleLarge,
              ),
              subtitle: Text(
                DateFormat('EEEE d MMMM, HH:mm', 'fr_FR')
                    .format(appointment.beginAt.toLocal()),
                style: Theme.of(sheetContext).textTheme.bodySmall,
              ),
            ),
            if (!appointment.isCancelled)
              ListTile(
                leading: const Icon(Icons.mic_none),
                title: const Text('Dicter cette séance'),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  context.push('/dicter?rdv=${appointment.id}');
                },
              ),
            ListTile(
              leading: const Icon(Icons.pets_outlined),
              title: const Text("Voir la fiche animal"),
              onTap: () {
                Navigator.of(sheetContext).pop();
                context.push('/animaux/${appointment.patientId}');
              },
            ),
            // Annulée, une séance ne se déplace plus : il n'y a plus de
            // créneau à lui trouver.
            if (!appointment.isCancelled)
              ListTile(
                leading: const Icon(Icons.event_repeat_outlined),
                title: const Text('Déplacer'),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  context.push(
                    '/seances/${appointment.id}/deplacer',
                    extra: appointment,
                  );
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _NowPill extends StatelessWidget {
  const _NowPill();

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: palette.primary,
        borderRadius: BorderRadius.circular(AppDesign.radiusPill),
      ),
      child: Text(
        'MAINTENANT',
        semanticsLabel: 'Maintenant',
        style: AppTypography.chip(palette.onPrimary).copyWith(fontSize: 10),
      ),
    );
  }
}
