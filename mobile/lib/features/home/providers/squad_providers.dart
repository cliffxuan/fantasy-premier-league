import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/providers/dio_provider.dart';
import '../../../core/providers/shared_prefs_provider.dart';
import '../../../data/datasources/fpl_remote_datasource.dart';
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
const _refreshTokenKey = 'refresh_token';

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
    prefs.remove(_refreshTokenKey);
    state = null;
  }

  void setTokens(String accessToken, String refreshToken) {
    final prefs = ref.read(sharedPreferencesProvider);
    prefs.setString(_authTokenKey, accessToken);
    prefs.setString(_refreshTokenKey, refreshToken);
    state = accessToken;
  }

  String? getRefreshToken() {
    final prefs = ref.read(sharedPreferencesProvider);
    return prefs.getString(_refreshTokenKey);
  }

  Future<bool> refreshAccessToken() async {
    final refreshToken = getRefreshToken();
    if (refreshToken == null) return false;

    try {
      final client = ref.read(dioClientProvider);
      final datasource = FplRemoteDatasource(client);
      final result = await datasource.refreshToken(refreshToken);
      final newAccess = result['access_token'] as String?;
      final newRefresh = result['refresh_token'] as String?;
      if (newAccess != null && newRefresh != null) {
        setTokens(newAccess, newRefresh);
        return true;
      }
      return false;
    } catch (_) {
      clear();
      return false;
    }
  }

  Future<bool> login(String code) async {
    try {
      final client = ref.read(dioClientProvider);
      final datasource = FplRemoteDatasource(client);
      final result = await datasource.exchangeCode(code);
      final accessToken = result['access_token'] as String?;
      final refreshToken = result['refresh_token'] as String?;
      if (accessToken != null && refreshToken != null) {
        setTokens(accessToken, refreshToken);
        // Auto-fetch team ID from /me
        try {
          final me = await datasource.getMe(accessToken);
          final player = me['player'] as Map<String, dynamic>?;
          final entry = player?['entry'] as int?;
          if (entry != null) {
            ref.read(savedTeamIdProvider.notifier).set(entry);
          }
        } catch (_) {
          // Non-fatal: user can still enter team ID manually
        }
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
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

  // If no GW selected, fetch current GW from repo (or pass null if repo handles it)
  // But to reuse logic, let's just delegate.
  // Ideally we should know the current GW.
  // For now let's keep the old behavior but refactored:

  return ref.watch(squadForGameweekProvider(selectedGw).future);
}

@riverpod
Future<SquadResponse> squadForGameweek(Ref ref, int? gw) async {
  final teamId = ref.watch(savedTeamIdProvider);
  if (teamId == null) throw Exception('No team ID set');

  final authToken = ref.watch(savedAuthTokenProvider);
  final repo = ref.watch(squadRepositoryProvider);

  return repo.getSquad(teamId, gw: gw, authToken: authToken);
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
