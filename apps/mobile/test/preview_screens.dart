// Harnais d'aperçu, hors suite : rend un écran hors ligne et l'écrit en PNG.
// Lancé à la main (`flutter test test/preview_screens.dart`), jamais par
// `flutter test`, qui ne ramasse que les fichiers `*_test.dart`.
//
//     PREVIEW_DIR=/tmp/apercus flutter test test/preview_screens.dart
import 'dart:async';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:biume_mobile/config/app_palette.dart';
import 'package:biume_mobile/config/app_theme.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/agenda_repository.dart';
import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/auth/domain/auth_repository.dart';
import 'package:biume_mobile/features/auth/domain/session.dart';
import 'package:biume_mobile/features/auth/presentation/auth_cubit.dart';
import 'package:biume_mobile/features/capture/domain/audio_recorder.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/capture/presentation/recording_bloc.dart';
import 'package:biume_mobile/features/capture/presentation/recording_screen.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:biume_mobile/features/followup/domain/follow_up_repository.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_schedule_cubit.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_schedule_screen.dart';
import 'package:biume_mobile/features/home/presentation/home_screen.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:biume_mobile/features/report/domain/report_repository.dart';
import 'package:biume_mobile/features/report/presentation/finalize_screen.dart';
import 'package:biume_mobile/features/report/presentation/report_cubit.dart';
import 'package:biume_mobile/features/report/presentation/report_screen.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/features/transcript/domain/transcript.dart';
import 'package:biume_mobile/features/transcript/domain/transcript_repository.dart';
import 'package:biume_mobile/features/transcript/presentation/transcript_cubit.dart';
import 'package:biume_mobile/features/transcript/presentation/transcript_screen.dart';
import 'package:biume_mobile/injection_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockCaptureStore extends Mock implements CaptureStore {}

class MockTodoApi extends Mock implements TodoApi {}

class MockFollowUps extends Mock implements ActionableFollowUpRepository {}

class MockAgendaRepository extends Mock implements AgendaRepository {}

class MockAuthRepository extends Mock implements AuthRepository {}

class MockTranscriptRepository extends Mock implements TranscriptRepository {}

class MockReportRepository extends Mock implements ReportRepository {}

class MockFollowUpRepository extends Mock implements FollowUpRepository {}

class MockAudioRecorder extends Mock implements AudioRecorder {}

class MockCaptureFiles extends Mock implements CaptureFiles {}

final maintenant = DateTime.now();

void main() {
  final dossier = Platform.environment['PREVIEW_DIR'] ?? 'build/apercus';

  setUpAll(() => initializeDateFormatting('fr_FR'));

  // `flutter test` rend tout avec sa police de substitution, et le greffon de
  // polices ne survit pas d'un cas à l'autre : sans ce rechargement, les
  // aperçus suivants ne montreraient que des rectangles noirs.
  setUp(_chargerLesPolices);

  /// Rend `child` dans un iPhone 14 Pro et écrit le PNG.
  Future<void> capturer(
    WidgetTester tester,
    String nom, {
    required Widget child,
    Brightness brightness = Brightness.light,
    Future<void> Function(WidgetTester)? apres,
  }) async {
    final cle = GlobalKey();

    tester.view.devicePixelRatio = 3;
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      RepaintBoundary(
        key: cle,
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: buildAppTheme(
            brightness == Brightness.dark ? AppPalette.dark : AppPalette.light,
            brightness,
            platform: TargetPlatform.iOS,
          ),
          home: child,
        ),
      ),
    );
    for (var i = 0; i < 6; i++) {
      await tester.pump(const Duration(milliseconds: 60));
    }
    if (apres != null) await apres(tester);

    final limite =
        cle.currentContext!.findRenderObject()! as RenderRepaintBoundary;
    final image = await limite.toImage(pixelRatio: 3);
    final octets = await image.toByteData(format: ui.ImageByteFormat.png);
    Directory(dossier).createSync(recursive: true);
    File('$dossier/$nom.png').writeAsBytesSync(octets!.buffer.asUint8List());
  }

  /// L'accueil passe par `getIt` et par le routeur : il va chercher ses
  /// cubits dans le conteneur, comme en production.
  Future<void> capturerAccueil(
    WidgetTester tester,
    String nom,
    Brightness brightness,
  ) async {
    final store = MockCaptureStore();
    final api = MockTodoApi();
    final followUps = MockFollowUps();
    final agenda = MockAgendaRepository();
    final auth = MockAuthRepository();

    registerFallbackValue(DateTime(2026, 9, 8));
    when(() => store.watchAll()).thenAnswer((_) => const Stream.empty());
    when(() => api.list()).thenAnswer(
      (_) async => Success([
        TodoItem(
          kind: TodoKind.reportToValidate,
          captureId: 'c-1',
          reportId: 'r-1',
          patientName: 'Iron',
          updatedAt: maintenant.subtract(const Duration(minutes: 40)),
        ),
      ]),
    );
    when(() => followUps.listActionable()).thenAnswer(
      (_) async => Success([
        FollowUp(
          id: 'f-1',
          reportId: 'r-0',
          patientName: 'Naya',
          ownerName: 'Mme Perrot',
          reasons: const [AlertReason.declaredWorsening],
          handled: false,
          answeredAt: maintenant.subtract(const Duration(days: 1)),
        ),
      ]),
    );
    when(() => agenda.watchWindow(any(), any())).thenAnswer(
      (_) => Stream.value([
        _seance('a-1', 'Iron', 'DOG', -20, 40),
        _seance('a-2', 'Vega', 'HORSE', 120, 180),
        _seance('a-3', 'Naya', 'DOG', 240, 300),
      ]),
    );
    when(() => agenda.refreshWindow(any(), any()))
        .thenAnswer((_) async => const Success(null));
    when(() => auth.restoreSession()).thenAnswer(
      (_) async => const PractitionerSession(
        userId: 'u-1',
        company: Company(id: 'org-1', name: 'Camille Marchand'),
      ),
    );

    await getIt.reset();
    getIt
      ..registerLazySingleton<CaptureStore>(() => store)
      ..registerLazySingleton<TodoApi>(() => api)
      ..registerLazySingleton<ActionableFollowUpRepository>(() => followUps)
      ..registerLazySingleton<AgendaRepository>(() => agenda);

    final cle = GlobalKey();
    final router = GoRouter(
      initialLocation: '/',
      routes: [GoRoute(path: '/', builder: (_, _) => const HomeScreen())],
    );

    tester.view.devicePixelRatio = 3;
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      RepaintBoundary(
        key: cle,
        child: BlocProvider(
          create: (_) => AuthCubit(auth, clearReadCache: () async {})..start(),
          child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            theme: buildAppTheme(
              brightness == Brightness.dark ? AppPalette.dark : AppPalette.light,
              brightness,
              platform: TargetPlatform.iOS,
            ),
            routerConfig: router,
          ),
        ),
      ),
    );
    for (var i = 0; i < 6; i++) {
      await tester.pump(const Duration(milliseconds: 60));
    }

    final limite =
        cle.currentContext!.findRenderObject()! as RenderRepaintBoundary;
    final image = await limite.toImage(pixelRatio: 3);
    final octets = await image.toByteData(format: ui.ImageByteFormat.png);
    Directory(dossier).createSync(recursive: true);
    File('$dossier/$nom.png').writeAsBytesSync(octets!.buffer.asUint8List());
  }

  testWidgets('accueil clair', (tester) async {
    await capturerAccueil(tester, '1-accueil-clair', Brightness.light);
  });

  testWidgets('accueil sombre', (tester) async {
    await capturerAccueil(tester, '2-accueil-sombre', Brightness.dark);
  });

  testWidgets('dictée', (tester) async {
    final recorder = MockAudioRecorder();
    final files = MockCaptureFiles();
    // Un contrôleur plutôt qu'un flux tout prêt : les barres ne se remplissent
    // qu'entre deux `pump`, comme elles se rempliraient entre deux images.
    final niveaux = StreamController<double>();
    addTearDown(niveaux.close);

    when(() => recorder.hasPermission()).thenAnswer((_) async => true);
    when(() => recorder.start(any())).thenAnswer((_) async {});
    when(() => recorder.dispose()).thenAnswer((_) async {});
    when(() => recorder.amplitude()).thenAnswer((_) => niveaux.stream);
    when(() => files.pathFor(any())).thenAnswer((_) async => '/tmp/c.m4a');

    final bloc = RecordingBloc(
      recorder: recorder,
      files: files,
      onSaved: (_) async {},
      now: () => maintenant,
      newId: () => 'capture-1',
    );

    await capturer(
      tester,
      '3-dictee',
      brightness: Brightness.light,
      child: BlocProvider.value(
        value: bloc,
        child: const RecordingScreen(),
      ),
      apres: (tester) async {
        bloc.add(const RecordingStarted(appointmentId: null));
        await tester.pump();
        await tester.pump();
        for (final niveau in _niveaux) {
          niveaux.add(niveau);
          await tester.pump(const Duration(milliseconds: 120));
        }
      },
    );
  });

  testWidgets('transcription', (tester) async {
    final repository = MockTranscriptRepository();
    final store = MockCaptureStore();
    when(() => repository.load(any())).thenAnswer(
      (_) async => const Success(
        Transcript(
          captureId: 'c-1',
          status: TranscriptStatus.ready,
          text:
              'Séance de suivi sur Iron, berger australien de cinq ans. Le '
              'propriétaire signale une raideur à la reprise du travail, '
              'surtout le matin.\n\n'
              'À la palpation, restriction de mobilité sur la charnière '
              'lombo-sacrée, sensibilité modérée en regard de L7. Bassin '
              "globalement équilibré, pas d'asymétrie franche.\n\n"
              'Travail en douceur sur la zone, relâchement obtenu en fin de '
              'séance. Je recommande deux semaines sans saut et une reprise '
              'progressive.',
        ),
      ),
    );

    await capturer(
      tester,
      '4-transcription',
      child: BlocProvider(
        create: (_) => TranscriptCubit(repository, store)..load('c-1'),
        child: const TranscriptScreen(
          captureId: 'c-1',
          needsPatient: false,
          appointmentId: null,
        ),
      ),
    );
  });

  testWidgets('compte rendu', (tester) async {
    final repository = MockReportRepository();
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(_compteRendu()));

    await capturer(
      tester,
      '5-compte-rendu',
      child: BlocProvider(
        create: (_) => ReportCubit(repository)..load('r-1'),
        child: const ReportScreen(),
      ),
    );
  });

  testWidgets('finaliser', (tester) async {
    final repository = MockReportRepository();
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(_compteRenduValide()));

    await capturer(
      tester,
      '6-finaliser',
      child: BlocProvider(
        create: (_) => ReportCubit(repository)..load('r-1'),
        child: const FinalizeScreen(),
      ),
    );
  });

  testWidgets('suivi à programmer', (tester) async {
    final repository = MockFollowUpRepository();

    await capturer(
      tester,
      '7-suivi-a-programmer',
      child: BlocProvider(
        create: (_) => FollowUpScheduleCubit(
          repository,
          reportId: 'r-1',
          now: () => maintenant,
        ),
        child: FollowUpScheduleScreen(now: maintenant),
      ),
    );
  });
}

Appointment _seance(
  String id,
  String nom,
  String espece,
  int debutMinutes,
  int finMinutes,
) => Appointment(
  id: id,
  patientId: 'p-$id',
  patientName: nom,
  species: espece,
  beginAt: maintenant.add(Duration(minutes: debutMinutes)),
  endAt: maintenant.add(Duration(minutes: finMinutes)),
  status: 'CONFIRMED',
);

const _transcription =
    'À la palpation, restriction de mobilité sur la charnière lombo-sacrée…';

ReportProposals _compteRendu() => const ReportProposals(
  reportId: 'r-1',
  status: ReportStatus.draft,
  patientName: 'Iron',
  owner: ReportOwner(
    id: 'o-1',
    name: 'Claire Lambert',
    email: 'claire.lambert@mail.fr',
  ),
  captureId: 'c-1',
  transcript: _transcription,
  proposals: [
    Proposal(
      id: 'p-1',
      section: ReportSection.clinical,
      text:
          'Restriction de mobilité de la charnière lombo-sacrée, avec '
          'sensibilité modérée en regard de L7.',
      state: SectionState.proposed,
      anchor: TranscriptAnchor(start: 0, end: 60, quote: _transcription),
    ),
    Proposal(
      id: 'p-2',
      section: ReportSection.clinical,
      text:
          "Bassin équilibré, pas d'asymétrie franche à l'observation "
          'statique.',
      state: SectionState.confirmed,
      anchor: TranscriptAnchor(start: 0, end: 60, quote: _transcription),
    ),
    Proposal(
      id: 'p-3',
      section: ReportSection.recommendations,
      text: 'Deux semaines sans saut, reprise progressive du travail.',
      state: SectionState.proposed,
      anchor: TranscriptAnchor(start: 0, end: 60, quote: _transcription),
    ),
    Proposal(
      id: 'p-4',
      section: ReportSection.recommendations,
      text: 'Contrôle à trois semaines.',
      state: SectionState.proposed,
      anchor: TranscriptAnchor(start: 0, end: 60, quote: _transcription),
    ),
  ],
  sections: {
    ReportSection.clinical: SectionState.proposed,
    ReportSection.anatomical: SectionState.empty,
    ReportSection.recommendations: SectionState.proposed,
    ReportSection.notes: SectionState.empty,
  },
);

ReportProposals _compteRenduValide() => const ReportProposals(
  reportId: 'r-1',
  status: ReportStatus.draft,
  patientName: 'Iron',
  owner: ReportOwner(
    id: 'o-1',
    name: 'Claire Lambert',
    email: 'claire.lambert@mail.fr',
  ),
  captureId: 'c-1',
  transcript: _transcription,
  proposals: [
    Proposal(
      id: 'p-1',
      section: ReportSection.clinical,
      text: 'Restriction de mobilité de la charnière lombo-sacrée.',
      state: SectionState.confirmed,
      anchor: TranscriptAnchor(start: 0, end: 60, quote: _transcription),
    ),
  ],
  sections: {
    ReportSection.clinical: SectionState.confirmed,
    ReportSection.anatomical: SectionState.confirmed,
    ReportSection.recommendations: SectionState.confirmed,
    ReportSection.notes: SectionState.notApplicable,
  },
);

/// Une phrase dictée, en niveaux : des attaques nettes, des respirations.
const _niveaux = [
  0.15, 0.32, 0.55, 0.26, 0.72, 0.42, 0.9, 0.36, 0.6, 0.21,
  0.78, 0.46, 0.94, 0.31, 0.66, 0.19, 0.5, 0.82, 0.38, 0.58,
  0.23, 0.46, 0.17, 0.34, 0.12, 0.21, 0.4, 0.68, 0.29, 0.55,
];

Future<void> _chargerLesPolices() async {
  const familles = {
    'BricolageGrotesque': [
      'assets/fonts/BricolageGrotesque-SemiBold.ttf',
      'assets/fonts/BricolageGrotesque-Bold.ttf',
    ],
    'PlusJakartaSans': [
      'assets/fonts/PlusJakartaSans-Regular.ttf',
      'assets/fonts/PlusJakartaSans-SemiBold.ttf',
      'assets/fonts/PlusJakartaSans-Bold.ttf',
    ],
  };

  for (final entree in familles.entries) {
    final loader = FontLoader(entree.key);
    for (final chemin in entree.value) {
      loader.addFont(
        File(chemin).readAsBytes().then(
          (octets) => ByteData.view(Uint8List.fromList(octets).buffer),
        ),
      );
    }
    await loader.load();
  }
}
