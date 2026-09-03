import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:flutter_test/flutter_test.dart';

TodoItem item(TodoKind kind, {String? reportId, String? appointmentId}) =>
    TodoItem(
      kind: kind,
      captureId: 'c-1',
      reportId: reportId,
      appointmentId: appointmentId,
      updatedAt: DateTime(2026, 9, 3),
    );

void main() {
  test('chaque genre a un libellé et aucun libellé n\'est un état machine', () {
    for (final kind in TodoKind.values) {
      final label = todoLabels[kind]!;
      expect(label, isNotEmpty);
      expect(label, isNot(matches(RegExp(r'^[a-z_]+$'))));
    }
  });

  test('mène à l\'écran qui répond au geste', () {
    expect(item(TodoKind.transcriptToReview).route, '/dictees/c-1/transcription');
    expect(item(TodoKind.toAttach).route, '/dictees/c-1/transcription?rattacher=1');
    expect(item(TodoKind.reportToValidate, reportId: 'r-1').route, '/comptes-rendus/r-1');
    expect(item(TodoKind.transcribing).route, isNull);
  });

  test('une valeur inconnue du serveur retombe sur un genre connu', () {
    expect(todoKindFromApi('quelque_chose_de_nouveau'), TodoKind.transcribing);
  });

  test('rattacher porte le rendez-vous quand il est connu', () {
    expect(
      item(TodoKind.toAttach, appointmentId: 'rdv-1').route,
      '/dictees/c-1/transcription?rattacher=1&rdv=rdv-1',
    );
  });

  test('les dictées locales non envoyées ne mènent nulle part', () {
    expect(item(TodoKind.pendingUpload).route, isNull);
    expect(item(TodoKind.uploadBlocked).route, isNull);
  });

  test('un compte rendu sans identifiant ne mène nulle part', () {
    expect(item(TodoKind.reportToValidate).route, isNull);
    expect(item(TodoKind.preparing).route, isNull);
    expect(item(TodoKind.readyToSend).route, isNull);
  });
}
