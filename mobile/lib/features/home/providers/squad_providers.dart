import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/shared_prefs_provider.dart';
import '../../../data/models/analysis_request.dart';
import '../../../data/models/analysis_response.dart';
import '../../../data/models/gameweek_status.dart';
import '../../../data/models/squad_response.dart';
import '../../../data/repositories/analysis_repository.dart';
import '../../../data/repositories/fixture_repository.dart';
import '../../../data/repositories/squad_repository.dart';

part 'squad_providers.g.dart';

const _teamIdKey = 'team_id';
const _authTokenKey = 'auth_token';

@Riverpod(keepAlive: true)
class SavedTeamId extends _$SavedTeamId {
  @override
  int? build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    final id = prefs.getInt(_teamIdKey);
    return id;
  }

  void set(int id) {
    final prefs = ref.read(sharedPreferencesProvider);
    prefs.setInt(_teamIdKey, id);
    state = id;
  }

  void clear() {
    final prefs = ref.read(sharedPreferencesProvider);
    prefs.remove(_teamIdKey);
    state = null;
  }
}

@Riverpod(keepAlive: true)
class SavedAuthToken extends _$SavedAuthToken {
  @override
  String? build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return prefs.getString(_authTokenKey);
  }

  void set(String token) {
    final prefs = ref.read(sharedPreferencesProvider);
    prefs.setString(_authTokenKey, token);
    state = token;
  }

  void clear() {
    final prefs = ref.read(sharedPreferencesProvider);
    prefs.remove(_authTokenKey);
    state = null;
  }
}

@Riverpod(keepAlive: true)
class SelectedGameweek extends _$SelectedGameweek {
  @override
  int? build() => null;

  void set(int gw) => state = gw;
}

@riverpod
Future<GameweekStatus> currentGameweek(Ref ref) {
  final repo = ref.watch(fixtureRepositoryProvider);
  return repo.getCurrentGameweek();
}

@riverpod
Future<SquadResponse> squad(Ref ref) async {
  final teamId = ref.watch(savedTeamIdProvider);
  if (teamId == null) throw Exception('No team ID set');

  final selectedGw = ref.watch(selectedGameweekProvider);
  final authToken = ref.watch(savedAuthTokenProvider);
  final repo = ref.watch(squadRepositoryProvider);

  return repo.getSquad(teamId, gw: selectedGw, authToken: authToken);
}

@riverpod
class AnalysisState extends _$AnalysisState {
  @override
  AsyncValue<AnalysisResponse?> build() => const AsyncData(null);

  Future<void> analyze({
    required int teamId,
    required double moneyInBank,
    required int freeTransfers,
    bool transfersRolled = false,
    String? authToken,
  }) async {
    state = const AsyncLoading();
    try {
      final repo = ref.read(analysisRepositoryProvider);
      final result = await repo.analyzeTeam(
        AnalysisRequest(
          teamId: teamId,
          knowledgeGap: KnowledgeGapInput(
            moneyInBank: moneyInBank,
            freeTransfers: freeTransfers,
            transfersRolled: transfersRolled,
          ),
          authToken: authToken,
        ),
      );
      state = AsyncData(result);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }
}
