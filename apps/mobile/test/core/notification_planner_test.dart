import 'package:biume_mobile/core/notifications/notification_planner.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:flutter_test/flutter_test.dart';

TodoItem item(
  TodoKind kind, {
  String captureId = 'c-1',
  String? reportId,
  String? followUpId,
  String? patientName,
  String? detail,
}) => TodoItem(
  kind: kind,
  captureId: captureId,
  reportId: reportId,
  followUpId: followUpId,
  patientName: patientName,
  detail: detail,
  updatedAt: DateTime(2026, 9, 3, 9),
);

void main() {
  test('notifie un suivi, un brouillon en attente et une dictée bloquée', () {
    final planned = planNotifications(
      todo: [
        item(TodoKind.followUp, followUpId: 'f-1'),
        item(TodoKind.readyToSend, reportId: 'r-1'),
        item(TodoKind.uploadBlocked, captureId: 'c-1'),
      ],
      alreadyNotified: const {},
    );

    expect(planned.map((n) => n.key), [
      'followup:f-1',
      'draft:r-1',
      'blocked:c-1',
    ]);
  });

  test('ne notifie jamais deux fois la même situation', () {
    final planned = planNotifications(
      todo: [item(TodoKind.followUp, followUpId: 'f-1')],
      alreadyNotified: const {'followup:f-1'},
    );

    expect(planned, isEmpty);
  });

  /// Déranger quelqu'un pour lui dire que tout va bien est le plus sûr moyen
  /// de lui faire ignorer la prochaine notification.
  test('ne notifie jamais une transcription en cours ni une réussite', () {
    final planned = planNotifications(
      todo: [
        item(TodoKind.transcribing),
        item(TodoKind.preparing, reportId: 'r-1'),
        item(TodoKind.pendingUpload),
        item(TodoKind.toAttach),
        item(TodoKind.transcriptToReview),
      ],
      alreadyNotified: const {},
    );

    expect(planned, isEmpty);
  });

  test('le texte dit le geste et mène à l\'écran qui le permet', () {
    final n = planNotifications(
      todo: [
        item(TodoKind.followUp, followUpId: 'f-1', patientName: 'Filou'),
      ],
      alreadyNotified: const {},
    ).single;

    expect(n.title, 'Filou : un propriétaire demande une action');
    expect(n.route, '/suivis/f-1');
  });

  test('un compte rendu à valider mène au compte rendu', () {
    final n = planNotifications(
      todo: [
        item(TodoKind.reportToValidate, reportId: 'r-1', patientName: 'Filou'),
      ],
      alreadyNotified: const {},
    ).single;

    expect(n.key, 'draft:r-1');
    expect(n.title, 'Filou : compte rendu en attente');
    expect(n.route, '/comptes-rendus/r-1');
  });

  test('une dictée bloquée renvoie à l\'accueil, où on la reprend', () {
    final n = planNotifications(
      todo: [item(TodoKind.uploadBlocked, captureId: 'c-9')],
      alreadyNotified: const {},
    ).single;

    expect(n.key, 'blocked:c-9');
    expect(n.title, "Une dictée n'a pas pu être envoyée");
    expect(n.route, '/');
  });

  /// Sans identifiant de rapport, la notification n'aurait nulle part où
  /// mener : mieux vaut se taire qu'ouvrir un écran vide.
  test('ne notifie pas un brouillon sans compte rendu à ouvrir', () {
    final planned = planNotifications(
      todo: [item(TodoKind.readyToSend)],
      alreadyNotified: const {},
    );

    expect(planned, isEmpty);
  });

  test('nomme sans nom d\'animal plutôt que de laisser un trou', () {
    final planned = planNotifications(
      todo: [
        item(TodoKind.followUp, followUpId: 'f-1'),
        item(TodoKind.readyToSend, reportId: 'r-1'),
      ],
      alreadyNotified: const {},
    );

    expect(planned.first.title, 'Un animal : un propriétaire demande une action');
    expect(planned.last.title, 'Une séance : compte rendu en attente');
  });
}
