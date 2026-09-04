import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../injection_container.dart';
import '../domain/patient.dart';
import '../domain/patient_repository.dart';
import 'patient_picker_cubit.dart';

/// Câble le cubit depuis l'injection et déclenche l'abonnement au cache.
///
/// Séparé de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de `start()` se voie.
class PatientPickerPage extends StatelessWidget {
  const PatientPickerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => PatientPickerCubit(getIt<PatientRepository>())..start(),
      child: const PatientPickerScreen(),
    );
  }
}

/// Choix de l'animal auquel rattacher une dictée libre, sans rendez-vous.
///
/// Se fait souvent debout, à une main, dans une écurie sans réseau : cet
/// écran lit uniquement le cache local, jamais le réseau. L'animal choisi est
/// renvoyé à l'appelant via `context.pop`.
class PatientPickerScreen extends StatelessWidget {
  const PatientPickerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quel animal ?')),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Nom de l\'animal ou du propriétaire',
                ),
                onChanged: (value) =>
                    context.read<PatientPickerCubit>().search(value),
              ),
            ),
            Expanded(
              child: BlocBuilder<PatientPickerCubit, PatientPickerState>(
                builder: (context, state) {
                  // Un cache jamais rempli n'est pas « aucun résultat » : le
                  // praticien doit savoir quoi faire pour le remplir.
                  if (state.all.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text(
                          'Aucun animal dans le cache. Connectez-vous une '
                          'fois au réseau pour le remplir.',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    );
                  }

                  final visible = state.visible;
                  // Le cache est plein mais la recherche ne donne rien : ce
                  // n'est pas le même silence qu'un cache vide, il faut le
                  // dire aussi, sans quoi la liste vide se lit comme un
                  // écran gelé.
                  if (visible.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text(
                          'Aucun animal ne correspond à cette recherche.',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    );
                  }

                  return ListView.builder(
                    itemCount: visible.length,
                    itemBuilder: (context, index) {
                      final patient = visible[index];
                      return ListTile(
                        title: Text(patient.name),
                        subtitle: Text(patient.subtitle),
                        onTap: () => context.pop(patient),
                        onLongPress: () =>
                            _proposerAjoutAnimal(context, patient),
                      );
                    },
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: OutlinedButton.icon(
                onPressed: () => _creerNouveauClient(context),
                icon: const Icon(Icons.person_add),
                label: const Text('Nouveau client'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Le sélecteur retient directement l'animal créé, plutôt que de forcer le
  /// praticien à le rechercher juste après l'avoir saisi.
  Future<void> _creerNouveauClient(BuildContext context) async {
    final created = await context.push<Patient>('/clients/nouveau');
    if (created != null && context.mounted) {
      context.pop(created);
    }
  }

  /// Appui long sur une ligne existante : raccourci vers le volet animal
  /// seul, le propriétaire étant déjà connu.
  Future<void> _proposerAjoutAnimal(
    BuildContext context,
    Patient patient,
  ) async {
    await showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: ListTile(
          title: Text('Ajouter un animal à ${patient.ownerName}'),
          onTap: () async {
            Navigator.of(sheetContext).pop();
            final created = await context.push<Patient>(
              '/clients/nouveau?proprietaire=${patient.ownerId}',
            );
            if (created != null && context.mounted) {
              context.pop(created);
            }
          },
        ),
      ),
    );
  }
}
