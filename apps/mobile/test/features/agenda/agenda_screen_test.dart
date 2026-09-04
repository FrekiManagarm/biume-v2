import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/agenda/presentation/agenda_cubit.dart';
import 'package:biume_mobile/features/agenda/presentation/agenda_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';

/// Un cubit figé sur un état : l'écran de la fenêtre n'a rien à charger
/// lui-même, il affiche ce que le cubit lui donne.
class _FrozenAgendaCubit extends Cubit<AgendaState> implements AgendaCubit {
  _FrozenAgendaCubit(super.initial);

  @override
  Future<void> load(DateTime day) async {}

  @override
  Future<void> showDay(DateTime day) async {}
}

void main() {
  // Les en-têtes de jour se formatent avec `DateFormat('fr_FR')`, que seul
  // `main()` initialise en production.
  setUpAll(() => initializeDateFormatting('fr_FR'));

  final today = DateTime(2026, 9, 8, 9);

  Appointment seance(String id, String name, int hour) => Appointment(
    id: id,
    patientId: 'pet-$id',
    patientName: name,
    species: 'DOG',
    beginAt: DateTime(2026, 9, 8, hour),
    endAt: DateTime(2026, 9, 8, hour + 1),
    status: 'CONFIRMED',
  );

  Future<void> monter(WidgetTester tester, AgendaState state) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (_, _) => BlocProvider<AgendaCubit>(
            create: (_) => _FrozenAgendaCubit(state),
            child: AgendaScreen(now: today),
          ),
        ),
      ],
    );
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));
    await tester.pump();
  }

  testWidgets('nomme les jours plutôt que de les dater', (tester) async {
    await monter(
      tester,
      AgendaLoaded(
        days: [
          AgendaDay(day: DateTime(2026, 9, 8), appointments: [
            seance('a1', 'Iron', 14),
          ]),
          AgendaDay(day: DateTime(2026, 9, 9), appointments: const []),
        ],
      ),
    );

    expect(find.text("Aujourd'hui"), findsOneWidget);
    expect(find.text('Demain'), findsOneWidget);
    expect(find.text('Iron · Chien'), findsOneWidget);
  });

  testWidgets('un jour sans séance se dit, il ne se masque pas', (
    tester,
  ) async {
    await monter(
      tester,
      AgendaLoaded(
        days: [AgendaDay(day: DateTime(2026, 9, 8), appointments: const [])],
      ),
    );

    expect(find.text('Aucune séance'), findsOneWidget);
  });

  testWidgets("un échec réseau garde la fenêtre et le dit", (tester) async {
    await monter(
      tester,
      AgendaLoaded(
        days: [
          AgendaDay(day: DateTime(2026, 9, 8), appointments: [
            seance('a1', 'Iron', 14),
          ]),
        ],
        offlineMessage: 'Connexion indisponible.',
      ),
    );

    expect(find.textContaining('Connexion indisponible'), findsOneWidget);
    expect(find.text('Iron · Chien'), findsOneWidget);
  });
}
