import 'dart:math';

import 'package:biume_mobile/core/ids/uuid.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final v4 = RegExp(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  );

  test('produit un UUID version 4 en minuscules', () {
    for (var i = 0; i < 100; i++) {
      expect(uuidV4(), matches(v4));
    }
  });

  test('est déterministe pour une source aléatoire donnée', () {
    expect(uuidV4(random: Random(7)), uuidV4(random: Random(7)));
  });
}
