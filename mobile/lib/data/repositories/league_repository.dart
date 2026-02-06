import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/league_table_entry.dart';

part 'league_repository.g.dart';

class LeagueRepository {
  final FplRemoteDatasource _datasource;

  LeagueRepository(this._datasource);

  Future<List<LeagueTableEntry>> getLeagueTable({
    int minGw = 1,
    int maxGw = 38,
  }) {
    return _datasource.getLeagueTable(minGw: minGw, maxGw: maxGw);
  }
}

@Riverpod(keepAlive: true)
LeagueRepository leagueRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return LeagueRepository(FplRemoteDatasource(client));
}
