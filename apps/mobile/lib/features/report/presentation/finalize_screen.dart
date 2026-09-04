import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_design.dart';
import '../../../core/telemetry/telemetry.dart';
import '../../../core/ui/biume_widgets.dart';
import '../../../injection_container.dart';
import '../domain/owner_email.dart';
import '../domain/proposal.dart';
import '../domain/report_repository.dart';
import 'report_cubit.dart';

/// Câble le cubit et déclenche le chargement.
///
/// Un cubit à lui, et non celui de l'écran précédent : la finalisation est
/// irréversible, elle se décide sur l'état que le serveur donne à cet
/// instant, pas sur celui qu'un écran gardait en mémoire.
class FinalizePage extends StatelessWidget {
  const FinalizePage({required this.reportId, super.key});

  final String reportId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          ReportCubit(getIt<ReportRepository>(), telemetry: getIt<Telemetry>())
            ..load(reportId),
      child: const FinalizeScreen(),
    );
  }
}

/// Le dernier écran avant l'irréversible.
///
/// Ce qui part, à qui, et ce que l'envoi engage — annoncé **avant** le geste.
/// Le praticien lit le destinataire et peut le corriger sur place ; le
/// dégradé de marque ne porte que « Finaliser et envoyer », deuxième et
/// dernier emploi dans toute l'application.
class FinalizeScreen extends StatefulWidget {
  const FinalizeScreen({super.key});

  @override
  State<FinalizeScreen> createState() => _FinalizeScreenState();
}

class _FinalizeScreenState extends State<FinalizeScreen> {
  // Le compte rendu voyage vers le suivi avec son identifiant de parcours de
  // télémétrie — porté ici depuis le dernier `ReportLoaded` vu, puisque
  // `ReportFinalized` ne le transporte pas lui-même.
  String? _captureId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<ReportCubit, ReportState>(
          listener: (context, state) {
            if (state is ReportLoaded) {
              _captureId = state.data.captureId;
            } else if (state is ReportFinalized) {
              context.pushReplacement(
                '/comptes-rendus/${state.reportId}/suivi'
                '?capture=${_captureId ?? ''}',
              );
            }
          },
          builder: (context, state) => switch (state) {
            ReportInitial() || ReportLoading() || ReportPreparing() =>
              const Center(child: CircularProgressIndicator()),
            ReportUnavailable(:final message) => Column(
              children: [
                const ScreenHeader(title: 'Finaliser'),
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(28),
                      child: Text(
                        message,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            ReportLoaded() => _Recap(state),
            // Transitoire : le listener remplace déjà l'écran par le suivi.
            ReportFinalized() => const Center(
              child: CircularProgressIndicator(),
            ),
          },
        ),
      ),
    );
  }
}

class _Recap extends StatelessWidget {
  const _Recap(this.state);

  final ReportLoaded state;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final data = state.data;
    final email = data.owner.email;
    final gutter = AppShape.of(context).gutter;

    return Column(
      children: [
        const ScreenHeader(title: 'Finaliser'),
        Expanded(
          child: ListView(
            padding: EdgeInsets.fromLTRB(gutter, 0, gutter, 16),
            children: [
              if (state.message != null) ...[
                NoticeBanner(
                  icon: Icons.error_outline,
                  message: state.message!,
                ),
                const SizedBox(height: 14),
              ],
              _Summary(data: data),
              const SizedBox(height: 14),
              SurfaceCard(
                radius: 24,
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionLabel('Destinataire'),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _OwnerAvatar(name: data.owner.name),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                data.owner.name,
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                // L'absence d'adresse se dit ici, avant le
                                // geste — pas après, dans une feuille qui
                                // surgit quand on croyait avoir envoyé.
                                email ?? "Aucune adresse enregistrée",
                                style: Theme.of(context).textTheme.bodySmall
                                    ?.copyWith(
                                      fontSize: 14,
                                      color: email == null
                                          ? palette.warning
                                          : palette.inkSubtle,
                                    ),
                              ),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: state.busy
                              ? null
                              : () => _modifierAdresse(context, data),
                          style: TextButton.styleFrom(
                            minimumSize: const Size(0, 44),
                            foregroundColor: palette.primary,
                            textStyle: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(fontSize: 14),
                          ),
                          child: Text(email == null ? 'Ajouter' : 'Modifier'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const NoticeBanner(
                icon: Icons.info_outline,
                tone: NoticeTone.neutral,
                message:
                    "Une fois envoyé, le compte rendu n'est plus modifiable "
                    'depuis le mobile. Le propriétaire en reçoit une copie.',
              ),
            ],
          ),
        ),
        ActionDock(
          secondary: TextButton(
            onPressed: state.busy
                ? null
                : () =>
                      context.read<ReportCubit>().finalize(sendToOwner: false),
            child: const Text('Finaliser sans envoyer'),
          ),
          child: BrandAction(
            label: 'Finaliser et envoyer',
            // Sans adresse, l'envoi ne peut pas aboutir : le bouton s'éteint
            // et « Ajouter », juste au-dessus, dit quoi faire.
            onPressed: state.busy || email == null
                ? null
                : () =>
                      context.read<ReportCubit>().finalize(sendToOwner: true),
          ),
        ),
      ],
    );
  }

  Future<void> _modifierAdresse(
    BuildContext context,
    ReportProposals data,
  ) async {
    final cubit = context.read<ReportCubit>();

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      // `showModalBottomSheet` insère la feuille au-dessus du `Navigator` :
      // elle n'hérite pas du `BlocProvider` posé par `FinalizePage`, il faut
      // le reproposer explicitement.
      builder: (sheetContext) => BlocProvider.value(
        value: cubit,
        child: _OwnerEmailSheet(
          ownerName: data.owner.name,
          current: data.owner.email,
        ),
      ),
    );
  }
}

/// Le récapitulatif : ce qui a été validé, et sur quel animal. Une surface
/// teintée du violet vers le vert — l'action attendue devenue état atteint.
class _Summary extends StatelessWidget {
  const _Summary({required this.data});

  final ReportProposals data;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final validees = data.sections.values
        .where((state) => state == SectionState.confirmed)
        .length;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [palette.primarySurface, palette.successSurface],
        ),
        border: Border.all(color: palette.primaryBorder),
        borderRadius: BorderRadius.circular(AppShape.of(context).surface),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: palette.success,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check, size: 13, color: palette.onSuccess),
              ),
              const SizedBox(width: 9),
              Text(
                '$validees SECTION${validees > 1 ? 'S' : ''} '
                'VALIDÉE${validees > 1 ? 'S' : ''}',
                semanticsLabel:
                    '$validees section${validees > 1 ? 's' : ''} '
                    'validée${validees > 1 ? 's' : ''}',
                style: AppTypography.chip(palette.success).copyWith(
                  fontSize: 13,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            data.patientName,
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 4),
          Text(
            'Compte rendu prêt à être envoyé.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class _OwnerAvatar extends StatelessWidget {
  const _OwnerAvatar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final palette = paletteOf(context);
    final mots = name.trim().split(RegExp(r'\s+')).where((m) => m.isNotEmpty);
    final initiales = mots.isEmpty
        ? '?'
        : mots.take(2).map((m) => m[0].toUpperCase()).join();

    return Container(
      width: 44,
      height: 44,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: palette.primarySurface,
        shape: BoxShape.circle,
      ),
      child: Text(
        initiales,
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.w700,
          fontSize: 15,
          color: palette.primary,
        ),
      ),
    );
  }
}

/// Compléter ou corriger l'adresse. Enregistrer ne finalise rien : le
/// praticien revient au récapitulatif et décide ensuite.
class _OwnerEmailSheet extends StatefulWidget {
  const _OwnerEmailSheet({required this.ownerName, required this.current});

  final String ownerName;
  final String? current;

  @override
  State<_OwnerEmailSheet> createState() => _OwnerEmailSheetState();
}

class _OwnerEmailSheetState extends State<_OwnerEmailSheet> {
  late final _controller = TextEditingController(text: widget.current ?? '');
  String? _erreur;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Validée sur place. Une adresse vide ou malformée reviendrait du serveur
  /// en message générique, après un aller-retour, et sans dire quoi corriger.
  void _enregistrer() {
    final erreur = ownerEmailError(_controller.text);
    if (erreur != null) {
      setState(() => _erreur = erreur);
      return;
    }

    final cubit = context.read<ReportCubit>();
    Navigator.of(context).pop();
    cubit.changeOwnerEmail(normalizeOwnerEmail(_controller.text));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: 24 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.current == null
                ? "${widget.ownerName} n'a pas d'adresse e-mail. Sans elle, "
                      'Biume ne peut pas lui envoyer le compte rendu.'
                : "Adresse à laquelle ${widget.ownerName} recevra le compte "
                      'rendu.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            autofocus: true,
            decoration: InputDecoration(
              hintText: 'Adresse e-mail',
              errorText: _erreur,
            ),
            onChanged: (_) {
              if (_erreur != null) setState(() => _erreur = null);
            },
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _enregistrer,
            child: const Text("Enregistrer l'adresse"),
          ),
        ],
      ),
    );
  }
}
