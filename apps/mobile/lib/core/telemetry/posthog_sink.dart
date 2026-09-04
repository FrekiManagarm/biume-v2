import 'dart:async';

import 'package:posthog_flutter/posthog_flutter.dart';

import '../../config/app_environment.dart';
import 'telemetry.dart';

/// Le transport des événements produits vers PostHog.
///
/// Ne filtre rien : `Telemetry.emit` a déjà retiré tout ce qui n'est pas dans
/// la liste blanche. Ce puits ne fait que poster ce qu'on lui donne, et
/// n'échoue jamais bruyamment — une panne de l'outil d'analyse ne doit pas
/// interrompre une tournée.
TelemetrySink createPosthogSink(Posthog client) => (event) {
  try {
    unawaited(
      client
          .capture(
            eventName: event.name,
            properties: {...event.properties, 'journeyId': event.journeyId},
          )
          .catchError((Object _) {}),
    );
  } catch (_) {
    // Un envoi refusé de manière synchrone — plateforme non initialisée,
    // par exemple — se traite comme un envoi perdu.
  }
};

/// Rattache les événements suivants au praticien connecté. Sans clé de projet,
/// aucun client n'existe : l'appel est alors sans effet.
Future<void> identifyForTelemetry(String userId) async {
  if (biumePosthogKey.isEmpty) return;
  try {
    await Posthog().identify(userId: userId);
  } catch (_) {
    // Idem : l'analyse ne bloque jamais un parcours.
  }
}

/// À la déconnexion : l'appareil peut changer de main, et les événements
/// suivants ne sont plus ceux de la même personne.
Future<void> resetTelemetryIdentity() async {
  if (biumePosthogKey.isEmpty) return;
  try {
    await Posthog().reset();
  } catch (_) {}
}
