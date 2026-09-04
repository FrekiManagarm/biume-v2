import 'package:biume_mobile/features/capture/domain/audio_recorder.dart';
import 'package:biume_mobile/features/capture/presentation/recording_bloc.dart';
import 'package:biume_mobile/features/capture/presentation/recording_screen.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockAudioRecorder extends Mock implements AudioRecorder {}

class MockCaptureFiles extends Mock implements CaptureFiles {}

const filou = Patient(
  id: 'patient-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

/// Le sélecteur d'animal, réduit à ce que l'écran de dictée en attend : il
/// s'ouvre et rend un animal.
class _PickerStub extends StatefulWidget {
  const _PickerStub();

  @override
  State<_PickerStub> createState() => _PickerStubState();
}

class _PickerStubState extends State<_PickerStub> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.pop(filou);
    });
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

void main() {
  late MockAudioRecorder recorder;
  late MockCaptureFiles files;

  setUp(() {
    recorder = MockAudioRecorder();
    files = MockCaptureFiles();

    when(() => recorder.hasPermission()).thenAnswer((_) async => true);
    when(() => recorder.start(any())).thenAnswer((_) async {});
    when(() => recorder.stop()).thenAnswer((_) async => '/tmp/capture.m4a');
    when(() => recorder.cancel()).thenAnswer((_) async {});
    when(() => recorder.dispose()).thenAnswer((_) async {});
    when(() => recorder.isRecording()).thenAnswer((_) async => true);
    when(() => files.pathFor(any())).thenAnswer((_) async => '/tmp/capture.m4a');
    when(() => files.sizeOf(any())).thenAnswer((_) async => 1048576);
    when(() => files.sha256Of(any())).thenAnswer((_) async => 'a' * 64);
    when(
      () => files.encryptInPlace(any(), any()),
    ).thenAnswer((_) async => '/tmp/capture.m4a.enc');
    when(() => files.delete(any())).thenAnswer((_) async {});
  });

  Future<List<Patient>> ouvrirLEcran(
    WidgetTester tester, {
    String? appointmentId,
  }) async {
    final choisis = <Patient>[];
    final router = GoRouter(
      initialLocation: '/dicter',
      routes: [
        GoRoute(
          path: '/dicter',
          builder: (_, _) => BlocProvider(
            create: (_) => RecordingBloc(
              recorder: recorder,
              files: files,
              onSaved: (_) async {},
              now: () => DateTime.utc(2026, 9, 3, 10),
              newId: () => 'capture-1',
            ),
            child: RecordingScreen(
              appointmentId: appointmentId,
              onPatientChosen: choisis.add,
            ),
          ),
        ),
        GoRoute(
          path: '/animaux/choisir',
          builder: (_, _) => const _PickerStub(),
        ),
      ],
    );

    await tester.pumpWidget(MaterialApp.router(routerConfig: router));
    await tester.pumpAndSettle();
    return choisis;
  }

  testWidgets(
    "propose de choisir l'animal quand la dictée ne part d'aucun rendez-vous",
    (tester) async {
      await ouvrirLEcran(tester);

      expect(find.text('Animal : non choisi'), findsOneWidget);
      expect(find.text('Choisir'), findsOneWidget);
    },
  );

  /// Le rendez-vous porte déjà l'animal : le redemander serait un geste de
  /// plus sur l'écran qui doit en avoir un seul.
  testWidgets('ne le propose pas quand la dictée part d\'un rendez-vous', (
    tester,
  ) async {
    await ouvrirLEcran(tester, appointmentId: 'rdv-1');

    expect(find.text('Animal : non choisi'), findsNothing);
    expect(find.text('Choisir'), findsNothing);
  });

  testWidgets("porte le choix jusqu'à l'appelant, et l'affiche", (
    tester,
  ) async {
    final choisis = await ouvrirLEcran(tester);

    await tester.tap(find.text('Choisir'));
    await tester.pumpAndSettle();

    expect(choisis, [filou]);
    expect(find.text('Animal : Filou'), findsOneWidget);
  });

  /// « Avant ou pendant » : le praticien qui a commencé à parler doit encore
  /// pouvoir nommer l'animal sans arrêter sa dictée.
  testWidgets("reste offert pendant l'enregistrement", (tester) async {
    await ouvrirLEcran(tester);

    await tester.tap(find.text('Commencer la dictée'));
    await tester.pump();
    await tester.pump();

    expect(find.text('Terminer'), findsOneWidget);
    expect(find.text('Choisir'), findsOneWidget);
  });
}
