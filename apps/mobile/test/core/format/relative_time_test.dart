import 'package:biume_mobile/core/format/relative_time.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final maintenant = DateTime(2026, 9, 8, 14, 30);

  test("moins d'une minute se dit « à l'instant »", () {
    expect(
      timeAgo(maintenant.subtract(const Duration(seconds: 20)), now: maintenant),
      "à l'instant",
    );
  });

  test('les minutes se comptent en minutes', () {
    expect(
      timeAgo(maintenant.subtract(const Duration(minutes: 40)), now: maintenant),
      'il y a 40 min',
    );
  });

  test('au-delà d\'une heure, en heures', () {
    expect(
      timeAgo(maintenant.subtract(const Duration(hours: 3)), now: maintenant),
      'il y a 3 h',
    );
  });

  test('la veille se dit « hier », pas « il y a 22 h »', () {
    expect(
      timeAgo(DateTime(2026, 9, 7, 16), now: maintenant),
      'hier',
    );
  });

  test('la semaine se compte en jours', () {
    expect(timeAgo(DateTime(2026, 9, 4, 9), now: maintenant), 'il y a 4 jours');
  });

  test('au-delà, en semaines', () {
    expect(
      timeAgo(DateTime(2026, 8, 10, 9), now: maintenant),
      'il y a 4 semaines',
    );
  });

  /// Une horloge de téléphone en avance sur le serveur produit un écart
  /// négatif. « dans 3 minutes » n'aiderait personne.
  test("une date dans le futur ne se dit pas au futur", () {
    expect(
      timeAgo(maintenant.add(const Duration(minutes: 3)), now: maintenant),
      "à l'instant",
    );
  });
}
