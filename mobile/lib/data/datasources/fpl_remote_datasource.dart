import '../../core/constants/api_constants.dart';
import '../../core/constants/fpl_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/analysis_request.dart';
import '../models/analysis_response.dart';
import '../models/aggregated_player.dart';
import '../models/club_summary.dart';
import '../models/dream_team_response.dart';
import '../models/fixture.dart';
import '../models/fixture_ticker.dart';
import '../models/form_player.dart';
import '../models/gameweek_status.dart';
import '../models/h2h_match.dart';
import '../models/league_table_entry.dart';
import '../models/player_summary.dart';
import '../models/polymarket_market.dart';
import '../models/solver_response.dart';
import '../models/squad_response.dart';
import '../models/team.dart';
import '../models/top_managers_response.dart';

class FplRemoteDatasource {
  final DioClient _client;

  FplRemoteDatasource(this._client);

  // --- Auth ---

  Future<String> getAuthUrl() async {
    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.authUrl,
    );
    return data['url'] as String;
  }

  Future<Map<String, dynamic>> exchangeCode(String code) async {
    final data = await _client.post<Map<String, dynamic>>(
      ApiConstants.authCallback,
      data: {'code': code},
    );
    return data;
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final data = await _client.post<Map<String, dynamic>>(
      ApiConstants.authRefresh,
      data: {'refresh_token': refreshToken},
    );
    return data;
  }

  Future<Map<String, dynamic>> getMe(String accessToken) async {
    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.authMe,
      headers: {'Authorization': 'Bearer $accessToken'},
    );
    return data;
  }

  // --- Squad ---

  Future<SquadResponse> getSquad(
    int teamId, {
    int? gw,
    String? authToken,
  }) async {
    final query = <String, dynamic>{};
    if (gw != null) query['gw'] = gw;

    final headers = <String, String>{};
    if (authToken != null && authToken.isNotEmpty) {
      headers['Authorization'] = authToken;
    }

    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.teamSquad(teamId),
      queryParameters: query.isNotEmpty ? query : null,
      headers: headers.isNotEmpty ? headers : null,
    );
    return SquadResponse.fromJson(data);
  }

  // --- Teams ---

  Future<List<Team>> getTeams() async {
    final data = await _client.get<List<dynamic>>(ApiConstants.teams);
    return data.map((e) => Team.fromJson(e as Map<String, dynamic>)).toList();
  }

  // --- Fixtures ---

  Future<List<Fixture>> getFixtures({int? event}) async {
    final query = <String, dynamic>{};
    if (event != null) query['event'] = event;

    final data = await _client.get<List<dynamic>>(
      ApiConstants.fixtures,
      queryParameters: query.isNotEmpty ? query : null,
    );
    return data
        .map((e) => Fixture.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // --- Gameweek ---

  Future<GameweekStatus> getCurrentGameweek() async {
    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.gameweekCurrent,
    );
    return GameweekStatus.fromJson(data);
  }

  // --- Analysis ---

  Future<AnalysisResponse> analyzeTeam(AnalysisRequest request) async {
    final data = await _client.post<Map<String, dynamic>>(
      ApiConstants.analyze,
      data: request.toJson(),
    );
    return AnalysisResponse.fromJson(data);
  }

  Future<List<FormPlayer>> getFormAnalysis() async {
    final data = await _client.get<List<dynamic>>(ApiConstants.analysisForm);
    return data
        .map((e) => FormPlayer.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<TopManagersResponse> getTopManagers({int? gw, int count = FplConstants.defaultTopManagersCount}) async {
    final query = <String, dynamic>{'count': count};
    if (gw != null) query['gw'] = gw;

    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.analysisTopManagers,
      queryParameters: query,
    );
    return TopManagersResponse.fromJson(data);
  }

  // --- Players ---

  Future<PlayerSummary> getPlayerSummary(int playerId, {int? opponentId}) async {
    final query = <String, dynamic>{};
    if (opponentId != null) query['opponent_id'] = opponentId;

    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.playerSummary(playerId),
      queryParameters: query.isNotEmpty ? query : null,
    );
    return PlayerSummary.fromJson(data);
  }

  Future<List<AggregatedPlayer>> getAggregatedPlayers({
    int minGw = FplConstants.minGameweek,
    int maxGw = FplConstants.maxGameweek,
    String venue = 'both',
  }) async {
    final data = await _client.get<List<dynamic>>(
      ApiConstants.playersAggregated,
      queryParameters: {
        'min_gw': minGw,
        'max_gw': maxGw,
        'venue': venue,
      },
    );
    return data
        .map((e) => AggregatedPlayer.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // --- Clubs ---

  Future<SquadResponse> getClubSquad(int clubId, {int? gw}) async {
    final query = <String, dynamic>{};
    if (gw != null) query['gw'] = gw;

    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.clubSquad(clubId),
      queryParameters: query.isNotEmpty ? query : null,
    );
    return SquadResponse.fromJson(data);
  }

  Future<ClubSummary> getClubSummary(int clubId) async {
    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.clubSummary(clubId),
    );
    return ClubSummary.fromJson(data);
  }

  // --- Dream Team ---

  Future<DreamTeamResponse> getDreamTeam(int gw) async {
    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.dreamTeam(gw),
    );
    return DreamTeamResponse.fromJson(data);
  }

  // --- League Table ---

  Future<List<LeagueTableEntry>> getLeagueTable({
    int minGw = FplConstants.minGameweek,
    int maxGw = FplConstants.maxGameweek,
  }) async {
    final data = await _client.get<List<dynamic>>(
      ApiConstants.leagueTable,
      queryParameters: {'min_gw': minGw, 'max_gw': maxGw},
    );
    return data
        .map((e) => LeagueTableEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // --- Optimization ---

  Future<SolverResponse> solvOptimization({
    double budget = FplConstants.defaultBudget,
    int? minGw,
    int? maxGw,
    bool excludeBench = false,
    bool excludeUnavailable = false,
    bool useMl = false,
  }) async {
    final query = <String, dynamic>{
      'budget': budget,
      'exclude_bench': excludeBench,
      'exclude_unavailable': excludeUnavailable,
      'use_ml': useMl,
    };
    if (minGw != null) query['min_gw'] = minGw;
    if (maxGw != null) query['max_gw'] = maxGw;

    final data = await _client.get<Map<String, dynamic>>(
      ApiConstants.optimizationSolve,
      queryParameters: query,
    );
    return SolverResponse.fromJson(data);
  }

  Future<List<FixtureTickerTeam>> getAdvancedFixtures({int? gw}) async {
    final query = <String, dynamic>{};
    if (gw != null) query['gw'] = gw;

    final data = await _client.get<List<dynamic>>(
      ApiConstants.optimizationFixtures,
      queryParameters: query.isNotEmpty ? query : null,
    );
    return data
        .map((e) => FixtureTickerTeam.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // --- H2H ---

  Future<List<H2hMatch>> getH2hHistory(int teamHId, int teamAId) async {
    final data = await _client.get<List<dynamic>>(
      ApiConstants.h2h(teamHId, teamAId),
    );
    return data
        .map((e) => H2hMatch.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // --- Polymarket ---

  Future<List<PolymarketMarket>> getPolymarketData() async {
    final data = await _client.get<List<dynamic>>(ApiConstants.polymarket);
    return data
        .map((e) => PolymarketMarket.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
