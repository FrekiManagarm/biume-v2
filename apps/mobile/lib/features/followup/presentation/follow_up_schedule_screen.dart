import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../domain/follow_up_questionnaire.dart';
import 'follow_up_schedule_cubit.dart';

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
/// besoin d'être chargée pour un simple jour + mois + année.
String _dateEnToutesLettres(DateTime date) =>
    '${date.day} ${_moisEnToutesLettres[date.month - 1]} ${date.year}';

/// Le dernier geste du parcours de compte rendu : proposer le suivi, jamais
/// l'imposer. Le questionnaire est en lecture seule — le mobile valide, il
/// n'édite pas, la personnalisation reste sur le web.
class FollowUpScheduleScreen extends StatelessWidget {
  const FollowUpScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Suivi du propriétaire')),
      body: SafeArea(
        child: BlocConsumer<FollowUpScheduleCubit, FollowUpScheduleState>(
          // Le parcours est terminé quel que soit le geste : on ne laisse
          // jamais le praticien dans un cul-de-sac.
          listener: (context, state) {
            if (state.done) context.go('/');
          },
          builder: (context, state) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Envoyé le ${_dateEnToutesLettres(state.dueAt)}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    TextButton(
                      onPressed: state.busy
                          ? null
                          : () => _choisirDate(context, state.dueAt),
                      child: const Text('Modifier'),
                    ),
                  ],
                ),
                if (state.message != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    state.message!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Trois questions',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        for (final label in defaultFollowUpQuestionLabels)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text('• $label'),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: state.busy
                      ? null
                      : () => context.read<FollowUpScheduleCubit>().schedule(),
                  child: const Text('Programmer le suivi'),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: state.busy
                      ? null
                      : () => context.read<FollowUpScheduleCubit>().decline(),
                  child: const Text('Pas de suivi pour cette séance'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _choisirDate(BuildContext context, DateTime dueAt) async {
    final cubit = context.read<FollowUpScheduleCubit>();
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: dueAt,
      firstDate: now.add(const Duration(days: followUpMinDelayDays)),
      lastDate: now.add(const Duration(days: followUpMaxDelayDays)),
    );
    if (picked != null) cubit.chooseDate(picked);
  }
}
