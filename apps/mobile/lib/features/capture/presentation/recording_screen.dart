import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../config/app_palette.dart';
import '../../../config/app_theme.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../records/domain/patient.dart';
import 'recording_bloc.dart';

String _mmss(Duration d) {
  final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
  final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
  return '$m:$s';
}

/// L'écran de dictée.
///
/// Sombre en toute circonstance, y compris en thème clair : il se lit dehors,
/// à bout de bras, souvent en plein soleil ou à la tombée du jour. Une seule
/// action évidente à la fois — le praticien le tient d'une main, parfois avec
/// un animal devant lui.
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
    // L'écran impose son thème sombre au lieu de suivre celui du système :
    // en clair, un minuteur encre sur blanc disparaît au soleil.
    return Theme(
      data: buildAppTheme(
        AppPalette.dark,
        Brightness.dark,
        platform: Theme.of(context).platform,
      ),
      child: Builder(
        builder: (context) => Scaffold(
          backgroundColor: AppDesign.captureBackground,
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
              builder: (context, state) => Column(
                children: [
                  _Header(
                    // Une ligne, pas un écran de plus : le geste principal
                    // reste d'appuyer pour enregistrer. Le sélecteur ne
                    // s'affiche que sans rendez-vous, qui porte déjà l'animal,
                    // et disparaît dès la relecture — le rattachement se fait
                    // alors au moment de valider la transcription.
                    patient: _patient,
                    showPicker:
                        widget.appointmentId == null &&
                        (state is RecordingIdle ||
                            state is RecordingPreparing ||
                            state is RecordingInProgress),
                    onChoose: _choisirAnimal,
                  ),
                  Expanded(
                    child: switch (state) {
                      RecordingIdle() || RecordingPreparing() => const _Idle(),
                      RecordingPermissionDenied() => const _Message(
                        title: 'Micro non autorisé',
                        body:
                            'Biume a besoin du microphone pour enregistrer '
                            'votre dictée. Autorisez-le dans les réglages de '
                            'votre téléphone, puis revenez.',
                      ),
                      RecordingInProgress(:final elapsed) => _InProgress(
                        elapsed: elapsed,
                      ),
                      RecordingReview() => _Review(state: state),
                      RecordingSaving() => const Center(
                        child: CircularProgressIndicator(),
                      ),
                      RecordingSaved() => const SizedBox.shrink(),
                      RecordingFailed(:final message) => _Message(
                        title: 'Enregistrement interrompu',
                        body: message,
                      ),
                    },
                  ),
                  _Dock(state: state, appointmentId: widget.appointmentId),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.patient,
    required this.showPicker,
    required this.onChoose,
  });

  final Patient? patient;
  final bool showPicker;
  final VoidCallback onChoose;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(22, 8, 22, 0),
      child: Row(
        children: [
          _GlassTile(
            icon: Icons.close,
            semanticLabel: 'Abandonner',
            onTap: () => Navigator.of(context).maybePop(),
          ),
          Expanded(
            child: showPicker
                ? Center(child: _PatientPill(patient: patient, onTap: onChoose))
                : const SizedBox.shrink(),
          ),
          const SizedBox(width: 44),
        ],
      ),
    );
  }
}

/// Le choix facultatif de l'animal : rappelé en haut de l'écran, pas relégué
/// à une ligne de formulaire. Le praticien peut le faire avant ou pendant la
/// dictée, ou pas du tout.
class _PatientPill extends StatelessWidget {
  const _PatientPill({required this.patient, required this.onTap});

  final Patient? patient;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final choisi = patient != null;

    return Material(
      color: Colors.white.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(AppDesign.radiusPill),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDesign.radiusPill),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(9, 8, 16, 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  gradient: AppDesign.brandGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(width: 9),
              Text(
                choisi ? patient!.name : "Choisir l'animal",
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontSize: 14,
                  color: AppPalette.dark.ink,
                ),
              ),
              const SizedBox(width: 6),
              Icon(
                Icons.expand_more,
                size: 16,
                color: AppPalette.dark.inkSubtle,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Le bouton d'icône de l'écran sombre : posé sur un voile blanc, sans
/// bordure. Sur ce fond, une bordure grise se lit comme une rayure.
class _GlassTile extends StatelessWidget {
  const _GlassTile({
    required this.icon,
    required this.onTap,
    this.semanticLabel,
  });

  final IconData icon;
  final VoidCallback onTap;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticLabel,
      child: Material(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppShape.of(context).avatar),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppShape.of(context).avatar),
          child: SizedBox(
            width: 44,
            height: 44,
            child: Icon(icon, size: 20, color: AppPalette.dark.inkMuted),
          ),
        ),
      ),
    );
  }
}

class _Idle extends StatelessWidget {
  const _Idle();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 34),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Racontez la séance comme vous la raconteriez au propriétaire.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontSize: 17,
              fontWeight: FontWeight.w500,
              color: AppPalette.dark.inkMuted,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Dix minutes au maximum.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _InProgress extends StatelessWidget {
  const _InProgress({required this.elapsed});

  final Duration elapsed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const _RecordingPill(),
          const SizedBox(height: 34),
          Text(_mmss(elapsed), style: AppTypography.timer(AppPalette.dark.ink)),
          const SizedBox(height: 34),
          const _Waveform(),
          const SizedBox(height: 34),
          Text(
            'Il reste ${_mmss(captureMaxDuration - elapsed)}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _RecordingPill extends StatelessWidget {
  const _RecordingPill();

  @override
  Widget build(BuildContext context) {
    final teinte = AppPalette.dark.recording;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 7),
      decoration: BoxDecoration(
        color: teinte.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppDesign.radiusPill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 9,
            height: 9,
            decoration: BoxDecoration(color: teinte, shape: BoxShape.circle),
          ),
          const SizedBox(width: 9),
          Text(
            'ENREGISTREMENT',
            semanticsLabel: 'Enregistrement en cours',
            style: AppTypography.chip(teinte).copyWith(fontSize: 13),
          ),
        ],
      ),
    );
  }
}

/// Les barres de niveau, alimentées par le micro et non par une animation.
///
/// Une animation décorative bougerait à l'identique micro coupé : le praticien
/// croirait enregistrer alors que rien n'entre, et ne s'en apercevrait qu'au
/// moment où la transcription revient vide.
class _Waveform extends StatefulWidget {
  const _Waveform();

  @override
  State<_Waveform> createState() => _WaveformState();
}

class _WaveformState extends State<_Waveform> {
  static const _bars = 27;
  static const _minHeight = 10.0;
  static const _maxHeight = 96.0;

  // Extensible : la fenêtre glisse à chaque mesure, une liste de taille fixe
  // refuse `removeAt`.
  final _levels = List<double>.filled(_bars, 0, growable: true);
  StreamSubscription<double>? _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = context.read<RecordingBloc>().amplitude.listen((niveau) {
      if (!mounted) return;
      setState(() {
        // Le plus récent à droite : les barres défilent dans le sens de la
        // lecture.
        _levels
          ..removeAt(0)
          ..add(niveau.clamp(0.0, 1.0));
      });
    });
  }

  @override
  void dispose() {
    unawaited(_subscription?.cancel());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: _maxHeight,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          for (final niveau in _levels) ...[
            _Bar(niveau: niveau),
            const SizedBox(width: 4),
          ],
        ],
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.niveau});

  final double niveau;

  @override
  Widget build(BuildContext context) {
    // Le vert dit « ça porte » : au-delà de ce seuil, la voix est largement
    // au-dessus du bruit de fond.
    final couleur = niveau > 0.75
        ? AppPalette.dark.success
        : AppPalette.dark.primary.withValues(
            alpha: math.max(0.25, niveau),
          );

    return AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      width: 4,
      height:
          _WaveformState._minHeight +
          (_WaveformState._maxHeight - _WaveformState._minHeight) * niveau,
      decoration: BoxDecoration(
        color: couleur,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}

class _Review extends StatelessWidget {
  const _Review({required this.state});

  final RecordingReview state;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (state.interrupted) ...[
            // Le praticien doit savoir pourquoi sa dictée est plus courte que
            // prévu, sinon il croira à une perte.
            const NoticeBanner(
              icon: Icons.pause_circle_outline,
              message:
                  "Votre téléphone a interrompu l'enregistrement. Ce qui a "
                  'été dit avant est conservé.',
            ),
            const SizedBox(height: 34),
          ],
          Text(
            _mmss(state.duration),
            style: AppTypography.timer(AppPalette.dark.ink),
          ),
          const SizedBox(height: 12),
          Text(
            'Dictée enregistrée sur le téléphone.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppPalette.dark.inkMuted,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            "Rien n'est envoyé tant que vous n'avez pas validé.",
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Text(
            body,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}

/// Le socle de la dictée. Un seul bouton pendant qu'on parle — le gros disque
/// au dégradé de marque, qui démarre puis arrête. La relecture est le seul
/// moment où l'écran offre deux gestes, et ils ne se ressemblent pas.
class _Dock extends StatelessWidget {
  const _Dock({required this.state, required this.appointmentId});

  final RecordingState state;
  final String? appointmentId;

  @override
  Widget build(BuildContext context) {
    if (state is RecordingReview) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(22, 16, 22, 30),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            FilledButton(
              onPressed: () =>
                  context.read<RecordingBloc>().add(const RecordingAccepted()),
              child: const Text('Valider et envoyer'),
            ),
            const SizedBox(height: 4),
            TextButton(
              onPressed: () =>
                  context.read<RecordingBloc>().add(const RecordingDiscarded()),
              child: const Text('Jeter cette dictée'),
            ),
          ],
        ),
      );
    }

    final (onPressed, icone, etiquette) = switch (state) {
      RecordingIdle() => (
        () => context.read<RecordingBloc>().add(
          RecordingStarted(appointmentId: appointmentId),
        ),
        Icons.mic_none,
        'Commencer la dictée',
      ),
      RecordingPreparing() => (null, Icons.mic_none, 'Commencer la dictée'),
      RecordingInProgress() => (
        () => context.read<RecordingBloc>().add(const RecordingStopped()),
        null,
        'Terminer',
      ),
      _ => (null, null, null),
    };

    if (etiquette == null) return const SizedBox(height: 46);

    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 0, 28, 46),
      child: _RecordButton(
        onPressed: onPressed,
        icon: icone,
        label: etiquette,
      ),
    );
  }
}

/// Le disque de 96 px, seule cible de l'écran pendant la dictée : un micro
/// pour lancer, un carré blanc pour arrêter — la convention de tous les
/// magnétophones, qui n'a pas besoin d'être écrite.
class _RecordButton extends StatelessWidget {
  const _RecordButton({
    required this.onPressed,
    required this.icon,
    required this.label,
  });

  final VoidCallback? onPressed;
  final IconData? icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Opacity(
        opacity: onPressed == null ? 0.5 : 1,
        child: Tooltip(
          message: label,
          child: Semantics(
            button: true,
            label: label,
            child: Material(
              shape: const CircleBorder(),
              clipBehavior: Clip.antiAlias,
              child: Ink(
                decoration: const BoxDecoration(
                  gradient: AppDesign.brandGradient,
                  shape: BoxShape.circle,
                ),
                child: InkWell(
                  onTap: onPressed,
                  customBorder: const CircleBorder(),
                  child: SizedBox(
                    width: 96,
                    height: 96,
                    child: Center(
                      child: icon == null
                          ? Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(9),
                              ),
                            )
                          : Icon(icon, size: 34, color: Colors.white),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
