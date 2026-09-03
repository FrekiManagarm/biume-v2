import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'config/app_palette.dart';
import 'config/app_router.dart';
import 'config/app_theme.dart';
import 'core/database/app_database.dart';
import 'core/lifecycle/foreground_refresh.dart';
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
  late final _foreground = ForegroundRefresh(
    onForeground: _refreshIfAuthenticated,
  );
  StreamSubscription<AuthState>? _authSubscription;

  @override
  void initState() {
    super.initState();
    _auth = AuthCubit(
      getIt<AuthRepository>(),
      clearReadCache: getIt<AppDatabase>().clearReadCache,
    )..start();
    // Session prête = premier moment où le sélecteur d'animaux et la file de
    // dictées doivent être à jour, avant même que le praticien touche un
    // écran.
    _authSubscription = _auth.stream.listen((state) {
      if (state is AuthAuthenticated) unawaited(refreshForeground());
    });
    _foreground.start();
  }

  @override
  void dispose() {
    _foreground.stop();
    unawaited(_authSubscription?.cancel());
    _auth.close();
    super.dispose();
  }

  /// Ne rafraîchit jamais quand personne n'est connecté : un retour au
  /// premier plan avant authentification n'a ni session ni organisation à
  /// interroger.
  Future<void> _refreshIfAuthenticated() async {
    if (_auth.state is AuthAuthenticated) await refreshForeground();
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
