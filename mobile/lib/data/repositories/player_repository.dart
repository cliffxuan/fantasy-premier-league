import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/constants/fpl_constants.dart';
import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/aggregated_player.dart';
import '../models/player_summary.dart';

part 'player_repository.g.dart';

class PlayerRepository {
  final FplRemoteDatasource _datasource;

  PlayerRepository(this._datasource);

  Future<PlayerSummary> getPlayerSummary(int playerId, {int? opponentId}) {
    return _datasource.getPlayerSummary(playerId, opponentId: opponentId);
  }

  Future<List<AggregatedPlayer>> getAggregatedPlayers({
    int minGw = FplConstants.minGameweek,
    int maxGw = FplConstants.maxGameweek,
    String venue = 'both',
  }) {
    return _datasource.getAggregatedPlayers(
      minGw: minGw,
      maxGw: maxGw,
      venue: venue,
    );
  }
}

@Riverpod(keepAlive: true)
PlayerRepository playerRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return PlayerRepository(FplRemoteDatasource(client));
}
