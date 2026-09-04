import 'package:drift/drift.dart';

import '../database/app_database.dart';

/// Ce dont le praticien a déjà été prévenu.
///
/// Derrière une interface pour que le cycle de réveil se teste sans base : la
/// règle « jamais deux fois » est une règle métier, pas une requête SQL.
abstract class NotificationMemory {
  Future<Set<String>> keys();
  Future<void> remember(Iterable<String> keys);
}

class DriftNotificationMemory implements NotificationMemory {
  DriftNotificationMemory(this._db, {DateTime Function()? now})
    : _now = now ?? DateTime.now;

  final AppDatabase _db;
  final DateTime Function() _now;

  @override
  Future<Set<String>> keys() async {
    final rows = await _db.select(_db.notifiedItems).get();
    return rows.map((row) => row.key).toSet();
  }

  /// `insertOrIgnore` : deux cycles qui se chevauchent peuvent planifier la
  /// même clé, et une contrainte violée ferait échouer tout le réveil pour
  /// une redite sans conséquence.
  @override
  Future<void> remember(Iterable<String> keys) async {
    if (keys.isEmpty) return;
    final notifiedAt = _now();
    await _db.batch((batch) {
      batch.insertAll(
        _db.notifiedItems,
        [
          for (final key in keys)
            NotifiedItemsCompanion.insert(key: key, notifiedAt: notifiedAt),
        ],
        mode: InsertMode.insertOrIgnore,
      );
    });
  }
}
