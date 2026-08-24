import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'config/app_palette.dart';
import 'config/app_router.dart';
import 'config/app_theme.dart';
import 'features/auth/domain/auth_repository.dart';
import 'features/auth/presentation/auth_cubit.dart';
import 'injection_container.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Portrait seul : l'application est tenue d'une main, souvent debout.
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  await initializeDateFormatting('fr_FR');
  await configureDependencies();

  runApp(const BiumeApp());
}

class BiumeApp extends StatefulWidget {
  const BiumeApp({super.key});

  @override
  State<BiumeApp> createState() => _BiumeAppState();
}

class _BiumeAppState extends State<BiumeApp> {
  late final AuthCubit _auth;
  late final router = buildAppRouter(_auth);

  @override
  void initState() {
    super.initState();
    _auth = AuthCubit(getIt<AuthRepository>())..start();
  }

  @override
  void dispose() {
    _auth.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _auth,
      child: MaterialApp.router(
        title: 'Biume',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(AppPalette.light, Brightness.light),
        darkTheme: buildAppTheme(AppPalette.dark, Brightness.dark),
        routerConfig: router,
      ),
    );
  }
}
