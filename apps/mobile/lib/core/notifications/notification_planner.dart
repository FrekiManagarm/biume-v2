import 'package:flutter/foundation.dart';

import '../../features/todo/domain/todo_item.dart';

/// Une notification décidée, pas encore posée.
@immutable
class PlannedNotification {
  const PlannedNotification({
    required this.key,
    required this.title,
    required this.body,
    required this.route,
  });

  /// Ce qui identifie la situation, pas la notification : c'est cette clé
  /// qu'on retient pour ne jamais déranger deux fois pour la même chose.
  final String key;
  final String title;
  final String body;

  /// L'écran où le geste se fait. Une notification qui ne mène nulle part
  /// n'est qu'une interruption.
  final String route;

  @override
  bool operator ==(Object other) =>
      other is PlannedNotification &&
      other.key == key &&
      other.title == title &&
      other.body == body &&
      other.route == route;

  @override
  int get hashCode => Object.hash(key, title, body, route);
}

/// Quoi notifier, à partir de « À traiter » et de ce qu'on a déjà dit.
///
/// Fonction pure, sans effet de bord : c'est ce qui rend la règle « jamais
/// deux fois, jamais une réussite » vérifiable sans plateforme, sans base et
/// sans horloge.
///
/// Trois genres seulement dérangent le praticien : un propriétaire qui
/// attend, un compte rendu qui dort, une dictée abandonnée après cinq échecs.
/// Tout le reste — « Biume transcrit », « Biume prépare », un envoi en cours —
/// est du travail en train de se faire : le dire réveillerait pour ne rien
/// demander, et une notification qui ne demande rien apprend à ignorer les
/// suivantes.
List<PlannedNotification> planNotifications({
  required List<TodoItem> todo,
  required Set<String> alreadyNotified,
}) {
  final planned = <PlannedNotification>[];
  for (final item in todo) {
    final candidate = switch (item.kind) {
      TodoKind.followUp when item.followUpId != null => PlannedNotification(
        key: 'followup:${item.followUpId}',
        title:
            '${item.patientName ?? 'Un animal'} : un propriétaire demande une action',
        body: item.label,
        route: '/suivis/${item.followUpId}',
      ),
      TodoKind.reportToValidate ||
      TodoKind.readyToSend when item.reportId != null => PlannedNotification(
        key: 'draft:${item.reportId}',
        title: '${item.patientName ?? 'Une séance'} : compte rendu en attente',
        body: item.label,
        route: '/comptes-rendus/${item.reportId}',
      ),
      TodoKind.uploadBlocked => PlannedNotification(
        key: 'blocked:${item.captureId}',
        title: "Une dictée n'a pas pu être envoyée",
        body: 'Ouvrez Biume pour réessayer.',
        route: '/',
      ),
      _ => null,
    };
    if (candidate != null && !alreadyNotified.contains(candidate.key)) {
      planned.add(candidate);
    }
  }
  return planned;
}
