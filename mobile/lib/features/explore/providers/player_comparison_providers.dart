import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/aggregated_player.dart';
import '../../../data/models/player_summary.dart';
import '../providers/player_explorer_providers.dart';

part 'player_comparison_providers.g.dart';

@Riverpod(keepAlive: true)
class PlayerComparisonSelection extends _$PlayerComparisonSelection {
  @override
  List<AggregatedPlayer> build() => [];

  void toggle(AggregatedPlayer player) {
    final current = [...state];
    final idx = current.indexWhere((p) => p.id == player.id);
    if (idx >= 0) {
      current.removeAt(idx);
    } else if (current.length < 5) {
      current.add(player);
    }
    state = current;
  }

  bool isSelected(int playerId) => state.any((p) => p.id == playerId);

  void clear() => state = [];
}

@Riverpod(keepAlive: true)
class ComparisonModeActive extends _$ComparisonModeActive {
  @override
  bool build() => false;

  void toggle() => state = !state;
  void disable() => state = false;
}

@riverpod
Future<Map<int, List<PlayerHistoryEntry>>> comparisonHistories(
  Ref ref,
) async {
  final players = ref.watch(playerComparisonSelectionProvider);
  final playerIds = players.map((p) => p.id).toList();

  // Fetch all summaries in parallel
  final futures = playerIds.map((id) => ref.watch(playerSummaryProvider(id).future));
  final summaries = await Future.wait(futures);

  return {
    for (int i = 0; i < playerIds.length; i++)
      playerIds[i]: summaries[i].history,
  };
}
