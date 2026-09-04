import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:go_router/go_router.dart';

import '../../../config/app_palette.dart';
import '../../records/domain/patient.dart';
import 'recording_bloc.dart';

String _mmss(Duration d) {
  final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
  final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
  return '$m:$s';
}

/// L'écran de dictée.
///
/// Une seule action évidente à la fois. Le praticien le tient d'une main,
/// souvent debout, parfois avec un animal devant lui : rien d'important n'est
/// caché derrière un second geste.
class RecordingScreen extends StatefulWidget {
  const RecordingScreen({this.appointmentId, this.onPatientChosen, super.key});

  final String? appointmentId;

  /// L'animal choisi avant ou pendant la dictée, remonté à qui enregistrera la
  /// capture. Facultatif : le chemin obligatoire reste le rattachement au
  /// moment de valider la transcription.
  final ValueChanged<Patient>? onPatientChosen;

  @override
  State<RecordingScreen> createState() => _RecordingScreenState();
}

class _RecordingScreenState extends State<RecordingScreen>
    with WidgetsBindingObserver {
  Timer? _timer;
  Duration _elapsed = Duration.zero;
  Patient? _patient;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Le système suspend l'application — appel entrant, verrouillage. La dictée
  /// déjà captée est fermée proprement et reste récupérable, jamais perdue.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused &&
        context.read<RecordingBloc>().state is RecordingInProgress) {
      context.read<RecordingBloc>().add(const RecordingInterrupted());
    }
  }

  Future<void> _choisirAnimal() async {
    final patient = await context.push<Patient>('/animaux/choisir');
    if (patient == null || !mounted) return;
    setState(() => _patient = patient);
    widget.onPatientChosen?.call(patient);
  }

  void _startTicking() {
    _elapsed = Duration.zero;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _elapsed += const Duration(seconds: 1);
      if (mounted) {
        context.read<RecordingBloc>().add(RecordingTicked(_elapsed));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Scaffold(
      appBar: AppBar(title: const Text('Dicter la séance')),
      body: SafeArea(
        child: BlocConsumer<RecordingBloc, RecordingState>(
          listener: (context, state) {
            if (state is RecordingInProgress && _timer == null) {
              _startTicking();
            }
            if (state is! RecordingInProgress) {
              _timer?.cancel();
              _timer = null;
            }
            if (state is RecordingSaved) Navigator.of(context).pop();
          },
          builder: (context, state) => Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Une ligne, pas un écran de plus : le geste principal reste
                // d'appuyer pour enregistrer. Elle ne s'affiche que sans
                // rendez-vous, qui porte déjà l'animal, et disparaît dès que
                // la dictée est en relecture — le rattachement se fait alors
                // au moment de valider la transcription.
                if (widget.appointmentId == null &&
                    (state is RecordingIdle ||
                        state is RecordingPreparing ||
                        state is RecordingInProgress))
                  _PatientLine(
                    palette: palette,
                    patient: _patient,
                    onChoose: _choisirAnimal,
                  ),
                Expanded(
                  child: switch (state) {
                    RecordingIdle() || RecordingPreparing() => _Idle(
                      palette: palette,
                      busy: state is RecordingPreparing,
                      appointmentId: widget.appointmentId,
                    ),
                    RecordingPermissionDenied() => _Message(
                      palette: palette,
                      title: 'Micro non autorisé',
                      body:
                          'Biume a besoin du microphone pour enregistrer votre '
                          'dictée. Autorisez-le dans les réglages de votre '
                          'téléphone, puis revenez.',
                    ),
                    RecordingInProgress(:final elapsed) => _InProgress(
                      palette: palette,
                      elapsed: elapsed,
                    ),
                    RecordingReview() => _Review(
                      palette: palette,
                      state: state,
                    ),
                    RecordingSaving() => const Center(
                      child: CircularProgressIndicator(),
                    ),
                    RecordingSaved() => const SizedBox.shrink(),
                    RecordingFailed(:final message) => _Message(
                      palette: palette,
                      title: 'Enregistrement interrompu',
                      body: message,
                    ),
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Le choix facultatif de l'animal, discret : le praticien peut le faire
/// avant ou pendant la dictée, ou pas du tout.
class _PatientLine extends StatelessWidget {
  const _PatientLine({
    required this.palette,
    required this.patient,
    required this.onChoose,
  });

  final AppPalette palette;
  final Patient? patient;
  final VoidCallback onChoose;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            'Animal : ${patient?.name ?? "non choisi"}',
            style: TextStyle(color: palette.inkMuted),
          ),
        ),
        TextButton(onPressed: onChoose, child: const Text('Choisir')),
      ],
    );
  }
}

class _Idle extends StatelessWidget {
  const _Idle({
    required this.palette,
    required this.busy,
    required this.appointmentId,
  });

  final AppPalette palette;
  final bool busy;
  final String? appointmentId;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Racontez la séance comme vous la raconteriez au propriétaire.',
          textAlign: TextAlign.center,
          style: TextStyle(color: palette.inkMuted, fontSize: 16),
        ),
        const SizedBox(height: 8),
        Text(
          'Dix minutes au maximum.',
          style: TextStyle(color: palette.inkSubtle),
        ),
        const SizedBox(height: 40),
        FilledButton(
          onPressed: busy
              ? null
              : () => context.read<RecordingBloc>().add(
                  RecordingStarted(appointmentId: appointmentId),
                ),
          child: const Text('Commencer la dictée'),
        ),
      ],
    );
  }
}

class _InProgress extends StatelessWidget {
  const _InProgress({required this.palette, required this.elapsed});

  final AppPalette palette;
  final Duration elapsed;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: palette.recording,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          _mmss(elapsed),
          style: TextStyle(
            fontSize: 56,
            fontWeight: FontWeight.w300,
            color: palette.ink,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Il reste ${_mmss(captureMaxDuration - elapsed)}',
          style: TextStyle(color: palette.inkSubtle),
        ),
        const SizedBox(height: 40),
        FilledButton(
          onPressed: () =>
              context.read<RecordingBloc>().add(const RecordingStopped()),
          child: const Text('Terminer'),
        ),
      ],
    );
  }
}

class _Review extends StatelessWidget {
  const _Review({required this.palette, required this.state});

  final AppPalette palette;
  final RecordingReview state;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.interrupted)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(
              color: palette.warningSurface,
              border: Border.all(color: palette.warningBorder),
              borderRadius: BorderRadius.circular(14),
            ),
            // Le praticien doit savoir pourquoi sa dictée est plus courte que
            // prévu, sinon il croira à une perte.
            child: Text(
              'Votre téléphone a interrompu l\'enregistrement. Ce qui a été '
              'dit avant est conservé.',
              style: TextStyle(color: palette.ink),
            ),
          ),
        Text(
          'Dictée de ${_mmss(state.duration)}',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'Rien n\'est envoyé tant que vous n\'avez pas validé.',
          textAlign: TextAlign.center,
          style: TextStyle(color: palette.inkMuted),
        ),
        const SizedBox(height: 32),
        FilledButton(
          onPressed: () =>
              context.read<RecordingBloc>().add(const RecordingAccepted()),
          child: const Text('Valider et envoyer'),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: () =>
              context.read<RecordingBloc>().add(const RecordingDiscarded()),
          child: const Text('Jeter cette dictée'),
        ),
      ],
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({
    required this.palette,
    required this.title,
    required this.body,
  });

  final AppPalette palette;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        Text(
          body,
          textAlign: TextAlign.center,
          style: TextStyle(color: palette.inkMuted),
        ),
      ],
    );
  }
}
