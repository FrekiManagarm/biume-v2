import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../config/app_palette.dart';
import '../../../injection_container.dart';
import '../domain/owner_repository.dart';
import '../domain/patient.dart';
import '../domain/patient_repository.dart';
import 'new_client_cubit.dart';

/// Câble le cubit depuis l'injection.
///
/// `existingOwnerId` non nul saute le volet propriétaire : c'est le chemin
/// « Ajouter un animal à ce propriétaire » depuis le sélecteur d'animal.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection.
class NewClientPage extends StatelessWidget {
  const NewClientPage({this.existingOwnerId, super.key});

  final String? existingOwnerId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => NewClientCubit(
        getIt<OwnerRepository>(),
        getIt<PatientRepository>(),
        existingOwnerId: existingOwnerId,
      ),
      child: const NewClientScreen(),
    );
  }
}

/// Crée un propriétaire puis un animal, debout, en trente secondes.
///
/// Deux volets dans un `PageView` non défilable : le praticien avance par
/// les boutons, jamais en glissant, pour ne jamais franchir un volet en
/// laissant un nom vide derrière lui. Une fois l'animal créé, l'écran se
/// referme et le rend à son appelant via `context.pop`.
class NewClientScreen extends StatefulWidget {
  const NewClientScreen({super.key});

  @override
  State<NewClientScreen> createState() => _NewClientScreenState();
}

class _NewClientScreenState extends State<NewClientScreen> {
  late final PageController _controller;

  @override
  void initState() {
    super.initState();
    final step = context.read<NewClientCubit>().state.step;
    _controller = PageController(
      initialPage: step == NewClientStep.patient ? 1 : 0,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;

    return Scaffold(
      appBar: AppBar(title: const Text('Nouveau client')),
      body: SafeArea(
        child: BlocConsumer<NewClientCubit, NewClientState>(
          listenWhen: (previous, current) => previous.step != current.step,
          listener: (context, state) {
            switch (state.step) {
              case NewClientStep.owner:
                break;
              case NewClientStep.patient:
                _controller.animateToPage(
                  1,
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeInOut,
                );
              case NewClientStep.done:
                context.pop(state.patient);
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                _StepHeader(step: state.step),
                if (state.message != null)
                  _MessageBanner(message: state.message!, palette: palette),
                Expanded(
                  child: PageView(
                    controller: _controller,
                    physics: const NeverScrollableScrollPhysics(),
                    children: const [_OwnerPane(), _PatientPane()],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _StepHeader extends StatelessWidget {
  const _StepHeader({required this.step});

  final NewClientStep step;

  @override
  Widget build(BuildContext context) {
    final palette = Theme.of(context).brightness == Brightness.dark
        ? AppPalette.dark
        : AppPalette.light;
    final onOwner = step == NewClientStep.owner;

    TextStyle styleFor(bool active) => TextStyle(
      color: active ? palette.primary : palette.inkSubtle,
      fontWeight: active ? FontWeight.w600 : FontWeight.normal,
    );

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: [
          Text('1. Propriétaire', style: styleFor(onOwner)),
          const SizedBox(width: 16),
          Text('2. Animal', style: styleFor(!onOwner)),
        ],
      ),
    );
  }
}

class _MessageBanner extends StatelessWidget {
  const _MessageBanner({required this.message, required this.palette});

  final String message;
  final AppPalette palette;

  @override
  Widget build(BuildContext context) {
    final offline = message == newClientOfflineMessage;
    final surface = offline ? palette.warningSurface : palette.dangerSurface;
    final border = offline ? palette.warningBorder : palette.dangerBorder;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surface,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(message, style: TextStyle(color: palette.ink)),
          // Hors ligne, la création est impossible, mais deux gestes
          // restent possibles : dicter tout de suite, rattacher plus tard.
          if (offline) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: OutlinedButton(
                onPressed: () => context.push('/dicter'),
                child: const Text('Dicter'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _OwnerPane extends StatefulWidget {
  const _OwnerPane();

  @override
  State<_OwnerPane> createState() => _OwnerPaneState();
}

class _OwnerPaneState extends State<_OwnerPane> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _city = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _city.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final busy = context.select((NewClientCubit c) => c.state.busy);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: _name,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Nom'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'E-mail'),
        ),
        const Padding(
          padding: EdgeInsets.only(top: 4),
          child: Text(
            'Sans e-mail, vous ne pourrez pas lui envoyer le compte rendu '
            'depuis l\'application.',
            style: TextStyle(fontSize: 12),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _phone,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(labelText: 'Téléphone'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _city,
          decoration: const InputDecoration(labelText: 'Ville'),
        ),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: busy
              ? null
              : () => context.read<NewClientCubit>().submitOwner(
                  name: _name.text,
                  email: _email.text,
                  phone: _phone.text,
                  city: _city.text,
                ),
          child: const Text('Continuer'),
        ),
      ],
    );
  }
}

class _PatientPane extends StatefulWidget {
  const _PatientPane();

  @override
  State<_PatientPane> createState() => _PatientPaneState();
}

class _PatientPaneState extends State<_PatientPane> {
  final _name = TextEditingController();
  final _breed = TextEditingController();
  String _species = 'DOG';
  DateTime? _birthDate;

  @override
  void dispose() {
    _name.dispose();
    _breed.dispose();
    super.dispose();
  }

  Future<void> _choisirDate(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? now,
      firstDate: DateTime(now.year - 40),
      lastDate: now,
    );
    if (picked != null && mounted) {
      setState(() => _birthDate = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final busy = context.select((NewClientCubit c) => c.state.busy);
    final dateLabel = _birthDate == null
        ? 'Date de naissance'
        : '${_birthDate!.day}/${_birthDate!.month}/${_birthDate!.year}';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          controller: _name,
          decoration: const InputDecoration(labelText: 'Nom'),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          initialValue: _species,
          decoration: const InputDecoration(labelText: 'Espèce'),
          items: [
            for (final entry in speciesLabels.entries)
              DropdownMenuItem(value: entry.key, child: Text(entry.value)),
          ],
          onChanged: (value) {
            if (value != null) setState(() => _species = value);
          },
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _breed,
          decoration: const InputDecoration(labelText: 'Race'),
        ),
        const SizedBox(height: 16),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(dateLabel),
          trailing: const Icon(Icons.cake_outlined),
          onTap: () => _choisirDate(context),
        ),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: busy
              ? null
              : () => context.read<NewClientCubit>().submitPatient(
                  name: _name.text,
                  species: _species,
                  breed: _breed.text,
                  birthDate: _birthDate,
                ),
          child: const Text('Créer'),
        ),
      ],
    );
  }
}
