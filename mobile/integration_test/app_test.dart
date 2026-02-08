import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:fpl_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('app launch test', (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Check if the app rendered. We check for FplApp widget to be robust
    // against different states (Login vs Squad view).
    expect(find.byType(app.FplApp), findsOneWidget);
  });
}
