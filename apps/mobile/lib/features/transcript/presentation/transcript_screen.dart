import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_palette.dart';
import '../../records/domain/patient.dart';
import 'transcript_cubit.dart';

/// La seule saisie de texte libre de toute l'application.
///
/// Le praticien relit la transcription, la corrige si besoin, et appuie sur
/// **un seul bouton**. Ce geste enregistre la correction, rattache l'animal
/// si la dictée était libre, puis lance l'extraction du compte rendu.
/// Aucune sauvegarde automatique : le texte ne part que par ce bouton.
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
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Scaffold(
      appBar: AppBar(title: const Text('Transcription')),
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
            if (state is TranscriptValidated) {
              context.pushReplacement('/comptes-rendus/${state.reportId}');
            }
          },
          builder: (context, state) {
            return switch (state) {
              TranscriptInitial() || TranscriptLoading() => const Center(
                child: CircularProgressIndicator(),
              ),
              TranscriptPending() => _Message(
                palette: palette,
                body:
                    'Biume transcrit votre dictée. Vous pouvez quitter cet '
                    'écran, elle apparaîtra dans « À traiter ».',
              ),
              TranscriptInaudible() => _Inaudible(
                palette: palette,
                appointmentId: widget.appointmentId,
              ),
              TranscriptUnavailable(:final message) => _Message(
                palette: palette,
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
                palette: palette,
                state: state,
                controller: _controller,
                needsPatient: widget.needsPatient,
                patient: _patient,
                onChoosePatient: () => _choisirAnimal(context),
                onValidate: () => _valider(context),
              ),
            };
          },
        ),
      ),
    );
  }
}

class _ReadyView extends StatelessWidget {
  const _ReadyView({
    required this.palette,
    required this.state,
    required this.controller,
    required this.needsPatient,
    required this.patient,
    required this.onChoosePatient,
    required this.onValidate,
  });

  final AppPalette palette;
  final TranscriptState state;
  final TextEditingController controller;
  final bool needsPatient;
  final Patient? patient;
  final VoidCallback onChoosePatient;
  final VoidCallback onValidate;

  @override
  Widget build(BuildContext context) {
    final ready = state is TranscriptReady ? state as TranscriptReady : null;
    final validating =
        state is TranscriptValidating || state is TranscriptSaving;
    final canValidate = !validating && (!needsPatient || patient != null);
    final message = ready?.message;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        if (message != null)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: palette.warningSurface,
              border: Border.all(color: palette.warningBorder),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(message, style: TextStyle(color: palette.ink)),
          ),
        TextField(
          controller: controller,
          maxLines: null,
          minLines: 6,
          enabled: !validating,
          decoration: const InputDecoration(
            hintText: 'Transcription de la dictée',
          ),
        ),
        if (needsPatient) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Animal : ${patient?.name ?? "non choisi"}',
                  style: TextStyle(color: palette.inkMuted),
                ),
              ),
              OutlinedButton(
                onPressed: validating ? null : onChoosePatient,
                child: const Text('Choisir'),
              ),
            ],
          ),
        ],
        const SizedBox(height: 24),
        FilledButton(
          onPressed: canValidate ? onValidate : null,
          child: validating
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Valider la transcription'),
        ),
      ],
    );
  }
}

class _Inaudible extends StatelessWidget {
  const _Inaudible({required this.palette, required this.appointmentId});

  final AppPalette palette;
  final String? appointmentId;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
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
            style: TextStyle(color: palette.inkMuted),
          ),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: () => context.push('/dicter?rdv=$appointmentId'),
            child: const Text('Réenregistrer'),
          ),
        ],
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.palette, required this.body});

  final AppPalette palette;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Text(
          body,
          textAlign: TextAlign.center,
          style: TextStyle(color: palette.inkMuted),
        ),
      ),
    );
  }
}
