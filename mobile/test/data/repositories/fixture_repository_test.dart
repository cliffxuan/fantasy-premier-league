import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:fpl_mobile/data/datasources/fpl_remote_datasource.dart';
import 'package:fpl_mobile/data/models/fixture.dart';
import 'package:fpl_mobile/data/repositories/fixture_repository.dart';

class MockFplRemoteDatasource extends Mock implements FplRemoteDatasource {}

void main() {
  late MockFplRemoteDatasource mockDatasource;
  late FixtureRepository repository;

  setUp(() {
    mockDatasource = MockFplRemoteDatasource();
    repository = FixtureRepository(mockDatasource);
  });

  group('getFixtures', () {
    final fixtures = [
      const Fixture(
        id: 1,
        code: 100,
        teamH: 10,
        teamA: 20,
        teamHDifficulty: 3,
        teamADifficulty: 4,
      ),
      const Fixture(
        id: 2,
        code: 101,
        teamH: 5,
        teamA: 15,
        teamHDifficulty: 2,
        teamADifficulty: 3,
      ),
    ];

    test('returns fixtures from datasource', () async {
      when(() => mockDatasource.getFixtures()).thenAnswer((_) async => fixtures);
      final result = await repository.getFixtures();
      expect(result, fixtures);
      verify(() => mockDatasource.getFixtures()).called(1);
    });

    test('passes event parameter to datasource', () async {
      when(() => mockDatasource.getFixtures(event: 5)).thenAnswer((_) async => [fixtures[0]]);
      final result = await repository.getFixtures(event: 5);
      expect(result.length, 1);
      verify(() => mockDatasource.getFixtures(event: 5)).called(1);
    });

    test('propagates exceptions from datasource', () async {
      when(() => mockDatasource.getFixtures()).thenThrow(Exception('Network error'));
      expect(
        () => repository.getFixtures(),
        throwsA(isA<Exception>()),
      );
    });
  });
}
