/// Game-related constants for Fantasy Premier League.
class FplConstants {
  FplConstants._();

  /// Maximum number of gameweeks in a season.
  static const int maxGameweek = 38;

  /// Minimum gameweek number.
  static const int minGameweek = 1;

  /// Default budget for squad optimisation (in £m).
  static const double defaultBudget = 100.0;

  /// Default number of top managers to fetch.
  static const int defaultTopManagersCount = 1000;

  /// Network connect timeout.
  static const Duration connectTimeout = Duration(seconds: 15);

  /// Network receive timeout.
  static const Duration receiveTimeout = Duration(seconds: 30);
}
