import 'dart:io';

import 'package:biume_mobile/config/app_palette.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('palette', () {
    test("le violet d'action est celui du produit", () {
      expect(AppPalette.light.primary, const Color(0xFF6A52D6));
    });

    test("le vert d'état est celui du produit", () {
      expect(AppPalette.light.success, const Color(0xFF047857));
    });

    /// Le fond n'est jamais blanc : le blanc appartient aux surfaces posées
    /// dessus, sinon plus rien ne détache une carte de la page.
    test("le fond clair n'est pas blanc", () {
      expect(AppPalette.light.background, isNot(const Color(0xFFFFFFFF)));
      expect(AppPalette.light.surface, const Color(0xFFFFFFFF));
    });

    test('le sombre est une vraie apparence, pas une inversion', () {
      expect(AppPalette.dark.primary, const Color(0xFFA996F2));
      expect(AppPalette.dark.onPrimary, const Color(0xFF140E2B));
    });
  });

  group('dérive avec le web', () {
    /// Garde-fou de la même famille que celui du contrat d'API : la palette
    /// existe en plusieurs exemplaires, et seule la machine peut voir qu'ils
    /// divergent.
    test('les couleurs clés se retrouvent dans product.css', () {
      final css = File(
        '../../packages/ui/src/styles/product.css',
      ).readAsStringSync();

      expect(css, contains('#6a52d6'));
      expect(css, contains('#047857'));
      expect(css, contains('#f9fafb'));
      expect(css, contains('#a996f2'));
    });
  });
}
