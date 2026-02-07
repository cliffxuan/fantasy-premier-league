import 'package:flutter_test/flutter_test.dart';
import 'package:fpl_mobile/data/models/fixture.dart';

void main() {
  Fixture makeFixture({
    int teamH = 10,
    int teamA = 20,
    int teamHDifficulty = 3,
    int teamADifficulty = 4,
  }) {
    return Fixture(
      id: 1,
      code: 100,
      event: 1,
      teamH: teamH,
      teamA: teamA,
      teamHDifficulty: teamHDifficulty,
      teamADifficulty: teamADifficulty,
    );
  }

  group('isHomeFor', () {
    test('returns true for home team', () {
      final fixture = makeFixture();
      expect(fixture.isHomeFor(10), true);
    });

    test('returns false for away team', () {
      final fixture = makeFixture();
      expect(fixture.isHomeFor(20), false);
    });

    test('returns false for unrelated team', () {
      final fixture = makeFixture();
      expect(fixture.isHomeFor(99), false);
    });
  });

  group('getOpponentId', () {
    test('home team gets away opponent', () {
      final fixture = makeFixture();
      expect(fixture.getOpponentId(10), 20);
    });

    test('away team gets home opponent', () {
      final fixture = makeFixture();
      expect(fixture.getOpponentId(20), 10);
    });

    test('unrelated team returns null', () {
      final fixture = makeFixture();
      expect(fixture.getOpponentId(99), null);
    });
  });

  group('getDifficultyFor', () {
    test('home team gets home difficulty', () {
      final fixture = makeFixture(teamHDifficulty: 3, teamADifficulty: 5);
      expect(fixture.getDifficultyFor(10), 3);
    });

    test('away team gets away difficulty', () {
      final fixture = makeFixture(teamHDifficulty: 3, teamADifficulty: 5);
      expect(fixture.getDifficultyFor(20), 5);
    });

    test('unrelated team returns 0', () {
      final fixture = makeFixture();
      expect(fixture.getDifficultyFor(99), 0);
    });
  });

  group('JSON round-trip', () {
    test('fromJson and toJson preserve data', () {
      final json = {
        'id': 42,
        'code': 200,
        'event': 5,
        'team_h': 1,
        'team_a': 2,
        'team_h_score': 3,
        'team_a_score': 1,
        'finished': true,
        'kickoff_time': '2025-08-16T14:00:00Z',
        'minutes': 90,
        'started': true,
        'finished_provisional': true,
        'team_h_difficulty': 2,
        'team_a_difficulty': 4,
        'team_h_name': 'Arsenal',
        'team_a_name': 'Chelsea',
        'team_h_short': 'ARS',
        'team_a_short': 'CHE',
        'team_h_code': 3,
        'team_a_code': 8,
      };

      final fixture = Fixture.fromJson(json);
      expect(fixture.id, 42);
      expect(fixture.teamH, 1);
      expect(fixture.teamA, 2);
      expect(fixture.teamHScore, 3);
      expect(fixture.teamAScore, 1);
      expect(fixture.finished, true);
      expect(fixture.teamHName, 'Arsenal');
      expect(fixture.teamAShort, 'CHE');

      final output = fixture.toJson();
      expect(output['id'], 42);
      expect(output['team_h'], 1);
      expect(output['team_a'], 2);
      expect(output['team_h_score'], 3);
      expect(output['team_h_name'], 'Arsenal');
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 1,
        'code': 100,
        'team_h': 10,
        'team_a': 20,
        'team_h_difficulty': 3,
        'team_a_difficulty': 4,
      };

      final fixture = Fixture.fromJson(json);
      expect(fixture.event, null);
      expect(fixture.teamHScore, null);
      expect(fixture.teamAScore, null);
      expect(fixture.kickoffTime, null);
      expect(fixture.teamHName, null);
    });
  });
}
