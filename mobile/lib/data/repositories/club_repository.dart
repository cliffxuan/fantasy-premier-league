import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/providers/dio_provider.dart';
import '../datasources/fpl_remote_datasource.dart';
import '../models/club_summary.dart';
import '../models/squad_response.dart';
import '../models/team.dart';

part 'club_repository.g.dart';

class ClubRepository {
  final FplRemoteDatasource _datasource;

  ClubRepository(this._datasource);

  Future<List<Team>> getTeams() {
    return _datasource.getTeams();
  }

  Future<SquadResponse> getClubSquad(int clubId, {int? gw}) {
    return _datasource.getClubSquad(clubId, gw: gw);
  }

  Future<ClubSummary> getClubSummary(int clubId) {
    return _datasource.getClubSummary(clubId);
  }
}

@Riverpod(keepAlive: true)
ClubRepository clubRepository(Ref ref) {
  final client = ref.watch(dioClientProvider);
  return ClubRepository(FplRemoteDatasource(client));
}
