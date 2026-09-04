import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../records/domain/patient.dart';
import 'transcript_cubit.dart';

/// La seule saisie de texte libre de toute l'application.
///
/// Le praticien **relit** d'abord : le texte se pose comme un document, pas
/// comme un formulaire. Corriger reste possible, derrière un geste nommé —
/// un champ ouvert par défaut invite à réécrire ce qui n'a pas besoin de
/// l'être, et fait manquer la relecture.
///
/// Un seul bouton engage la suite. Ce geste enregistre la correction,
/// rattache l'animal si la dictée était libre, puis lance l'extraction du
/// compte rendu. Aucune sauvegarde automatique.
class TranscriptScreen extends StatefulWidget {
  const TranscriptScreen({
    required this.captureId,
    required this.needsPatient,
    required this.appointmentId,
    super.key,
  });

  final String captureId;

  /// La dictée était libre : sans rendez-vous, elle doit être rattachée à un
  /// animal avant que le compte rendu puisse être extrait.
  final bool needsPatient;

  final String? appointmentId;

  @override
  State<TranscriptScreen> createState() => _TranscriptScreenState();
}

class _TranscriptScreenState extends State<TranscriptScreen> {
  final _controller = TextEditingController();
  bool _controllerInitialized = false;
  bool _correcting = false;
  Patient? _patient;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _choisirAnimal(BuildContext context) async {
    final patient = await context.push<Patient>('/animaux/choisir');
    if (patient != null && mounted) {
      setState(() => _patient = patient);
    }
  }

  void _valider(BuildContext context) {
    context.read<TranscriptCubit>().validate(
      text: _controller.text,
      patientId: _patient?.id,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<TranscriptCubit, TranscriptState>(
          listener: (context, state) {
            // Le champ ne se resynchronise avec le serveur qu'une seule
            // fois, au premier affichage : ensuite, seul le geste du
            // praticien change son contenu.
            if (!_controllerInitialized) {
              if (state is TranscriptReady) {
                _controller.text = state.draft ?? state.transcript.text;
                _controllerInitialized = true;
              } else if (state is TranscriptValidating) {
                _controller.text = state.transcript.text;
                _controllerInitialized = true;
              }
            }
            // Une correction refusée revient avec le brouillon : le champ
            // doit rester ouvert, sinon le texte tapé à une main disparaît
            // de la vue.
            if (state is TranscriptReady && state.draft != null) {
              _correcting = true;
            }
            if (state is TranscriptValidated) {
              context.pushReplacement('/comptes-rendus/${state.reportId}');
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                const ScreenHeader(title: 'Transcription'),
                Expanded(
                  child: switch (state) {
                    TranscriptInitial() || TranscriptLoading() => const Center(
                      child: CircularProgressIndicator(),
                    ),
                    TranscriptPending() => const _Message(
                      body:
                          'Biume transcrit votre dictée. Vous pouvez quitter '
                          'cet écran, elle apparaîtra dans « À traiter ».',
                    ),
                    TranscriptInaudible() => _Inaudible(
                      appointmentId: widget.appointmentId,
                    ),
                    TranscriptUnavailable(:final message) => _Message(
                      body: message,
                    ),
                    // Transitoire : le listener remplace déjà l'écran par le
                    // compte rendu au même instant.
                    TranscriptValidated() => const Center(
                      child: CircularProgressIndicator(),
                    ),
                    TranscriptReady() ||
                    TranscriptValidating() ||
                    TranscriptSaving() => _ReadyView(
                      state: state,
                      controller: _controller,
                      correcting: _correcting,
                      needsPatient: widget.needsPatient,
                      patient: _patient,
                      onChoosePatient: () => _choisirAnimal(context),
                    ),
                  },
                ),
                if (state is TranscriptReady ||
                    state is TranscriptValidating ||
                    state is TranscriptSaving)
                  _Dock(
                    state: state,
                    needsPatient: widget.needsPatient,
                    patient: _patient,
                    correcting: _correcting,
                    onCorrect: () => setState(() => _correcting = true),
                    onValidate: () => _valider(context),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ReadyView extends StatelessWidget {
  const _ReadyView({
    required this.state,
    required this.controller,
    required this.correcting,
    required this.needsPatient,
    required this.patient,
    required this.onChoosePatient,
  });

  final TranscriptState state;
  final TextEditingController controller;
  final bool correcting;
  final bool needsPatient;
  final Patient? patient;
  final VoidCallback onChoosePatient;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final ready = state is TranscriptReady ? state as TranscriptReady : null;
    final validating =
        state is TranscriptValidating || state is TranscriptSaving;
    final message = ready?.message;

    return ListView(
      padding: EdgeInsets.fromLTRB(
        AppShape.of(context).gutter,
        0,
        AppShape.of(context).gutter,
        16,
      ),
      children: [
        if (message != null) ...[
          NoticeBanner(icon: Icons.error_outline, message: message),
          const SizedBox(height: 14),
        ],
        if (correcting)
          TextField(
            controller: controller,
            maxLines: null,
            minLines: 8,
            enabled: !validating,
            autofocus: true,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w400,
              height: 1.62,
            ),
            decoration: const InputDecoration(
              hintText: 'Transcription de la dictée',
            ),
          )
        else
          SurfaceCard(
            radius: 24,
            padding: const EdgeInsets.all(20),
            // La transcription se lit comme un document : une seule surface,
            // les paragraphes séparés, rien qui ressemble à un champ.
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final paragraphe in _paragraphes(controller.text))
                  Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Text(
                      paragraphe,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w400,
                        height: 1.62,
                        color: palette.inkMuted,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        if (!correcting) ...[
          const SizedBox(height: 14),
          const NoticeBanner(
            icon: Icons.check,
            tone: NoticeTone.success,
            message:
                "Transcription complète. Relisez-la : le compte rendu s'appuiera "
                'dessus.',
          ),
        ],
        if (needsPatient) ...[
          const SizedBox(height: 14),
          SurfaceCard(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SectionLabel('Animal'),
                      const SizedBox(height: 6),
                      Text(
                        patient?.name ?? 'Non choisi',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                ),
                OutlinedButton(
                  onPressed: validating ? null : onChoosePatient,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(120, AppDesign.heightSecondary),
                  ),
                  child: const Text('Choisir'),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// Un texte dicté arrive d'un bloc. Les sauts de ligne existants font foi ;
/// à défaut, la ponctuation forte sert de respiration — un pavé de quinze
/// lignes ne se relit pas debout.
List<String> _paragraphes(String texte) {
  final propre = texte.trim();
  if (propre.isEmpty) return const [];

  final blocs = propre
      .split(RegExp(r'\n\s*\n'))
      .map((bloc) => bloc.trim())
      .where((bloc) => bloc.isNotEmpty)
      .toList();

  return blocs.length > 1 ? blocs : [propre];
}

class _Dock extends StatelessWidget {
  const _Dock({
    required this.state,
    required this.needsPatient,
    required this.patient,
    required this.correcting,
    required this.onCorrect,
    required this.onValidate,
  });

  final TranscriptState state;
  final bool needsPatient;
  final Patient? patient;
  final bool correcting;
  final VoidCallback onCorrect;
  final VoidCallback onValidate;

  @override
  Widget build(BuildContext context) {
    final validating =
        state is TranscriptValidating || state is TranscriptSaving;
    final canValidate = !validating && (!needsPatient || patient != null);

    return ActionDock(
      // Corriger reste offert, jamais au même niveau de lecture : un seul
      // bouton engage la suite.
      secondary: correcting
          ? null
          : TextButton(
              onPressed: validating ? null : onCorrect,
              child: const Text('Corriger le texte'),
            ),
      child: FilledButton(
        onPressed: canValidate ? onValidate : null,
        child: validating
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Text('Valider la transcription'),
      ),
    );
  }
}

class _Inaudible extends StatelessWidget {
  const _Inaudible({required this.appointmentId});

  final String? appointmentId;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "Rien n'a été capté.",
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 12),
          Text(
            "L'application ne devine jamais ce qui a été dit : "
            'réenregistrez la dictée.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: () => context.push(
              appointmentId == null ? '/dicter' : '/dicter?rdv=$appointmentId',
            ),
            child: const Text('Réenregistrer'),
          ),
        ],
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.body});

  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Center(
        child: Text(
          body,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
