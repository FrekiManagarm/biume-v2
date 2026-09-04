import 'package:biume_mobile/core/lifecycle/foreground_refresh.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('rafraîchit à la reprise au premier plan et jamais à la mise en pause', () {
    var calls = 0;
    final refresh = ForegroundRefresh(onForeground: () async => calls++);

    refresh.didChangeAppLifecycleState(AppLifecycleState.paused);
    expect(calls, 0);

    refresh.didChangeAppLifecycleState(AppLifecycleState.resumed);
    expect(calls, 1);
  });
}
