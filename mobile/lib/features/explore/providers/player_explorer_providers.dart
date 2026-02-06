import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/aggregated_player.dart';
import '../../../data/models/player_summary.dart';
import '../../../data/repositories/player_repository.dart';

part 'player_explorer_providers.g.dart';

@Riverpod(keepAlive: true)
class PlayerExplorerFilters extends _$PlayerExplorerFilters {
  @override
  ({int minGw, int maxGw, String venue, int? positionFilter, String? search})
      build() {
    return (
      minGw: 1,
      maxGw: 38,
      venue: 'both',
      positionFilter: null,
      search: null,
    );
  }

  void setGwRange(int min, int max) =>
      state = (minGw: min, maxGw: max, venue: state.venue, positionFilter: state.positionFilter, search: state.search);

  void setVenue(String venue) =>
      state = (minGw: state.minGw, maxGw: state.maxGw, venue: venue, positionFilter: state.positionFilter, search: state.search);

  void setPositionFilter(int? position) =>
      state = (minGw: state.minGw, maxGw: state.maxGw, venue: state.venue, positionFilter: position, search: state.search);

  void setSearch(String? search) =>
      state = (minGw: state.minGw, maxGw: state.maxGw, venue: state.venue, positionFilter: state.positionFilter, search: search);
}

@riverpod
Future<List<AggregatedPlayer>> aggregatedPlayers(Ref ref) {
  final filters = ref.watch(playerExplorerFiltersProvider);
  final repo = ref.watch(playerRepositoryProvider);
  return repo.getAggregatedPlayers(
    minGw: filters.minGw,
    maxGw: filters.maxGw,
    venue: filters.venue,
  );
}

@riverpod
Future<List<AggregatedPlayer>> filteredPlayers(Ref ref) async {
  final players = await ref.watch(aggregatedPlayersProvider.future);
  final filters = ref.watch(playerExplorerFiltersProvider);

  var result = players.toList();

  if (filters.positionFilter != null) {
    result = result.where((p) => p.elementType == filters.positionFilter).toList();
  }

  if (filters.search != null && filters.search!.isNotEmpty) {
    final query = filters.search!.toLowerCase();
    result = result.where((p) => p.webName.toLowerCase().contains(query)).toList();
  }

  result.sort((a, b) => b.pointsInRange.compareTo(a.pointsInRange));
  return result;
}

@riverpod
Future<PlayerSummary> playerSummary(Ref ref, int playerId, {int? opponentId}) {
  final repo = ref.watch(playerRepositoryProvider);
  return repo.getPlayerSummary(playerId, opponentId: opponentId);
}
