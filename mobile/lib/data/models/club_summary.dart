import 'package:json_annotation/json_annotation.dart';

part 'club_summary.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class ClubFixtureEntry {
  final int? id;
  final int? event;
  final String opponentName;
  final String opponentShort;
  final int? opponentCode;
  final bool isHome;
  final int difficulty;
  final String? kickoffTime;
  final bool? finished;
  final String? score;
  final String? result;

  const ClubFixtureEntry({
    this.id,
    this.event,
    required this.opponentName,
    required this.opponentShort,
    this.opponentCode,
    required this.isHome,
    required this.difficulty,
    this.kickoffTime,
    this.finished,
    this.score,
    this.result,
  });

  factory ClubFixtureEntry.fromJson(Map<String, dynamic> json) =>
      _$ClubFixtureEntryFromJson(json);
  Map<String, dynamic> toJson() => _$ClubFixtureEntryToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class ClubTopPlayer {
  final int id;
  final String webName;
  final int totalPoints;
  final int elementType;
  final double cost;
  final String? photo;

  const ClubTopPlayer({
    required this.id,
    required this.webName,
    required this.totalPoints,
    required this.elementType,
    required this.cost,
    this.photo,
  });

  factory ClubTopPlayer.fromJson(Map<String, dynamic> json) =>
      _$ClubTopPlayerFromJson(json);
  Map<String, dynamic> toJson() => _$ClubTopPlayerToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class ClubSummary {
  final Map<String, dynamic> team;
  final List<ClubTopPlayer> topPlayers;
  final List<ClubFixtureEntry> upcomingFixtures;
  final List<ClubFixtureEntry> recentResults;

  const ClubSummary({
    required this.team,
    required this.topPlayers,
    required this.upcomingFixtures,
    required this.recentResults,
  });

  factory ClubSummary.fromJson(Map<String, dynamic> json) =>
      _$ClubSummaryFromJson(json);
  Map<String, dynamic> toJson() => _$ClubSummaryToJson(this);
}
