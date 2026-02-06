import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/league_table_entry.dart';
import '../../../data/repositories/league_repository.dart';
import '../../home/providers/squad_providers.dart';

part 'league_table_providers.g.dart';

@riverpod
class GwRange extends _$GwRange {
  @override
  RangeValues build() {
    // Initialize end to current gameweek when available
    final gwAsync = ref.watch(currentGameweekProvider);
    final maxGw = gwAsync.valueOrNull?.gameweek ?? 38;
    return RangeValues(1, maxGw.toDouble());
  }

  void set(RangeValues range) => state = range;
}

@riverpod
int maxGameweek(Ref ref) {
  final gwAsync = ref.watch(currentGameweekProvider);
  return gwAsync.valueOrNull?.gameweek ?? 38;
}

@riverpod
Future<List<LeagueTableEntry>> leagueTable(Ref ref) {
  final range = ref.watch(gwRangeProvider);
  final repo = ref.watch(leagueRepositoryProvider);
  return repo.getLeagueTable(
    minGw: range.start.round(),
    maxGw: range.end.round(),
  );
}
