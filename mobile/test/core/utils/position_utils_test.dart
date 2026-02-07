import 'package:flutter_test/flutter_test.dart';
import 'package:fpl_mobile/core/utils/position_utils.dart';

void main() {
  group('getPositionName', () {
    test('maps element types to abbreviations', () {
      expect(getPositionName(1), 'GKP');
      expect(getPositionName(2), 'DEF');
      expect(getPositionName(3), 'MID');
      expect(getPositionName(4), 'FWD');
    });

    test('returns empty string for unknown type', () {
      expect(getPositionName(0), '');
      expect(getPositionName(99), '');
    });
  });

  group('getPositionFullName', () {
    test('maps element types to full names', () {
      expect(getPositionFullName(1), 'Goalkeeper');
      expect(getPositionFullName(2), 'Defender');
      expect(getPositionFullName(3), 'Midfielder');
      expect(getPositionFullName(4), 'Forward');
    });

    test('returns empty string for unknown type', () {
      expect(getPositionFullName(0), '');
      expect(getPositionFullName(99), '');
    });
  });
}
