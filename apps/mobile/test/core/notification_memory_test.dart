import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/notifications/notification_memory.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late DriftNotificationMemory memory;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    memory = DriftNotificationMemory(db, now: () => DateTime.utc(2026, 9, 3));
  });
  tearDown(() => db.close());

  test('ne se souvient de rien au premier réveil', () async {
    expect(await memory.keys(), isEmpty);
  });

  test('se souvient de ce qui a été notifié', () async {
    await memory.remember(['followup:f-1', 'draft:r-1']);

    expect(await memory.keys(), {'followup:f-1', 'draft:r-1'});
  });

  /// Deux cycles peuvent planifier la même clé si le premier n'a pas fini
  /// d'écrire : la seconde écriture doit être sans effet, jamais une erreur
  /// de contrainte qui ferait échouer tout le réveil.
  test('réécrire une clé déjà connue ne lève pas', () async {
    await memory.remember(['followup:f-1']);

    await expectLater(memory.remember(['followup:f-1']), completes);
    expect(await memory.keys(), {'followup:f-1'});
  });

  test('se souvenir de rien ne fait rien', () async {
    await memory.remember(const []);

    expect(await memory.keys(), isEmpty);
  });

  /// La mémoire dit « je l'ai déjà dit à cette personne, dans ce cabinet ».
  /// Changer d'entreprise ou se déconnecter la rend fausse.
  test('le vidage du cache de lecture oublie ce qui a été notifié', () async {
    await memory.remember(['followup:f-1']);

    await db.clearReadCache();

    expect(await memory.keys(), isEmpty);
  });
}
