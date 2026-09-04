import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_cubit.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

import 'follow_up_fixture.dart';

class MockActionableFollowUpRepository extends Mock
    implements ActionableFollowUpRepository {}

/// Ouvre l'écran du suivi comme le fait une notification : sur la route
/// seule, sans rien d'autre en mémoire. `onSeanceNouvelle` note l'adresse
/// atteinte quand le praticien reprend un rendez-vous.
Future<FollowUpCubit> ouvrirLeSuivi(
  WidgetTester tester,
  MockActionableFollowUpRepository repository, {
  void Function(String location)? onSeanceNouvelle,
}) async {
  final cubit = FollowUpCubit(repository);
  final router = GoRouter(
    initialLocation: '/suivis/followup-1',
    routes: [
      GoRoute(path: '/', builder: (_, _) => const SizedBox.shrink()),
      GoRoute(
        path: '/seances/nouvelle',
        builder: (_, state) {
          onSeanceNouvelle?.call(state.uri.toString());
          return const SizedBox.shrink();
        },
      ),
      GoRoute(
        path: '/suivis/:followUpId',
        builder: (_, state) => BlocProvider.value(
          value: cubit,
          child: FollowUpScreen(
            followUpId: state.pathParameters['followUpId']!,
          ),
        ),
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await cubit.load();
  await tester.pumpAndSettle();
  return cubit;
}

void main() {
  late MockActionableFollowUpRepository repository;

  setUp(() => repository = MockActionableFollowUpRepository());

  void repond(FollowUp follow) => when(
    () => repository.listActionable(),
  ).thenAnswer((_) async => Success([follow]));

  testWidgets('affiche le motif et ce que dit le propriétaire', (tester) async {
    repond(
      suivi(
        reasons: const [AlertReason.declaredWorsening],
        answer: const FollowUpAnswer(
          evolution: Evolution.worse,
          reaction: 'Boite depuis hier',
          wantsContact: true,
        ),
      ),
    );

    await ouvrirLeSuivi(tester, repository);

    expect(find.text('Filou'), findsOneWidget);
    expect(
      find.text('Le propriétaire signale que son animal va moins bien.'),
      findsOneWidget,
    );
    expect(find.text('État : moins bien.'), findsOneWidget);
    expect(
      find.text('Réaction observée : « Boite depuis hier ».'),
      findsOneWidget,
    );
  });

  /// Le mobile lit le suivi, il ne le commente pas : toute note du praticien
  /// appartient au compte rendu, sur le web.
  testWidgets("n'offre aucun champ de saisie", (tester) async {
    repond(suivi());

    await ouvrirLeSuivi(tester, repository);

    expect(find.byType(TextField), findsNothing);
    expect(find.byType(TextFormField), findsNothing);
  });

  testWidgets('éteint « Appeler » quand le propriétaire n\'a pas de numéro', (
    tester,
  ) async {
    repond(suivi(ownerPhone: null));

    await ouvrirLeSuivi(tester, repository);

    final bouton = tester.widget<OutlinedButton>(
      find.widgetWithText(OutlinedButton, 'Appeler'),
    );
    expect(bouton.onPressed, isNull);
  });

  testWidgets('reprend un rendez-vous avec l\'animal déjà choisi', (
    tester,
  ) async {
    repond(suivi(patientId: 'pet-1'));
    String? atteinte;

    await ouvrirLeSuivi(
      tester,
      repository,
      onSeanceNouvelle: (location) => atteinte = location,
    );
    await tester.tap(
      find.widgetWithText(OutlinedButton, 'Prendre un rendez-vous'),
    );
    await tester.pumpAndSettle();

    expect(atteinte, '/seances/nouvelle?animal=pet-1');
  });

  testWidgets('marquer comme traité appelle le dépôt puis referme l\'écran', (
    tester,
  ) async {
    repond(suivi());
    when(
      () => repository.markHandled('followup-1'),
    ).thenAnswer((_) async => Success(suivi(handled: true)));

    await ouvrirLeSuivi(tester, repository);
    await tester.tap(
      find.widgetWithText(FilledButton, 'Marquer comme traité'),
    );
    await tester.pumpAndSettle();

    verify(() => repository.markHandled('followup-1')).called(1);
    expect(find.byType(FollowUpScreen), findsNothing);
  });

  /// Le cœur de la décision produit : appeler n'est pas traiter. Un praticien
  /// qui appelle et tombe sur un répondeur doit retrouver son suivi.
  testWidgets('appeler ne marque jamais le suivi comme traité', (tester) async {
    repond(suivi());

    await ouvrirLeSuivi(tester, repository);
    await tester.tap(find.widgetWithText(OutlinedButton, 'Appeler'));
    await tester.pumpAndSettle();

    verifyNever(() => repository.markHandled(any()));
    expect(find.byType(FollowUpScreen), findsOneWidget);
  });

  /// Une notification ouverte deux fois, ou après que le suivi a été traité
  /// ailleurs : l'écran le dit, il ne montre pas une page vide.
  testWidgets('dit ce qu\'il en est quand le suivi n\'attend plus rien', (
    tester,
  ) async {
    when(
      () => repository.listActionable(),
    ).thenAnswer((_) async => const Success(<FollowUp>[]));

    await ouvrirLeSuivi(tester, repository);

    expect(find.text('Ce suivi n\'attend plus rien.'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, 'Marquer comme traité'), findsNothing);
  });
}
