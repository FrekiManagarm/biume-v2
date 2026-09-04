import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/ui/biume_widgets.dart';
import '../../../injection_container.dart';
import '../../agenda/domain/agenda_repository.dart';
import '../../agenda/presentation/agenda_body.dart';
import '../../agenda/presentation/agenda_cubit.dart';
import '../../capture/domain/capture_store.dart';
import '../../followup/domain/actionable_follow_up_repository.dart';
import '../../todo/domain/todo_api.dart';
import '../../todo/presentation/todo_cubit.dart';
import '../../todo/presentation/todo_section.dart';
import 'home_header.dart';

/// L'accueil unique : pas d'onglets. L'ostéopathe ouvre l'application pour
/// savoir ce qu'il a à traiter maintenant, pas pour naviguer entre des
/// rubriques — « À traiter » en tête, puis les séances du jour, et une seule
/// action au premier plan, posée dans un socle que le pouce atteint sans
/// défiler : dicter.
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
        body: SafeArea(
          bottom: false,
          child: Column(
            children: [
              const HomeHeader(),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.only(top: 26, bottom: 8),
                  children: const [
                    TodoSection(),
                    SizedBox(height: 18),
                    AgendaBody(),
                  ],
                ),
              ),
              // Le seul geste de l'écran, et le seul du parcours avec
              // « Finaliser et envoyer » à porter le dégradé de marque.
              ActionDock(
                child: BrandAction(
                  label: 'Dicter une séance',
                  icon: Icons.mic_none,
                  onPressed: () => context.push('/dicter'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
