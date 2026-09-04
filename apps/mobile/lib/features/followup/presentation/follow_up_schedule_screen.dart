import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../core/ui/biume_widgets.dart';
import '../domain/follow_up_questionnaire.dart';
import 'follow_up_schedule_cubit.dart';

const _joursDeLaSemaine = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

const _moisEnToutesLettres = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/// Pas de dépendance aux données de locale d'`intl` : cette écriture n'a pas
/// besoin d'être chargée pour un simple jour + mois.
String _dateEnToutesLettres(DateTime date) {
  final jour = _joursDeLaSemaine[date.weekday - 1];
  return '${jour[0].toUpperCase()}${jour.substring(1)} ${date.day} '
      '${_moisEnToutesLettres[date.month - 1]}';
}

/// Les trois délais offerts en un geste. Un sélecteur de date par défaut
/// demanderait trois tapes et une lecture de calendrier pour ce qui est, neuf
/// fois sur dix, « la semaine prochaine ».
const _delaisProposes = [5, 7, 10];

/// Le dernier geste du parcours de compte rendu : proposer le suivi, jamais
/// l'imposer. Le questionnaire est en lecture seule — le mobile valide, il
/// n'édite pas, la personnalisation reste sur le web.
class FollowUpScheduleScreen extends StatelessWidget {
  const FollowUpScheduleScreen({this.now, super.key});

  /// Injectable pour que les délais soient vérifiables sans dépendre de
  /// l'horloge de la machine.
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    final gutter = AppShape.of(context).gutter;

    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<FollowUpScheduleCubit, FollowUpScheduleState>(
          // Le parcours est terminé quel que soit le geste : on ne laisse
          // jamais le praticien dans un cul-de-sac.
          listener: (context, state) {
            if (state.done) context.go('/');
          },
          builder: (context, state) => Column(
            children: [
              const ScreenHeader(title: 'Suivi du propriétaire'),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.fromLTRB(gutter, 0, gutter, 16),
                  children: [
                    Text(
                      'Le propriétaire recevra trois questions courtes. Vous '
                      'serez prévenu dès qu\'il répond.',
                      style: Theme.of(context).textTheme.bodyMedium
                          ?.copyWith(fontSize: 16, height: 1.6),
                    ),
                    const SizedBox(height: 16),
                    if (state.message != null) ...[
                      NoticeBanner(
                        icon: Icons.error_outline,
                        message: state.message!,
                      ),
                      const SizedBox(height: 16),
                    ],
                    _Envoi(state: state, now: now),
                    const SizedBox(height: 16),
                    const _Questions(),
                  ],
                ),
              ),
              ActionDock(
                // Refuser est offert au même niveau de lecture : le suivi se
                // propose, il ne s'impose pas.
                secondary: TextButton(
                  onPressed: state.busy
                      ? null
                      : () =>
                            context.read<FollowUpScheduleCubit>().decline(),
                  child: const Text('Pas de suivi pour cette séance'),
                ),
                child: FilledButton(
                  onPressed: state.busy
                      ? null
                      : () =>
                            context.read<FollowUpScheduleCubit>().schedule(),
                  child: const Text('Programmer le suivi'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Envoi extends StatelessWidget {
  const _Envoi({required this.state, required this.now});

  final FollowUpScheduleState state;
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    final aujourdhui = now ?? DateTime.now();

    return SurfaceCard(
      radius: AppShape.of(context).surface,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionLabel('Envoi'),
          const SizedBox(height: 16),
          Text(
            _dateEnToutesLettres(state.dueAt),
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              for (final jours in _delaisProposes) ...[
                Expanded(
                  child: _DelaiChip(
                    jours: jours,
                    selected: _ecartEnJours(aujourdhui, state.dueAt) == jours,
                    onTap: state.busy
                        ? null
                        : () => context
                              .read<FollowUpScheduleCubit>()
                              .chooseDate(
                                aujourdhui.add(Duration(days: jours)),
                              ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              _CalendarTile(
                onTap: state.busy
                    ? null
                    : () => _choisirDate(context, state.dueAt, aujourdhui),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _choisirDate(
    BuildContext context,
    DateTime dueAt,
    DateTime aujourdhui,
  ) async {
    final cubit = context.read<FollowUpScheduleCubit>();
    final picked = await showDatePicker(
      context: context,
      initialDate: dueAt,
      firstDate: aujourdhui.add(const Duration(days: followUpMinDelayDays)),
      lastDate: aujourdhui.add(const Duration(days: followUpMaxDelayDays)),
    );
    if (picked != null) cubit.chooseDate(picked);
  }
}

/// L'écart en jours de calendrier, pas en heures : l'échéance porte l'heure
/// de la finalisation, et « J+7 » ne doit pas se perdre à quelques minutes
/// près.
int _ecartEnJours(DateTime depuis, DateTime jusqua) {
  final a = DateTime(depuis.year, depuis.month, depuis.day);
  final b = DateTime(jusqua.year, jusqua.month, jusqua.day);
  return b.difference(a).inDays;
}

class _DelaiChip extends StatelessWidget {
  const _DelaiChip({
    required this.jours,
    required this.selected,
    required this.onTap,
  });

  final int jours;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final corner = BorderRadius.circular(AppDesign.radiusControl);

    return Material(
      color: selected ? palette.primary : palette.surface,
      borderRadius: corner,
      child: InkWell(
        onTap: onTap,
        borderRadius: corner,
        child: Container(
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: corner,
            border: Border.all(
              color: selected
                  ? palette.primary
                  : (dark
                        ? AppDesign.cardBorderDark
                        : AppDesign.cardBorderLight),
            ),
          ),
          child: Text(
            'J+$jours',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontSize: 15,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
              color: selected ? palette.onPrimary : palette.inkMuted,
            ),
          ),
        ),
      ),
    );
  }
}

class _CalendarTile extends StatelessWidget {
  const _CalendarTile({required this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final corner = BorderRadius.circular(AppDesign.radiusControl);

    return Semantics(
      button: true,
      label: 'Une autre date',
      child: Material(
        color: palette.surface,
        borderRadius: corner,
        child: InkWell(
          onTap: onTap,
          borderRadius: corner,
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: corner,
              border: Border.all(
                color: dark
                    ? AppDesign.cardBorderDark
                    : AppDesign.cardBorderLight,
              ),
            ),
            child: Icon(
              Icons.calendar_month_outlined,
              size: 19,
              color: palette.inkMuted,
            ),
          ),
        ),
      ),
    );
  }
}

class _Questions extends StatelessWidget {
  const _Questions();

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);

    return SurfaceCard(
      radius: AppShape.of(context).surface,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionLabel('Trois questions'),
          const SizedBox(height: 14),
          for (var i = 0; i < defaultFollowUpQuestionLabels.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: palette.primarySurface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${i + 1}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: palette.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      defaultFollowUpQuestionLabels[i],
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: palette.ink,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          Text(
            'Le questionnaire se personnalise depuis le web.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
