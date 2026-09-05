import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/transcript/domain/transcript.dart';
import 'package:biume_mobile/features/transcript/domain/transcript_repository.dart';
import 'package:biume_mobile/features/transcript/presentation/transcript_cubit.dart';
import 'package:biume_mobile/features/transcript/presentation/transcript_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockTranscriptRepository extends Mock implements TranscriptRepository {}

class MockCaptureStore extends Mock implements CaptureStore {}

const captureId = 'capture-1';

const prete = Transcript(
  captureId: captureId,
  status: TranscriptStatus.ready,
  text: 'Filou présente une tension lombaire.',
);

const inaudible = Transcript(
  captureId: captureId,
  status: TranscriptStatus.inaudible,
  text: '',
);

/// Construit l'application autour de l'écran, avec un routeur minimal pour
/// que les navigations déclenchées par l'écran (rattacher un animal, aller
/// au compte rendu, réenregistrer) trouvent une destination.
Future<void> ouvrirLEcran(
  WidgetTester tester,
  MockTranscriptRepository repository,
  MockCaptureStore store, {
  bool needsPatient = false,
  String? appointmentId,
  void Function(Uri)? onDicter,
}) async {
  final router = GoRouter(
    initialLocation: '/dictees/$captureId/transcription',
    routes: [
      GoRoute(
        path: '/dictees/:captureId/transcription',
        builder: (_, _) => BlocProvider(
          create: (_) => TranscriptCubit(repository, store)..load(captureId),
          child: TranscriptScreen(
            captureId: captureId,
            needsPatient: needsPatient,
            appointmentId: appointmentId,
          ),
        ),
      ),
      GoRoute(
        path: '/animaux/choisir',
        builder: (_, _) => const SizedBox.shrink(),
      ),
      GoRoute(
        path: '/comptes-rendus/:reportId',
        builder: (_, _) => const SizedBox.shrink(),
      ),
      GoRoute(
        path: '/dicter',
        builder: (_, state) {
          onDicter?.call(state.uri);
          return const SizedBox.shrink();
        },
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await tester.pump();
  await tester.pump();
}

void main() {
  late MockTranscriptRepository repository;
  late MockCaptureStore store;

  setUp(() {
    repository = MockTranscriptRepository();
    store = MockCaptureStore();
    registerFallbackValue(DateTime(2026));
    when(() => store.markExtractionRequested(any(), any()))
        .thenAnswer((_) async {});
  });

  /// Le praticien relit avant de corriger : le texte se pose comme un
  /// document, pas comme un formulaire. Un champ ouvert par défaut invite à
  /// réécrire ce qui n'a pas besoin de l'être, et fait manquer la relecture.
  testWidgets('pose le texte à relire, sans champ ouvert', (tester) async {
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));

    await ouvrirLEcran(tester, repository, store);

    expect(find.text(prete.text), findsOneWidget);
    expect(find.byType(TextField), findsNothing);
    expect(find.byType(FilledButton), findsOneWidget);
    expect(find.text('Corriger le texte'), findsOneWidget);
  });

  testWidgets('corriger puis valider envoie le texte corrigé', (tester) async {
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));
    when(() => repository.correct('capture-1', 'Texte modifié.')).thenAnswer(
      (_) async => const Success(
        Transcript(
          captureId: captureId,
          status: TranscriptStatus.corrected,
          text: 'Texte modifié.',
        ),
      ),
    );
    when(() => repository.extract('capture-1'))
        .thenAnswer((_) async => const Success('report-1'));

    await ouvrirLEcran(tester, repository, store);

    await tester.tap(find.text('Corriger le texte'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Texte modifié.');
    await tester.tap(find.byType(FilledButton));
    await tester.pumpAndSettle();

    verify(() => repository.correct('capture-1', 'Texte modifié.')).called(1);
    verify(() => repository.extract('capture-1')).called(1);
  });

  testWidgets("l'écran inaudible n'affiche aucun champ de texte", (
    tester,
  ) async {
    when(() => repository.load(any()))
        .thenAnswer((_) async => const Success(inaudible));

    await ouvrirLEcran(tester, repository, store);

    expect(find.byType(TextField), findsNothing);
    expect(find.text("Rien n'a été capté."), findsOneWidget);
  });

  /// Une dictée libre inaudible n'a pas de rendez-vous : réenregistrer ne
  /// doit jamais envoyer la chaîne littérale « null » au routeur, qui la
  /// transmettrait ensuite au serveur comme un identifiant de rendez-vous.
  /// C'est le chemin de récupération d'un praticien qui a déjà perdu une
  /// dictée : il ne doit pas être cassé par une interpolation naïve.
  testWidgets(
    "réenregistrer une dictée libre inaudible n'envoie pas rdv=null",
    (tester) async {
      when(() => repository.load(any()))
          .thenAnswer((_) async => const Success(inaudible));

      Uri? uriDicter;
      await ouvrirLEcran(
        tester,
        repository,
        store,
        appointmentId: null,
        onDicter: (uri) => uriDicter = uri,
      );

      await tester.tap(find.text('Réenregistrer'));
      await tester.pumpAndSettle();

      expect(uriDicter, isNotNull);
      expect(uriDicter!.queryParameters.containsKey('rdv'), isFalse);
      expect(uriDicter.toString(), '/dicter');
    },
  );
}
