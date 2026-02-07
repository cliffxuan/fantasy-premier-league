import 'package:flutter_test/flutter_test.dart';
import 'package:fpl_mobile/core/utils/formatters.dart';

void main() {
  group('formatCost', () {
    test('converts raw cost to display string', () {
      expect(formatCost(50), '£5.0m');
      expect(formatCost(100), '£10.0m');
      expect(formatCost(45), '£4.5m');
      expect(formatCost(123), '£12.3m');
    });

    test('handles zero', () {
      expect(formatCost(0), '£0.0m');
    });
  });

  group('formatDate', () {
    test('returns TBD for null', () {
      expect(formatDate(null), 'TBD');
    });

    test('formats a valid ISO date', () {
      final result = formatDate('2025-08-16T14:00:00Z');
      // The exact output depends on locale, but should contain the date parts
      expect(result, isNot('TBD'));
      expect(result, contains('16'));
      expect(result, contains('Aug'));
    });

    test('returns raw string for unparseable date', () {
      expect(formatDate('not-a-date'), 'not-a-date');
    });
  });

  group('formatShortDate', () {
    test('returns TBD for null', () {
      expect(formatShortDate(null), 'TBD');
    });

    test('formats a valid ISO date', () {
      final result = formatShortDate('2025-08-16T14:00:00Z');
      expect(result, isNot('TBD'));
      expect(result, contains('16'));
    });
  });

  group('formatPercent', () {
    test('returns 0% for null', () {
      expect(formatPercent(null), '0%');
    });

    test('appends percent sign', () {
      expect(formatPercent('25.5'), '25.5%');
      expect(formatPercent('0'), '0%');
      expect(formatPercent('100'), '100%');
    });
  });
}
