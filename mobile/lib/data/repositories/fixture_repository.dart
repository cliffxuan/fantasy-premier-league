import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/fixture.dart';
import '../models/fixture_ticker.dart';
import '../models/gameweek_status.dart';
import '../models/h2h_match.dart';
import '../models/polymarket_market.dart';

part 'fixture_repository.g.dart';

class FixtureRepository {
  final FplRemoteDatasource _datasource;

  FixtureRepository(this._datasource);

  Future<List<Fixture>> getFixtures({int? event}) {
    return _datasource.getFixtures(event: event);
  }

  Future<GameweekStatus> getCurrentGameweek() {
    return _datasource.getCurrentGameweek();
  }

  Future<List<H2hMatch>> getH2hHistory(int teamHId, int teamAId) {
    return _datasource.getH2hHistory(teamHId, teamAId);
  }

  Future<List<PolymarketMarket>> getPolymarketData() {
    return _datasource.getPolymarketData();
  }

  Future<List<FixtureTickerTeam>> getAdvancedFixtures({int? gw}) {
    return _datasource.getAdvancedFixtures(gw: gw);
  }
}

@Riverpod(keepAlive: true)
FixtureRepository fixtureRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return FixtureRepository(FplRemoteDatasource(client));
}
