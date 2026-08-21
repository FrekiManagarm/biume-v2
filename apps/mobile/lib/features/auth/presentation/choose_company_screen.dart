import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../../../injection_container.dart';
import '../domain/auth_repository.dart';
import '../domain/session.dart';
import 'auth_cubit.dart';

/// Une session sans entreprise active n'est pas utilisable : toute lecture de
/// données de patient l'exige.
class ChooseCompanyScreen extends StatefulWidget {
  const ChooseCompanyScreen({super.key});

  @override
  State<ChooseCompanyScreen> createState() => _ChooseCompanyScreenState();
}

class _ChooseCompanyScreenState extends State<ChooseCompanyScreen> {
  late Future<Result<List<Company>>> _companies;

  @override
  void initState() {
    super.initState();
    _companies = getIt<AuthRepository>().listCompanies();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Votre entreprise')),
      body: SafeArea(
        child: FutureBuilder<Result<List<Company>>>(
          future: _companies,
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            return switch (snapshot.data!) {
              Err(:final failure) => Center(child: Text(failure.message)),
              Success(:final value) => ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: value.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final company = value[index];
                  return Card(
                    child: ListTile(
                      title: Text(company.name),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () =>
                          context.read<AuthCubit>().chooseCompany(company.id),
                    ),
                  );
                },
              ),
            };
          },
        ),
      ),
    );
  }
}
