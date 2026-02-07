class ApiConstants {
  ApiConstants._();

  // Change this to your backend URL
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://fpl.nuoya.co.uk/api',
  );

  // Endpoints
  static const String analyze = '/analyze';
  static const String analysisForm = '/analysis/form';
  static const String analysisTopManagers = '/analysis/top-managers';
  static const String teams = '/teams';
  static const String fixtures = '/fixtures';
  static const String polymarket = '/polymarket';
  static const String leagueTable = '/league-table';
  static const String gameweekCurrent = '/gameweek/current';
  static const String optimizationSolve = '/optimization/solve';
  static const String optimizationFixtures = '/optimization/fixtures';
  static const String playersAggregated = '/players/aggregated';
  static const String health = '/health';

  // Auth
  static const String authUrl = '/auth/url';
  static const String authCallback = '/auth/callback';
  static const String authRefresh = '/auth/refresh';
  static const String authMe = '/auth/me';

  static String teamSquad(int teamId) => '/team/$teamId/squad';
  static String myTeam(int teamId) => '/team/$teamId/my-team';
  static String clubSquad(int clubId) => '/club/$clubId/squad';
  static String clubSummary(int clubId) => '/club/$clubId/summary';
  static String playerSummary(int playerId) => '/player/$playerId/summary';
  static String dreamTeam(int gw) => '/dream-team/$gw';
  static String h2h(int teamHId, int teamAId) =>
      '/history/h2h/$teamHId/$teamAId';
}
