import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/fixture.dart';
import '../../../data/models/h2h_match.dart';
import '../../../data/models/polymarket_market.dart';
import '../../../data/repositories/fixture_repository.dart';
import '../../home/providers/squad_providers.dart';

part 'fixtures_providers.g.dart';

@riverpod
Future<List<Fixture>> fixtures(Ref ref) async {
  final gwStatus = await ref.watch(currentGameweekProvider.future);
  final repo = ref.watch(fixtureRepositoryProvider);
  return repo.getFixtures(event: gwStatus.gameweek);
}

@riverpod
Future<List<Fixture>> fixturesForGw(Ref ref, int gw) {
  final repo = ref.watch(fixtureRepositoryProvider);
  return repo.getFixtures(event: gw);
}

@riverpod
Future<List<PolymarketMarket>> polymarketData(Ref ref) {
  final repo = ref.watch(fixtureRepositoryProvider);
  return repo.getPolymarketData();
}

@riverpod
Future<List<H2hMatch>> h2hHistory(Ref ref, int teamHId, int teamAId) {
  final repo = ref.watch(fixtureRepositoryProvider);
  return repo.getH2hHistory(teamHId, teamAId);
}
