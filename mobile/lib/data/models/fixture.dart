import 'package:json_annotation/json_annotation.dart';

part 'fixture.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class Fixture {
  final int id;
  final int code;
  final int? event;
  final int teamH;
  final int teamA;
  final int? teamHScore;
  final int? teamAScore;
  final bool finished;
  final String? kickoffTime;
  final int minutes;
  final bool started;
  final bool finishedProvisional;
  final int teamHDifficulty;
  final int teamADifficulty;
  final String? teamHName;
  final String? teamAName;
  final String? teamHShort;
  final String? teamAShort;
  final int? teamHCode;
  final int? teamACode;
  final Map<String, dynamic>? historyStats;
  final Map<String, dynamic>? historyStatsVenue;

  const Fixture({
    required this.id,
    required this.code,
    this.event,
    required this.teamH,
    required this.teamA,
    this.teamHScore,
    this.teamAScore,
    this.finished = false,
    this.kickoffTime,
    this.minutes = 0,
    this.started = false,
    this.finishedProvisional = false,
    required this.teamHDifficulty,
    required this.teamADifficulty,
    this.teamHName,
    this.teamAName,
    this.teamHShort,
    this.teamAShort,
    this.teamHCode,
    this.teamACode,
    this.historyStats,
    this.historyStatsVenue,
  });

  bool isHomeFor(int teamId) => teamH == teamId;

  int? getOpponentId(int teamId) {
    if (teamH == teamId) return teamA;
    if (teamA == teamId) return teamH;
    return null;
  }

  int getDifficultyFor(int teamId) {
    if (teamH == teamId) return teamHDifficulty;
    if (teamA == teamId) return teamADifficulty;
    return 0;
  }

  factory Fixture.fromJson(Map<String, dynamic> json) =>
      _$FixtureFromJson(json);
  Map<String, dynamic> toJson() => _$FixtureToJson(this);
}
