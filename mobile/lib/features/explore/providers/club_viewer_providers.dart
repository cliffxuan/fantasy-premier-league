import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/club_summary.dart';
import '../../../data/models/team.dart';
import '../../../data/repositories/club_repository.dart';

part 'club_viewer_providers.g.dart';

@riverpod
Future<List<Team>> allTeams(Ref ref) {
  final repo = ref.watch(clubRepositoryProvider);
  return repo.getTeams();
}

@Riverpod(keepAlive: true)
class SelectedClubId extends _$SelectedClubId {
  @override
  int? build() => null;

  void set(int id) => state = id;
}

@riverpod
Future<ClubSummary> clubSummary(Ref ref, int clubId) {
  final repo = ref.watch(clubRepositoryProvider);
  return repo.getClubSummary(clubId);
}
