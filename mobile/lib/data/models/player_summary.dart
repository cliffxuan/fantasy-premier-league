import 'package:json_annotation/json_annotation.dart';

part 'player_summary.g.dart';

String? _toStr(dynamic value) => value?.toString();

@JsonSerializable(fieldRename: FieldRename.snake)
class PlayerHistoryEntry {
  final int element;
  final int fixture;
  final int opponentTeam;
  final String? opponentShortName;
  final int totalPoints;
  final bool wasHome;
  final String? kickoffTime;
  final int? teamHScore;
  final int? teamAScore;
  final int round;
  final int minutes;
  final int goalsScored;
  final int assists;
  final int cleanSheets;
  final int goalsConceded;
  final int ownGoals;
  final int penaltiesSaved;
  final int penaltiesMissed;
  final int yellowCards;
  final int redCards;
  final int saves;
  final int bonus;
  final int bps;
  @JsonKey(fromJson: _toStr)
  final String? influence;
  @JsonKey(fromJson: _toStr)
  final String? creativity;
  @JsonKey(fromJson: _toStr)
  final String? threat;
  @JsonKey(fromJson: _toStr)
  final String? ictIndex;
  final int value;
  @JsonKey(fromJson: _toStr)
  final String? expectedGoals;
  @JsonKey(fromJson: _toStr)
  final String? expectedAssists;
  @JsonKey(fromJson: _toStr)
  final String? expectedGoalInvolvements;
  @JsonKey(fromJson: _toStr)
  final String? expectedGoalsConceded;

  const PlayerHistoryEntry({
    required this.element,
    required this.fixture,
    required this.opponentTeam,
    this.opponentShortName,
    required this.totalPoints,
    required this.wasHome,
    this.kickoffTime,
    this.teamHScore,
    this.teamAScore,
    required this.round,
    required this.minutes,
    this.goalsScored = 0,
    this.assists = 0,
    this.cleanSheets = 0,
    this.goalsConceded = 0,
    this.ownGoals = 0,
    this.penaltiesSaved = 0,
    this.penaltiesMissed = 0,
    this.yellowCards = 0,
    this.redCards = 0,
    this.saves = 0,
    this.bonus = 0,
    this.bps = 0,
    this.influence,
    this.creativity,
    this.threat,
    this.ictIndex,
    this.value = 0,
    this.expectedGoals,
    this.expectedAssists,
    this.expectedGoalInvolvements,
    this.expectedGoalsConceded,
  });

  factory PlayerHistoryEntry.fromJson(Map<String, dynamic> json) =>
      _$PlayerHistoryEntryFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerHistoryEntryToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class PlayerFixtureEntry {
  final int id;
  final int? code;
  final int teamH;
  final int teamA;
  final String? teamHShort;
  final String? teamAShort;
  final int? event;
  final bool finished;
  final int minutes;
  final String? kickoffTime;
  final bool? isHome;
  final int? difficulty;

  const PlayerFixtureEntry({
    required this.id,
    this.code,
    required this.teamH,
    required this.teamA,
    this.teamHShort,
    this.teamAShort,
    this.event,
    this.finished = false,
    this.minutes = 0,
    this.kickoffTime,
    this.isHome,
    this.difficulty,
  });

  factory PlayerFixtureEntry.fromJson(Map<String, dynamic> json) =>
      _$PlayerFixtureEntryFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerFixtureEntryToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class PlayerVsOpponentEntry {
  final String season;
  @JsonKey(fromJson: _toStr)
  final String? date;
  final int gameweek;
  final int points;
  @JsonKey(fromJson: _toStr)
  final String? fixture;
  final int minutes;
  final int goalsScored;
  final int assists;
  final int bonus;
  final int bps;
  final int saves;
  final bool wasHome;
  final String? opponentName;

  const PlayerVsOpponentEntry({
    required this.season,
    this.date,
    required this.gameweek,
    required this.points,
    this.fixture,
    required this.minutes,
    this.goalsScored = 0,
    this.assists = 0,
    this.bonus = 0,
    this.bps = 0,
    this.saves = 0,
    required this.wasHome,
    this.opponentName,
  });

  factory PlayerVsOpponentEntry.fromJson(Map<String, dynamic> json) =>
      _$PlayerVsOpponentEntryFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerVsOpponentEntryToJson(this);
}

@JsonSerializable(fieldRename: FieldRename.snake)
class PlayerSummary {
  final List<PlayerHistoryEntry> history;
  final List<PlayerFixtureEntry> fixtures;
  final List<dynamic>? historyPast;
  final List<PlayerVsOpponentEntry>? historyVsOpponent;
  final String? nextOpponentName;

  const PlayerSummary({
    required this.history,
    required this.fixtures,
    this.historyPast,
    this.historyVsOpponent,
    this.nextOpponentName,
  });

  factory PlayerSummary.fromJson(Map<String, dynamic> json) =>
      _$PlayerSummaryFromJson(json);
  Map<String, dynamic> toJson() => _$PlayerSummaryToJson(this);
}
