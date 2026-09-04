import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../injection_container.dart';
import '../../agenda/domain/agenda_repository.dart';
import '../../agenda/presentation/agenda_body.dart';
import '../../agenda/presentation/agenda_cubit.dart';
import '../../auth/presentation/auth_cubit.dart';
import '../../capture/domain/capture_store.dart';
import '../../followup/domain/actionable_follow_up_repository.dart';
import '../../todo/domain/todo_api.dart';
import '../../todo/presentation/todo_cubit.dart';
import '../../todo/presentation/todo_section.dart';

/// L'accueil unique : pas d'onglets. L'ostéopathe ouvre l'application pour
/// savoir ce qu'il a à traiter maintenant, pas pour naviguer entre des
/// rubriques — « À traiter » en tête, puis l'agenda, et une seule action au
/// premier plan : dicter.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => TodoCubit(
            getIt<CaptureStore>(),
            getIt<TodoApi>(),
            followUps: getIt<ActionableFollowUpRepository>(),
          )..start(),
        ),
        BlocProvider(
          create: (_) =>
              AgendaCubit(getIt<AgendaRepository>())..load(DateTime.now()),
        ),
      ],
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Biume'),
          actions: [
            PopupMenuButton<String>(
              tooltip: 'Ajouter',
              icon: const Icon(Icons.add),
              onSelected: (value) => switch (value) {
                'seance' => context.push('/seances/nouvelle'),
                'client' => context.push('/clients/nouveau'),
                _ => null,
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'seance', child: Text('Nouvelle séance')),
                PopupMenuItem(value: 'client', child: Text('Nouveau client')),
              ],
            ),
            PopupMenuButton<String>(
              tooltip: 'Compte',
              icon: const Icon(Icons.account_circle_outlined),
              onSelected: (value) => switch (value) {
                // Navigation volontaire : la garde du routeur doit la
                // laisser passer plutôt que de renvoyer aussitôt à l'accueil.
                'entreprise' => context.push(
                  '/entreprise',
                  extra: 'volontaire',
                ),
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
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.push('/dicter'),
          icon: const Icon(Icons.mic),
          label: const Text('Dicter'),
        ),
        body: SafeArea(
          child: ListView(
            // La marge basse garde le dernier élément atteignable sous le
            // bouton « Dicter », qui reste ancré même quand la liste est
            // longue.
            padding: const EdgeInsets.only(bottom: 96),
            children: const [TodoSection(), AgendaBody()],
          ),
        ),
      ),
    );
  }
}
