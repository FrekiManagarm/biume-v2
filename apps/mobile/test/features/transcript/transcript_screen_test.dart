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
            appointmentId: null,
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
      GoRoute(path: '/dicter', builder: (_, _) => const SizedBox.shrink()),
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

  testWidgets('affiche le texte dans un champ et un seul bouton plein', (
    tester,
  ) async {
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));

    await ouvrirLEcran(tester, repository, store);

    expect(find.widgetWithText(TextField, prete.text), findsOneWidget);
    expect(find.byType(FilledButton), findsOneWidget);
  });

  testWidgets('taper le bouton valide avec le texte du champ', (tester) async {
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
}
