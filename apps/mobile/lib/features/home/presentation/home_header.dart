import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../config/app_design.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../auth/presentation/auth_cubit.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// L'en-tête de l'accueil : à gauche l'identité, qui ouvre le menu du compte ;
/// à droite le seul autre point d'entrée, « ajouter ».
///
/// Le board place une cloche à droite. L'application n'a pas de centre de
/// notifications — et n'en a pas besoin : « À traiter », juste en dessous,
/// porte déjà le compte de ce qui attend. La place revient donc au geste que
/// l'accueil ne pourrait pas offrir autrement.
class HomeHeader extends StatelessWidget {
  const HomeHeader({this.today, super.key});

  /// Injectable pour que la ligne de date soit vérifiable sans dépendre de
  /// l'horloge de la machine.
  final DateTime? today;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final date = DateFormat('EEEE d MMMM', 'fr_FR')
        .format(today ?? DateTime.now());
    final company = context.select(
      (AuthCubit cubit) => switch (cubit.state) {
        AuthAuthenticated(:final session) => session.company?.name,
        _ => null,
      },
    );

    return Padding(
      padding: EdgeInsets.fromLTRB(AppShape.of(context).gutter, 6, AppShape.of(context).gutter, 0),
      child: Row(
        children: [
          Expanded(
            child: PopupMenuButton<String>(
              tooltip: 'Compte',
              position: PopupMenuPosition.under,
              onSelected: (value) => switch (value) {
                // Navigation volontaire : la garde du routeur doit la
                // laisser passer plutôt que de renvoyer aussitôt à l'accueil.
                'entreprise' => context.push('/entreprise', extra: 'volontaire'),
                // Cas explicite plutôt qu'un `_` par défaut : une troisième
                // entrée ne doit jamais déconnecter en silence.
                'deconnexion' => context.read<AuthCubit>().signOut(),
                _ => null,
              },
              itemBuilder: (_) => const [
                PopupMenuItem(
                  value: 'entreprise',
                  child: Text("Changer d'entreprise"),
                ),
                PopupMenuItem(
                  value: 'deconnexion',
                  child: Text('Se déconnecter'),
                ),
              ],
              child: Row(
                children: [
                  _Avatar(name: company),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _capitalise(date),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        Text(
                          company ?? 'Biume',
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(fontSize: 15, color: palette.ink),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          PopupMenuButton<String>(
            tooltip: 'Ajouter',
            position: PopupMenuPosition.under,
            onSelected: (value) => switch (value) {
              'seance' => context.push('/seances/nouvelle'),
              'client' => context.push('/clients/nouveau'),
              _ => null,
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'seance', child: Text('Nouvelle séance')),
              PopupMenuItem(value: 'client', child: Text('Nouveau client')),
            ],
            child: IgnorePointer(
              child: IconTile(icon: Icons.add, onTap: () {}),
            ),
          ),
        ],
      ),
    );
  }
}

/// Les initiales de l'entreprise sur le dégradé de marque. Une image de
/// profil n'existe pas côté mobile : deux lettres valent mieux qu'un
/// emplacement vide.
class _Avatar extends StatelessWidget {
  const _Avatar({required this.name});

  final String? name;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: AppDesign.brandGradient,
        borderRadius: BorderRadius.circular(AppShape.of(context).avatar),
      ),
      child: Text(
        _initials(name),
        style: const TextStyle(
          fontFamily: AppTypography.jakarta,
          fontWeight: FontWeight.w700,
          fontSize: 15,
          color: Colors.white,
        ),
      ),
    );
  }
}

String _initials(String? name) {
  final words = (name ?? '').trim().split(RegExp(r'\s+'))
      .where((word) => word.isNotEmpty)
      .toList();
  if (words.isEmpty) return 'B';
  if (words.length == 1) return words.first.characters.first.toUpperCase();
  return (words.first.characters.first + words[1].characters.first)
      .toUpperCase();
}

String _capitalise(String value) =>
    value.isEmpty ? value : value[0].toUpperCase() + value.substring(1);
