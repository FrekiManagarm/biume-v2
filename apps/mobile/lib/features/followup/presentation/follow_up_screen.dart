import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_palette.dart';
import '../../../core/contact/contact_actions.dart';
import '../domain/follow_up.dart';
import 'follow_up_cubit.dart';

/// Traiter un suivi : lire ce que dit le propriétaire, le joindre ou lui
/// reprendre un rendez-vous, puis dire explicitement que c'est réglé.
///
/// Appeler ne clôt rien. Un praticien qui tombe sur un répondeur doit
/// retrouver son suivi ; seul « Marquer comme traité » le fait disparaître.
class FollowUpScreen extends StatelessWidget {
  const FollowUpScreen({required this.followUpId, super.key});

  final String followUpId;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Scaffold(
      appBar: AppBar(title: const Text('Suivi')),
      body: SafeArea(
        child: BlocBuilder<FollowUpCubit, FollowUpState>(
          builder: (context, state) {
            final follow = context.read<FollowUpCubit>().byId(followUpId);

            // Une notification ouverte deux fois, ou un suivi traité depuis
            // le web : le dire vaut mieux qu'une page vide.
            if (follow == null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    state.busy
                        ? 'Chargement du suivi…'
                        : "Ce suivi n'attend plus rien.",
                    style: TextStyle(color: palette.inkMuted),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  follow.patientName,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  follow.ownerName,
                  style: TextStyle(color: palette.inkMuted),
                ),
                const SizedBox(height: 16),
                _CeQueDitLeProprietaire(follow: follow, palette: palette),
                const SizedBox(height: 16),
                _Actions(follow: follow),
                if (state.message != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    state.message!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: state.busy
                      ? null
                      : () => _marquerTraite(context, follow.id),
                  child: const Text('Marquer comme traité'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  /// Ne referme l'écran que si le serveur a confirmé : sinon le praticien
  /// croirait le suivi réglé alors qu'il ne l'est pas.
  Future<void> _marquerTraite(BuildContext context, String id) async {
    final cubit = context.read<FollowUpCubit>();
    await cubit.markHandled(id);
    if (!context.mounted || cubit.byId(id) != null) return;
    if (context.canPop()) {
      context.pop();
    } else {
      // Ouvert depuis une notification, sur une pile vide : l'accueil est la
      // seule destination sensée.
      context.go('/');
    }
  }
}

class _CeQueDitLeProprietaire extends StatelessWidget {
  const _CeQueDitLeProprietaire({required this.follow, required this.palette});

  final FollowUp follow;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette.surface,
        border: Border.all(color: palette.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ce que dit le propriétaire',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            follow.summary,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          for (final phrase in follow.answerSentences)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(phrase),
            ),
        ],
      ),
    );
  }
}

/// Trois gestes, aucun terminal : ils aident à traiter le suivi, ils ne le
/// referment pas.
class _Actions extends StatelessWidget {
  const _Actions({required this.follow});

  final FollowUp follow;

  @override
  Widget build(BuildContext context) {
    final phone = normalizedPhone(follow.ownerPhone);
    final email = follow.ownerEmail;
    final patientId = follow.patientId;

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: phone == null
                    ? null
                    : () => launchContact(
                        context,
                        Uri(scheme: 'tel', path: phone),
                      ),
                icon: const Icon(Icons.call_outlined),
                label: const Text('Appeler'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: email == null
                    ? null
                    : () => launchContact(
                        context,
                        Uri(scheme: 'mailto', path: email),
                      ),
                icon: const Icon(Icons.email_outlined),
                label: const Text('Écrire'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            // Sans animal identifié, la création de séance demanderait de le
            // choisir : autant y aller directement plutôt qu'éteindre le
            // bouton.
            onPressed: () => context.push(
              patientId == null
                  ? '/seances/nouvelle'
                  : '/seances/nouvelle?animal=$patientId',
            ),
            icon: const Icon(Icons.event_outlined),
            label: const Text('Prendre un rendez-vous'),
          ),
        ),
      ],
    );
  }
}
